const readline = require('readline-sync');
const SDK = require('./ljp_sdk');
const { COMPONENT_ORG_ID, COMPONENT_NAME } = require('./env');
const fs = require('node:fs');
const path = require('node:path');
const { askQuestion } = require('./test_mocha/t4');
const upload_file_name = path.join(__dirname, 'dist.zip');
if (!fs.existsSync(upload_file_name)) {
  console.error('Package not found');
  process.exit(-1);
}

const sdk = new SDK(COMPONENT_ORG_ID);
sdk
  .init()
  .then(async () => {
    // console.log('请输入组件名称:');
    const 组件名称 = COMPONENT_NAME ?? (await askQuestion('请输入组件名称:'));
    console.log(`component name is ${组件名称}`);
    const ret = await (
      await sdk.getRootNode()
    ).insert_children(
      [
        {
          title: '',
          temp_id: '后端组件',
          prop: { 组件名称, 是否公开: '否' },
          status_index: '已停用',
          status_prop: [null, [], null, null, ''],
        },
      ],
      null,
    );
    if (!ret.length) {
      console.error('上传失败');
      process.exit(1);
    } else {
      const node_id = ret[0].node_id;
      const prop = await sdk.uploadFile(node_id, upload_file_name, null);
      await ret[0].set_prop(['组件代码'], [prop]);
      await sdk.updateVersion();
      console.log('上传成功');
      console.log('地址：', ret[0].get_url());
      process.exit(0);
    }
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
