const { ljp_req } = require('./request');
const { generateId } = require('./util');

/**
 * @class LJPNode
 * @implements {NODE}
 */
class LJPNode {
  constructor(sdk, node_data) {
    this._sdk = sdk;
    this._data = node_data;
  }

  get org_id() {
    return this._data.o;
  }

  get node_id() {
    return this._data.n;
  }

  get title() {
    return this._data.t;
  }

  get temp_id() {
    return this._data.e._sys_temp?.[0] ?? 'ff';
  }

  get prop() {
    return this._data.e._sys_temp[1].map((p, i) => {
      if (this._data.e._sys_attach?.[i]) {
        return { url: this._data.e._sys_attach[i], name: p };
      }
      if (this._data.e._sys_cascade?.[i]) {
        return { tag: this._data.e._sys_cascade[i], id: p };
      }
      return p;
    });
  }

  getPropIndexByName(name) {
    return this._sdk.getPropIndexByName(this.temp_id, name);
  }

  getStatusIndexByName(name) {
    return this._sdk.getStatusIndexByName(this.temp_id, name);
  }

  getPropByName(name) {
    const i = this.getPropIndexByName(name);
    /**
     * @type {PROP}
     */
    let p = this._data.e._sys_temp[1][i];
    if (this._data.e._sys_attach?.[i]) {
      p =
        /**
         * @type {FILE_PROP}
         */
        { url: this._data.e._sys_attach[i], name: p };
    } else if (this._data.e._sys_cascade?.[i]) {
      p =
        /**
         * @type {CASCADE_PROP}
         */
        { tag: this._data.e._sys_cascade[i], id: p };
    }
    return p;
  }

  get status_index() {
    return this._data.e._sys_task_status?.index;
  }

  get status_prop() {
    return this._data.e._sys_task_status?.prop;
  }

  set_title(title) {
    return ljp_req('/docapi/node/modify', {
      org_id: this.org_id,
      node: { node_id: this.node_id, title },
    }).then((ret) => ret?.data?.status === 'ok');
  }

  set_prop(index, value) {
    if (!Array.isArray(index)) {
      index = [index];
      value = [value];
    }
    const index_list = index.map((n) => (typeof n === 'number' ? n : this.getPropIndexByName(n)));
    const v = [];
    const body = {
      org_id: this.org_id,
      node_id: this.node_id,
      temp_id: this.temp_id,
      index: index_list,
      value: v,
    };
    for (let i = 0; i < value.length; i++) {
      if (value[i]?.url) {
        v.push(value[i]?.name);
        if (body.attachment) {
          body.attachment[index_list[i]] = value[i]?.url;
        } else {
          body.attachment = { [index_list[i]]: value[i]?.url };
        }
      } else if (value[i]?.id) {
        v.push(value[i]?.tag);
        if (body.cascade) {
          body.cascade[index_list[i]] = value[i]?.id;
        } else {
          body.cascade = { [index_list[i]]: value[i]?.id };
        }
      } else {
        v.push(value[i]);
      }
    }
    return ljp_req('/docapi/updateProp', body).then((ret) => ret?.data?.status === 'ok');
  }

  set_status_index(index, prop) {
    if (typeof index === 'string') index = this.getStatusIndexByName(index);
    const body = {
      org_id: this.org_id,
      temp_id: this.temp_id,
      node: {
        node_id: this.node_id,
      },
      index,
      owner: prop[0] ?? null,
      user: prop[1] ?? [],
      startTime: prop[2] ?? null,
      endTime: prop[3] ?? null,
      statusCommit: prop[4] ?? null,
    };
    return ljp_req('/docapi/setAction', body).then((ret) => ret?.data?.status === 'ok');
  }

  move_to(parent_id, sibling_id) {
    const body = {
      org_id: this.org_id,
      nodeId: this.node_id,
      parentId: parent_id,
      siblingId: sibling_id,
    };
    return ljp_req('/docapi/node/move', body).then((ret) => ret?.data?.status === 'ok');
  }

  del(recycle) {
    if (recycle) {
      const body = {
        org_id: this.org_id,
        nodeId: this.node_id,
      };
      return ljp_req('/docapi/moveToRecycle', body).then((ret) => ret?.data?.status === 'ok');
    } else {
      const body = {
        items: { [this.org_id]: [this.node_id] },
      };
      return ljp_req('/docapi/node/remove', body).then((ret) => ret?.data?.status === 'ok');
    }
  }

