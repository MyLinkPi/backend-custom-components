const { ljp_req, checkLogin } = require('./request');
const { generateId, md5, IsTempId } = require('./util');
const fs = require('node:fs');
const path = require('node:path');
const OSS = require('ali-oss');
const axios = require('axios');
const Delta = require('quill-delta');
const env = require('./env');
const url = require('node:url');
const NODE_STATUS = {
  draft: {
    index: -2,
    name: 'draft/草稿',
  },
  deleted: {
    index: -1,
    name: 'deleted/删除',
  },
  normal: {
    index: 0,
    name: 'normal/正常',
  },
  unknown: {
    index: 1,
    name: 'unknown',
  },
  recycle: {
    index: 2,
    name: 'recycle/回收站',
  },
};

/**
 * @class LJPNode
 * @implements {NODE}
 */
class LJPNode {
  /**
   *
   * @param {SDK} sdk
   * @param node_data
   */
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

  get create_time() {
    return this._data.h;
  }

  get creator() {
    return this._data.i;
  }

  get modifier() {
    return this._data.d;
  }

  get update_time() {
    return this._data.m;
  }

  get title() {
    return this._data.t;
  }

  get temp_name() {
    return this._sdk.getTempNameById(this.temp_id);
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
      if (this._data.e._sys_location?.[i]) {
        return this._data.e._sys_location[i];
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
    if (this._data.e._sys_location?.[i]) {
      p = this._data.e._sys_location[i];
    } else if (this._data.e._sys_attach?.[i]) {
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

  get status_name() {
    return this._sdk.getStatusNameByIndex(this.temp_id, this.status_index);
  }

  get status_index() {
    return this._data.e._sys_task_status?.index;
  }

  get status_prop() {
    return this._data.e._sys_task_status?.prop;
  }

  /**
   *
   * @type {{readonly which: (string), index: *, is: {normal: boolean, deleted: boolean, draft: boolean, recycle: boolean}}}
   */
  get node_status() {
    let f = this._data.f;
    return {
      index: f,
      is: {
        draft: f === NODE_STATUS.draft.index,
        deleted: f === NODE_STATUS.deleted.index,
        normal: f === NODE_STATUS.normal.index,
        unknown: f === NODE_STATUS.unknown.index,
        recycle: f === NODE_STATUS.recycle.index,
      },
      get which() {
        const status_key = Object.keys(NODE_STATUS).find((key) => NODE_STATUS[key].index === f);
        return NODE_STATUS[status_key].name;
      },
    };
  }

  get parent() {
    return this._data.p;
  }

  get first_child() {
    return this._data.c;
  }

  get last_child() {
    return this._data.s;
  }

  get elder_brother() {
    //哥哥
    return this._data.x;
  }

  get little_brother() {
    //弟弟
    return this._data.j;
  }

  get version() {
    return this._data.v;
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
      if (Array.isArray(value[i]) && typeof value[i][0]?.lat === 'number') {
        v.push(value[i].map((n) => n?.name ?? '未知地点'));
        if (body.location) {
          body.location[index_list[i]] = value[i];
        } else {
          body.location = { [index_list[i]]: value[i] };
        }
      } else if (value[i]?.url) {
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
      node: [this.node_id],
      index,
      owner: prop[0] ?? null,
      user: prop[1] ?? [],
      startTime: prop[2] ?? null,
      endTime: prop[3] ?? null,
      statusCommit: prop[4] ?? null,
    };
    return ljp_req('/docapi/setAction', body).then((ret) => ret?.data?.status === 'ok');
  }

  set_sys_prop(prop_name_list, value_list) {
    const body = {
      org_id: this.org_id,
      node_id: this.node_id,
      key: prop_name_list,
      value: value_list,
    };
    return ljp_req('/docapi/node/modifySysProp', body).then((ret) => ret?.data?.status === 'ok');
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
        const i = this._sdk.getPropIndexByName(temp_info.temp_id, prop_name);
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
          content: child.content,
          prop: {
            ...sys_prop,
            _sys_temp: [temp_info.temp_id, prop],
            _sys_task_status: {
              index:
                typeof child.status_index === 'number'
                  ? child.status_index
                  : this._sdk.getStatusIndexByName(temp_info.temp_id, child.status_index),
              prop: Array.isArray(child.status_prop) ? child.status_prop : [null, [], null, null],
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

  async send_message(message, no_auto = true) {
    if (typeof message === 'string') {
      message = new Delta().insert(message);
    }
    const body = {
      org_id: this.org_id,
      node_id: this.node_id,
      message: { c: message },
      no_auto: true,
    };
    return ljp_req('/docapi/sendMessage', body).then((ret) => ret?.data?.status === 'ok');
  }

  children() {
    return this._sdk.getChildNodes(this.node_id);
  }

  get_url() {
    return `${env.LJP_URL_PREFIX}${env.LJP_URL_PREFIX.endsWith('/') ? '' : '/'}home/${this.org_id}/${this._sdk._special_node.root_id}/${this.node_id}`;
  }

  async insert_doc(text) {
    return false;
  }
}

/**
 * @class SDK
 * @implements {LJP_SDK}
 */
class SDK {
  constructor(org_id) {
    if (!org_id)
      throw new Error('missing org_id when creating SDK instance, check your env.js : TEST_ORG');
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
    if (!(await checkLogin())) {
      throw new Error('没有登陆');
    }
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
    for (const temp_info of Object.values(this._temp_map)) {
      temp_info.org_id = temp_info.org_id.toUpperCase();
      temp_info.temp_id = temp_info.temp_id.toUpperCase();
      temp_info.creator = temp_info.creator.toUpperCase();
    }
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

  async getChildNodes(parent_id) {
    const ret = await ljp_req('/docapi/getChildren', {
      org_id: this._org_id,
      node_id: parent_id,
      self: false,
      deep: 1,
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

  async searchNode(
    temp_id,
    temp_prop_map,
    status,
    create_time,
    modify_time,
    create_user,
    modify_user,
    title,
    tag,
  ) {
    if (!this._temp_map) await this._update_temp_map();
    if (!(temp_id in this._temp_map)) throw new Error(`找不到主题类型: ${temp_id}`);
    const prop = {
      org_id: this._org_id,
      temp_id: this._temp_map[temp_id].temp_id,
      onlyId: true,
    };
    const tempProps = [];
    if (Array.isArray(temp_prop_map)) {
      for (const prop of temp_prop_map) {
        if (!prop.value?.length) continue;
        const index =
          typeof prop.index === 'string'
            ? this.getPropIndexByName(temp_id, prop.index)
            : prop.index;
        if (prop.op === 'or') {
          tempProps.push(prop.value.map((v) => `p${index}-${v}`));
        } else {
          for (const v of prop.value) {
            tempProps.push(`p${index}-${v}`);
          }
        }
      }
    }
    if (status) {
      if (Array.isArray(status.status_index) && status.status_index.length) {
        tempProps.push(
          status.status_index.map(
            (index) =>
              `si-${typeof index === 'string' ? this.getStatusIndexByName(temp_id, index) : index}`,
          ),
        );
      }
      if (Array.isArray(status.status_owner) && status.status_owner.length) {
        tempProps.push(status.status_owner.map((ad) => `s0-${ad}`));
      }
      if (status.status_user) {
        if (status.status_user.op === 'or') {
          tempProps.push(status.status_user.ad.map((ad) => `s1-${ad}`));
        } else {
          for (const ad of status.status_user.ad) {
            tempProps.push(`s1-${ad}`);
          }
        }
      }
      if (status.status_start_time) {
        prop.startTime = [status.status_start_time.begin, status.status_start_time.end];
      }
      if (status.status_end_time) {
        prop.endTime = [status.status_end_time.begin, status.status_end_time.end];
      }
    }
    if (create_time) {
      prop.createTime = [create_time.begin, create_time.end];
    }
    if (modify_time) {
      prop.modifyTime = [modify_time.begin, modify_time.end];
    }
    if (Array.isArray(create_user)) {
      prop.createUser = create_user;
    }
    if (Array.isArray(modify_user)) {
      prop.modifyUser = modify_user;
    }
    if (Array.isArray(title)) {
      prop.keyWords = title;
      prop.onlyTitle = true;
    }
    if (tag) {
      if (tag.op === 'or') {
        tempProps.push(tag.value.map((v) => `t-${v}`));
      } else {
        for (const v of tag.value) {
          tempProps.push(`t-${v}`);
        }
      }
    }
    if (tempProps.length) {
      prop.tempProps = tempProps;
    }
    const node_id_list = (await ljp_req('/docapi/getNodeByFilter', prop)).data.data;
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

  getStatusNameByIndex(temp_id, index) {
    return this._temp_map[temp_id].task_status[index]?.name ?? '未知状态';
  }

  getStatusIndexByName(temp_id, name) {
    return this._temp_map[temp_id].task_status.findIndex((n) => n?.name === name);
  }

  getTempNameById(temp_id) {
    return this._temp_map[temp_id].name;
  }

  getTempIdByName(name) {
    return this._temp_map[name].temp_id;
  }

  async updateVersion() {
    return true;
  }

  async uploadFile(node_id, file_name, data = null) {
    const file_length = Math.ceil((data ? data.length : fs.statSync(file_name).size) / 1024);
    const file_data = data ? data : fs.readFileSync(file_name);
    const md5sum = md5(file_data);
    const ret = await ljp_req('/api/file/check_upload', {
      org_id: this._org_id,
      node_id,
      file_length,
      file_name: path.basename(file_name),
      md5: md5sum,
    });
    if (ret.data?.status !== 'ok') throw new Error('无法上传:' + ret.data?.message);
    if (ret.data.message === '已经上传') {
      return { url: [ret.data.data], name: [path.basename(file_name)] };
    } else {
      const oss_client = new OSS({
        region: ret.data.region,
        bucket: ret.data.bucket,
        authorizationV4: true,
        stsToken: ret.data.token.SecurityToken,
        accessKeyId: ret.data.token.AccessKeyId,
        accessKeySecret: ret.data.token.AccessKeySecret,
        refreshSTSToken: () => ({
          stsToken: ret.data.token.SecurityToken,
          accessKeyId: ret.data.token.AccessKeyId,
          accessKeySecret: ret.data.token.AccessKeySecret,
        }),
        refreshSTSTokenInterval: 60_000,
      });
      const upload_file = `${generateId()}.${path.basename(file_name).split('.').pop()}`;
      await oss_client.put(
        path.join(ret.data.prefix, 'upload', upload_file).replace('\\', '/'),
        file_data,
      );
      const ret2 = await ljp_req('/api/file/store', {
        org_id: this._org_id,
        node_id,
        path: upload_file,
      });
      if (ret2.data?.status !== 'ok') throw new Error('无法上传:' + ret2.data?.message);
      return { url: [ret2.data.data], name: [path.basename(file_name)] };
    }
  }

  request(req) {
    const config = {};
    if ('timeout' in req) config.timeout = req.timeout;
    if ('headers' in req) config.headers = req.headers;
    switch (req.method.toLowerCase()) {
      case 'get':
        return axios.get(req.uri, config).then((d) => d.data);
      case 'post':
      case 'put':
        return axios[req.method.toLowerCase()](req.uri, req.body, config).then((d) => d.data);
    }
    return null;
  }

  getTableInnerName(db_name, table_name) {
    return ljp_req('/api/getTableName', {
      org_id: this._org_id,
      db_name,
      table_name,
    }).then((ret) => {
      if (ret.data?.status === 'ok') return ret.data?.table_name ?? null;
      throw new Error(ret.data?.message ?? '未知错误');
    });
  }

  dbQuery(db_name, query) {
    return ljp_req('/api/queryDb', {
      org_id: this._org_id,
      db_name,
      query,
    }).then((ret) => {
      if (ret.data?.status === 'ok') return ret.data?.result ?? null;
      throw new Error(ret.data?.message ?? '未知错误');
    });
  }

  async waitIndexSync(t) {
    return true;
  }
}

module.exports = SDK;
module.exports.NODE_STATUS = NODE_STATUS;
