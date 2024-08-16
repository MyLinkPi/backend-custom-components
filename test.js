const env = require('./env');
const { getAD } = require('./request');
const SDK = require('./ljp_sdk');
const index = process.argv[2] === 'demo' ? require('./demo') : require('./dist/index');
const org_id = process.argv[2] === 'demo' ? env.DEMO_ORG : env.TEST_ORG;

const sdk = new SDK(org_id);
sdk.init().then(() =>
  index(sdk, { ad: getAD(), o: org_id, n: sdk._special_node.root_id })
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