  _split_prop(prop) {
    if (Array.isArray(prop.url)) {
      return { prop: prop.name, sys_prop: { _sys_attach: prop.url } };
    }
    if (Array.isArray(prop.id)) {
      return { prop: prop.id, sys_prop: { _sys_cascade: prop.tag } };
    }
    return { prop, sys_prop: {} };
  }

  _assign_prop(ret, prop, i) {
    const r = this._split_prop(prop);
    ret.prop[i] = r.prop;
    for (const key in r.sys_prop) {
      if (key in ret.sys_prop) {
        ret.sys_prop[key][i] = r.sys_prop[key];
      } else {
        ret.sys_prop[key] = { [i]: r.sys_prop[key] };
      }
    }
  }

  _convert_prop(temp_info, prop) {
    const ret = { prop: [], sys_prop: {} };
    for (const prop of temp_info.prop) ret.prop.push(null);
    if (Array.isArray(prop)) {
      for (let i = 0; i < prop.length; i++) {
        this._assign_prop(ret, prop[i], i);
      }
    } else {
      for (const prop_name in prop) {
        const i = this._sdk.getPropIndexByName(prop_name);
        this._assign_prop(ret, prop[prop_name], i);
      }
    }
    return ret;
  }

  async insert_children(children, sibling_id) {
    if (children?.length) {
      const body = {
        node: [],
        parentId: this.node_id,
        siblingId: sibling_id,
        org_id: this.org_id,
      };
      const node_id_list = [];
      for (const child of children) {
        if (!(child.temp_id in this._sdk._temp_map)) continue;
        const new_node_id = generateId();
        node_id_list.push(new_node_id);
        const temp_info = this._sdk._temp_map[child.temp_id];
        const { prop, sys_prop } = this._convert_prop(temp_info, child.prop);
        const node = {
          node_id: new_node_id,
          title: child.title,
          prop: {
            ...sys_prop,
            _sys_temp: [temp_info.temp_id, prop],
            _sys_task_status: {
              index:
                typeof child.status_index === 'number'
                  ? child.status_index
                  : this._sdk.getStatusIndexByName(child.status_index),
            },
          },
        };
        body.node.push(node);
      }
      if (body.node.length === 0) return [];
      await ljp_req('/docapi/node/insert', body)
        .then((ret) => ret?.data?.status === 'ok')
        .catch(console.error);
      return await this._sdk.getNodes(node_id_list);
    }
    return [];
  }
}

/**
 * @class SDK
 * @implements {LJP_SDK}
 */
class SDK {
  constructor(org_id) {
    this._org_id = org_id;
    /**
     * @type {{root_id: NODE_ID, to_sort: NODE_ID}| null}
     * @private
     */
    this._special_node = null;
    this._nick_name_map = null;
    this._temp_map = null;
  }

  async init() {
    await this._update_special_node();
    await this._update_temp_map();
    return true;
  }

  async _update_special_node() {
    const ret = await ljp_req('/api/getSpecialNode', { org_id: this._org_id });
    this._special_node = ret.data.data;
  }

  async _update_temp_map() {
    const ret = await ljp_req('/api/getTempMap', { org_id: this._org_id });
    this._temp_map = ret.data.data;
  }

  _convertNode(node) {
    return new LJPNode(this, node);
  }

  async getNodes(node_id_list) {
    const ret = await ljp_req('/docapi/getNodeNew', {
      org_id: this._org_id,
      node_id: node_id_list,
    });
    return ret.data.data.map(this._convertNode.bind(this));
  }

  async getRootNode() {
    if (!this._special_node) await this._update_special_node();
    return (await this.getNodes([this._special_node.root_id]))[0];
  }

  async getTempNode(temp_id) {
    if (!this._temp_map) await this._update_temp_map();
    if (!(temp_id in this._temp_map)) throw new Error(`找不到主题类型: ${temp_id}`);
    const node_id_list = (
      await ljp_req('/docapi/getNodeByFilter', {
        org_id: this._org_id,
        temp_id: this._temp_map[temp_id].temp_id,
        onlyId: true,
      })
    ).data.data;
    return await this.getNodes(node_id_list);
  }

  async getNicknameMap() {
    if (!this._nick_name_map) {
      const ret = await ljp_req('/api/getOrgNickNameMap', { org_id: this._org_id });
      this._nick_name_map = ret.data.data;
    }
    return { ...this._nick_name_map };
  }

  getPropIndexByName(temp_id, name) {
    return this._temp_map[temp_id].prop.findIndex((n) => n?.name === name);
  }

  getStatusIndexByName(temp_id, name) {
    return this._temp_map[temp_id].task_status.findIndex((n) => n?.name === name);
  }

  async updateVersion() {
    return true;
  }
}

module.exports = SDK;
