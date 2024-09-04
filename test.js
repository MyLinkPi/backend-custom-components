const env = require('./env');
const { getAD } = require('./request');
const SDK = require('./ljp_sdk');
let index;
switch (process.argv[2]) {
  case 'demo':
    index = require('./demo');
    break;
  case 'debug':
    index = require('./index');
    break;
  default:
    index = require('./dist/index');
}

const org_id = process.argv[2] === 'demo' ? env.TEST_ORG : env.TEST_ORG;
if (!org_id) {
  console.error('请填写测试空间id:  TEST_ORG in env.js');
  process.exit(1);
}

const sdk = new SDK(org_id);
sdk.init().then(() =>
  index(sdk, {
    ad: getAD(),
    o: org_id,
    n: sdk._special_node.root_id,
    parm: { testDefault: 'testDefault' },
  })
    .then(() => {
      console.log('test ok');
      process.exit(0);
    })
    .catch((e) => {
      console.log('test error');
      console.error(e);
      process.exit(1);
    }),
);
