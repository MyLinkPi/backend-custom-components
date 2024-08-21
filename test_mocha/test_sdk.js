const { describe, it, before } = require('mocha');
const assert = require('assert');
const SDK = require('./../ljp_sdk');
const env = require('./../env');
let org_id;
switch (process.env.COMPUTERNAME) {
  // case 'LAPTOP-SHIPC':
  //   org_id = '26974F1F9970F3036E2104D1C6BDFB1F'; //spc test space
  //   break;
  default:
    org_id = env.DEMO_ORG;
}
const sdk = new SDK(org_id);
const spctesttempId = '5FA69DF85ED411EF8E691070FD936D58'; // spc test temp
const spctestNodeId = '86789eb4b3434519b50e3e5a9b49e7bc';

before(async function () {
  this.timeout(100_000);
  await sdk.init();
});
describe('temp', function () {});
describe('node 节点数据读写', function () {
  it('should read node', () => {});
  it('sdk.getNodes() should get nodes by node_ids: 获取节点对象列表 通过节点id列表', async function () {
    //https://master.test.mylinkpi.com/home/D3B7F181D7B5267DA56062643B0A84AE/f2ce55635c29260b15c7fd5fab0e100d/86789eb4b3434519b50e3e5a9b49e7bc?side=tree&vid=content
    const nodes = await sdk.getNodes(['86789eb4b3434519b50e3e5a9b49e7bc']);
    assert(nodes instanceof Array);
    // const {NODE }= require('./../type.d.ts')
    // assert(nodes[0] instanceof NODE)
    assert(nodes[0] instanceof Object);
  });
  it('sdk.getTempNode() should get node list by temp_id or temp_name：获取节点对象列表 通过主题类型id或名称', async () => {
    const temp_id = '5FA69DF85ED411EF8E691070FD936D58'; // spc test temp
    const temp_name = 'spctesttemp';
    const nodes = await sdk.getTempNode(temp_id);
    assert(nodes instanceof Array);
    assert(nodes[0] instanceof Object);
    const nodes2 = await sdk.getTempNode(temp_name);
    assert(nodes2 instanceof Array);
    assert(nodes2[0] instanceof Object);
  });
  it('sdk.getPropIndexByName() should get prop index: 获取节点属性的坐标，通过属性名称', () => {
    const prop_index = sdk.getPropIndexByName(spctesttempId, 'text');
    assert(typeof prop_index === 'number' && prop_index !== -1);
    const prop_index2 = sdk.getPropIndexByName(spctesttempId, 'not_exist');
    assert(prop_index2 === -1);
  });
  describe('node param', () => {
    it('test all', async function () {
      //get node 通过节点ID或主题类型名称获取节点对象列表
      let ljp_sdk = sdk;
      const nodes = await ljp_sdk.getNodes([spctestNodeId]);
      const nodes_b = await ljp_sdk.getTempNode(spctesttempId);
      const node = nodes[0];
      //node info 节点信息
      const org_id = node.org_id; // 获取节点所在组织ID
      const node_id = node.node_id; // 获取节点ID
      const title = node.title; // 获取节点标题
      const temp_id = node.temp_id; // 获取节点主题类型ID
      const r0 = await node.set_title('test set title'); // 设置节点标题
      //prop 属性
      const value = node.getPropByName('text'); // 获取属性值by属性名
      const propIndex = node.getPropIndexByName('text'); // 获取属性坐标
      const r10 = await node.set_prop('text', 'test update text00'); // 更新属性值by属性名
      const r1 = await node.set_prop([5, 1], ['test update text11', new Date().getTime()]); //批量更新属性值 by prop index
      const r2 = await node.set_prop(['text', 'date'], ['test update text22', new Date().getTime()]); //批量更新属性值 by prop name
      //status 状态
      const status_prop = node.status_prop; // 该主题的状态配置信息, 更新节点状态时需要传入该值
      const status = node.status_prop; // 获取节点状态
      const status_index0 = node.status_index; // 获取节点状态坐标
      const status_index1 = node.getStatusIndexByName('待办'); // 该状态名的坐标值status_index
      const r3 = await node.set_status_index(status_index1, status_prop); // 设置节点状态 by status index(数字)
      const r4 = await node.set_status_index('完成', status_prop); // 设置节点状态 by status name
      //message 消息
      const r5 = await node.send_message(`消息内容${Date.now()}`); // 在节点上发送消息
    });
    it('get param value and update param value', async () => {
      const node = (await sdk.getNodes([spctestNodeId]))[0];
      //文本类型
      const value0 = node.getPropByName('text');
      assert(typeof value0 === 'string');
      //数字类型
      const value1 = node.getPropByName('number');
      assert(typeof value1 === 'number');
      //附件类型
      const value2 = node.getPropByName('file');
      assert(typeof value2 === 'object');
      assert(value2.url instanceof Array);
      assert(value2.name instanceof Array);
      //用户类型
      const value3 = node.getPropByName('user');
      assert(/^[0-9a-fA-F]{32}$/.test(value3));
      //日期类型, 返回时间戳ms
      const value4 = node.getPropByName('date');
      // assert(value4 instanceof number);
      //文本公式
      const value5 = node.getPropByName('formula_text');
      // assert(typeof value5 === 'string');
      //引用类型
      const value6 = node.getPropByName('quote');
      // assert(!!value6 );
      //选值
      const value7 = node.getPropByName('select');
      //多级选值
      const value8 = node.getPropByName('treeselect');

      //定位 和 地址
      const value9 = node.getPropByName('location');
      const value10 = node.getPropByName('address');
      assert(typeof value10 === 'string');
      assert(typeof value9 === 'string');
      //自增id类型
      const value11 = node.getPropByName('selfaddid');
      assert(value11 === 1);
    });
    // it('should update param', () => {});
    // it('should update param text', () => {});
    // it('should update param number', () => {});
    // it('should update param file', () => {});
    // it('should update param people', () => {});
    // it('should update param date', () => {});
    // it('should update param formula', () => {});
    // it('should update param quote', () => {});
  });
  describe('node status: 节点状态', () => {
    it('sdk.getStatusIndexByName() should get status index by name：获取主题类型的状态的坐标值 ， 输入为主题id和状态名称', async () => {
      const status_index = await sdk.getStatusIndexByName(spctesttempId, '待办');
      assert(typeof status_index === 'number' && status_index !== -1);
      const status_index2 = await sdk.getStatusIndexByName(spctesttempId, 'not_exist');
      assert(status_index2 === -1);
    });
  });
  describe('node message: 在节点上发送消息', () => {
    it('sdk.sendMessage() should send message on node：在节点上发送消息', async () => {
      //消息发送者为组件开发者登录用户
      const node = (await sdk.getNodes([spctestNodeId]))[0];
      const r = await node.send_message(`test send message${new Date().getTime()}`);
      assert(r === true);
    });
  });
});
describe('special function', () => {
  it('sdk.getRootNode() should get org root node：获取空间根节点', async function () {
    const node = await sdk.getRootNode();
    assert.deepEqual(typeof node, 'object');
    assert(typeof node === 'object');
  });
  it('sdk.getNicknameMap() should get nickname map：获取空间成员id和昵称的映射', async () => {
    //用户id到用户昵称的映射，仅包含当前组织空间的用户
    const map = await sdk.getNicknameMap();
    assert(map instanceof Object);
  });
  it('sdk.updateVersion() should update version 更新空间版本,让前端同步数据', async () => {
    const r = await sdk.updateVersion();
    assert(r === true);
  });
});
