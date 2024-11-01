const { describe, it, before } = require('mocha');
const SDK = require('./../ljp_sdk');
const NODE_STATUS = require('./../ljp_sdk').NODE_STATUS;
const org_id = 'BB5219CFB10011EEAB2D043F72FDCAE0'; // spc
let sdk = new SDK(org_id);
let spcAd = 'BB5219CFB10011EEAB2D043F72FDCAE0';
let expect;
before(async function () {
  const chai = await import('chai');
  expect = chai.expect;
  this.timeout(100_000);
  await sdk.init();
});
/**
 * Deleted	https://master.test.mylinkpi.com/home/BB5219CFB10011EEAB2D043F72FDCAE0/f5b86593e0917b88cd96fd14dad26d4a/7aa74c58edb8411aa73d10436ca5ab38?side=recyclebin&vid=content
 * -1
 * Recycle	https://master.test.mylinkpi.com/home/BB5219CFB10011EEAB2D043F72FDCAE0/f5b86593e0917b88cd96fd14dad26d4a/3b7edef9832e4872be36e6170babb6b2?side=recyclebin&vid=content
 * 2
 * Normal 	https://master.test.mylinkpi.com/home/BB5219CFB10011EEAB2D043F72FDCAE0/f5b86593e0917b88cd96fd14dad26d4a/7e85287057814194b51ceb443393ab38?side=tree&vid=content
 * 0
 * Draft	https://master.test.mylinkpi.com/home/BB5219CFB10011EEAB2D043F72FDCAE0/f5b86593e0917b88cd96fd14dad26d4a/a2dfc211a37a4ed691978f4c210a0ab1?side=draftsbox&vid=content
 * -2
 */
const test_node = {
  draft: 'a2dfc211a37a4ed691978f4c210a0ab1',
  deleted: '7aa74c58edb8411aa73d10436ca5ab38',
  normal: '7e85287057814194b51ceb443393ab38',
  // unknown :'7e85287057814194b51ceb443393ab38',
  recycle: '3b7edef9832e4872be36e6170babb6b2',
};
describe('about node status', function () {
  this.timeout(1000 * 3600);
  it('get status index by node.node_status.index', async function () {

    const [node_draft] = await sdk.getNodes([test_node.draft]);
    expect(node_draft.node_status.index).to.be.equal(NODE_STATUS.draft.index);
    expect(node_draft.node_status.which).to.be.equal(NODE_STATUS.draft.name);
    expect(node_draft.node_status.is.draft).to.be.equal(true);
    expect(node_draft.node_status.is.deleted).to.be.equal(false);

    const [node_deleted] = await sdk.getNodes([test_node.deleted]);
    expect(node_deleted.node_status.index).to.be.equal(NODE_STATUS.deleted.index);
    expect(node_deleted.node_status.which).to.be.equal(NODE_STATUS.deleted.name);
    expect(node_deleted.node_status.is.deleted).to.be.equal(true);
    expect(node_deleted.node_status.is.draft).to.be.equal(false);

    const [node_normal] = await sdk.getNodes([test_node.normal]);
    expect(node_normal.node_status.index).to.be.equal(NODE_STATUS.normal.index);
    expect(node_normal.node_status.which).to.be.equal(NODE_STATUS.normal.name);
    expect(node_normal.node_status.is.normal).to.be.equal(true);
    expect(node_normal.node_status.is.deleted).to.be.equal(false);

    const [node_recycle] = await sdk.getNodes([test_node.recycle]);
    expect(node_recycle.node_status.index).to.be.equal(NODE_STATUS.recycle.index);
    expect(node_recycle.node_status.which).to.be.equal(NODE_STATUS.recycle.name);
    expect(node_recycle.node_status.is.recycle).to.be.equal(true);
    expect(node_recycle.node_status.is.normal).to.be.equal(false);
  });
  it('info', async () =>{
    const [node_normal] = await sdk.getNodes([test_node.normal]);
    expect(node_normal.parent).is.a('string');
    expect(node_normal.first_child).is.a('string');
    expect(node_normal.last_child).is.a('string');
    expect(node_normal.elder_brother).is.a('string');
    expect(node_normal.little_brother).is.a('string');
    expect(node_normal.create_time).is.a('number');
    expect(node_normal.creator).is.a('string');
    expect(node_normal.update_time).is.a('number');
    expect(node_normal.modifier).is.a('string');
    expect(node_normal.version).is.a('number');
  })
});
