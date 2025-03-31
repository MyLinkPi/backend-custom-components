const path = require('node:path');
module.exports = {
  LJP_URL_PREFIX: 'https://test-inner.linkerpi.com:8008/', // 填写对应环境的网址
  TEST_ORG: 'D3B7F181D7B5267DA56062643B0A84AE', // 填写测空间_ID
  TEST_NODE: 'b0a7109700a140d582a1214820c7bb6b', // 填写测试node_id
  DEMO_ORG: 'D3B7F181D7B5267DA56062643B0A84AE', //公用测试空间id
  LOGIN_FILE: path.join(__dirname, '.login'),
  COMPONENT_ORG_ID: 'B76C8DA4F601AD9B46A62CF2D0E88892',
  COMPONENT_NAME: null, // 组件名称，等于null时每次询问
  USE_INPUT_TEMP:false,//是否使用输入ui模板配置
  PARAMS: [//输入模板
    {
      name: '文本', //配置界面显示的属性名
      key: 'key1',//组件程序使用的key（配置param 的json的key）
      // 文本text 数字number 枚举enum 时间戳time 空间选值org_id 主题选值temp_id 节点选值node_id 属性选值prop_index 状态选值status_index 用户选值user_ad 所有用户user_ad_external
      type: 'text',
      default: 'default1',//默认值
      require: true, //是否必填
      placeHolder: '自定义说明文字2', //输入框底部的提示文字
      hintText: '自定义提示文字1', //属性名右侧问号提示
    },
    {
      name: '选值手动定义',
      key: 'key2',
      type: 'enum',
      extend: ['select1', 'select2'], //定义的备选项
    },
    { name: '空间1', key: 'org1', type: 'org_id' },
    { name: '空间2', key: 'org2', type: 'org_id' },
    {
      name: '主题选值1',
      key: 'temp1',
      type: 'temp_id',
    },
    { name: '主题选值2(受限byorg2)', key: 'temp2', type: 'temp_id', limitedBy: 'org2' },
    {
      name: '传入主题的属性名选值1',
      key: 'prop1',
      type: 'prop_index',
    },
    {
      name: '主题1的属性名选值2(受限bytemp1)',
      key: 'prop2',
      type: 'prop_index',
      limitedBy: 'temp1',
    },
    {
      name: '属性名选值2(受限bytemp2)',
      key: 'prop3',
      type: 'prop_index',
      limitedBy: 'temp2',
      writeKV: 'V',
    },
    { name: '节点选值', key: 'node1', type: 'node_id' },
    { name: '状态选值1', key: 'status1', type: 'status_index' },
    {
      name: '状态选值2(limitedbytemp2)',
      key: 'status2',
      type: 'status_index',
      limitedBy: 'temp2',
    },
    { name: '用户选值1', key: 'user1', type: 'user_ad' },
    { name: '用户选值2(limited)', key: 'user2', type: 'user_ad', limitedBy: 'org1' },
  ],
};
