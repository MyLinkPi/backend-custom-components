const { describe, it, beforeEach, before } = require('mocha');
const assert = require('assert');
const SDK = require('./../ljp_sdk');
const env = require('./../env');
// const {NODE }= require('./../type.d.ts')
let org_id;
switch (process.env.COMPUTERNAME) {
  // case 'LAPTOP-SHIPC':
  //   org_id = '26974F1F9970F3036E2104D1C6BDFB1F'; //spc test space
  //   break;
  default:
    org_id = env.DEMO_ORG
}
const sdk = new SDK(org_id);

before(async function () {
  this.timeout(100_000);
  await sdk.init();
});
describe('temp', function () {});
describe('node', function () {
  it('should read node', () => {});
  it('should get node list', async function () {
    //https://master.test.mylinkpi.com/home/D3B7F181D7B5267DA56062643B0A84AE/f2ce55635c29260b15c7fd5fab0e100d/86789eb4b3434519b50e3e5a9b49e7bc?side=tree&vid=content
    const nodes = await sdk.getNodes(['86789eb4b3434519b50e3e5a9b49e7bc']);
    assert(nodes instanceof Array)
    // assert(nodes[0] instanceof NODE)
    assert(nodes[0] instanceof Object)

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
});
describe('special function', () => {
  it('should get org root node', async function () {
    const node = await sdk.getRootNode();
    assert.deepEqual(typeof node, 'object');
    assert(typeof node === 'object');
  });
});
