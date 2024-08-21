const { describe, it,  before } = require('mocha');
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

before(async function () {
  this.timeout(100_000);
  await sdk.init();
});
describe('temp', function () {});
describe('node', function () {
  it('should read node', () => {});
  it('sdk.getNodes() should get node list', async function () {
    //https://master.test.mylinkpi.com/home/D3B7F181D7B5267DA56062643B0A84AE/f2ce55635c29260b15c7fd5fab0e100d/86789eb4b3434519b50e3e5a9b49e7bc?side=tree&vid=content
    const nodes = await sdk.getNodes(['86789eb4b3434519b50e3e5a9b49e7bc']);
    assert(nodes instanceof Array);
    // const {NODE }= require('./../type.d.ts')
    // assert(nodes[0] instanceof NODE)
    assert(nodes[0] instanceof Object);
  });
  it('sdk.getTempNode() should get node list by temp_id or temp_name', async () => {
    const temp_id = '5FA69DF85ED411EF8E691070FD936D58'; // spc test temp
    const temp_name = 'spctesttemp';
    const nodes = await sdk.getTempNode(temp_id);
    assert(nodes instanceof Array);
    assert(nodes[0] instanceof Object);
    const nodes2 = await sdk.getTempNode(temp_name);
    assert(nodes2 instanceof Array);
    assert(nodes2[0] instanceof Object);
  });
  it('sdk.getPropIndexByName() should get prop index: 获取属性的坐标', () => {
    const prop_index = sdk.getPropIndexByName(spctesttempId, 'text');
    assert(typeof prop_index === 'number' && prop_index !== -1);
    const prop_index2 = sdk.getPropIndexByName(spctesttempId, 'not_exist');
    assert(prop_index2 === -1);
  });
  describe('node param', () => {
    it('should update param', () => {});
    it('should update param text', () => {});
    it('should update param number', () => {});
    it('should update param file', () => {});
    it('should update param people', () => {});
    it('should update param date', () => {});
    it('should update param formula', () => {});
    it('should update param quote', () => {});
  });
  describe('node status: 节点状态', () => {
    it('sdk.getStatusIndexByName() should get status index by name', async () => {
      const status_index = await sdk.getStatusIndexByName(spctesttempId, '待办');
      assert(typeof status_index === 'number' && status_index !== -1);
      const status_index2 = await sdk.getStatusIndexByName(spctesttempId, 'not_exist');
      assert(status_index2 === -1);
    });
  });
});
describe('special function', () => {
  it('sdk.getRootNode() should get org root node', async function () {
    const node = await sdk.getRootNode();
    assert.deepEqual(typeof node, 'object');
    assert(typeof node === 'object');
  });
  it('sdk.getNicknameMap() should get nickname map', async () => {
    //用户id到用户昵称的映射，仅包含当前组织空间的用户
    const map = await sdk.getNicknameMap();
    assert(map instanceof Object);
  });
  it('sdk.updateVersion() should update version 更新版本', async () => {
    const r = await sdk.updateVersion();
    assert(r===true);
  });
});
