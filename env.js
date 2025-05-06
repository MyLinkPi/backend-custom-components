const path = require('node:path');
module.exports = {
  LJP_URL_PREFIX: 'https://test-inner.linkerpi.com:8008/', // 填写对应环境的网址
  TEST_ORG: '', // 填写测空间_ID
  TEST_NODE: null, // 填写测试node_id
  DEMO_ORG: 'D3B7F181D7B5267DA56062643B0A84AE', //公用测试空间id
  LOGIN_FILE: path.join(__dirname, '.login'),
  COMPONENT_ORG_ID: 'B76C8DA4F601AD9B46A62CF2D0E88892',
  COMPONENT_NAME: null, // 组件名称，等于null时每次询问
  USE_INPUT_TEMP: false, //是否使用输入UI模板配置
  PARAMS: [
    //输入模板
    {
      name: '文本', //配置界面显示的属性名
      key: 'key1', //组件程序使用的key（配置param 的json的key）
      // 文本text 数字number 枚举enum 条件选值condition 时间戳time 空间选值org_id 主题选值temp_id 节点选值node_id 属性选值prop_index 状态选值status_index 用户选值user_ad 所有用户user_ad_external
      type: 'text',
      default: 'default1', //默认值
      require: true, //是否必填
      placeHolder: '自定义说明文字2', //输入框底部的提示文字
      hintText: '自定义提示文字1', //属性名右侧问号提示
    },
    {
      name: '数字',
      key: 'num1',
      type: 'number',
      min: 0, // 最小值
      max: 100, // 最大值
    },
    {
      name: '选值手动定义',
      key: 'key2',
      type: 'enum',
      extend: ['select1', 'select2'], //定义的备选项
      display: ['选项1', '选项2'], // 选项的显示值
    },
    {
      name: '选值根据条件定义',
      key: 'key3',
      type: 'condition',
      limitedBy: ['key2'],
      condition: {
        select1: {
          extend: ['select1-1', 'select1-2'],
          display: ['选项1-1', '选项1-2'],
        },
        select2: {
          extend: ['select2-1', 'select2-2'],
          display: ['选项2-1', '选项2-2'],
        },
      },
    },
    {
      name: '选值根据条件定义（多层）',
      key: 'key4',
      type: 'condition',
      limitedBy: ['key2', 'key3'],
      condition: {
        select1: {
          'select1-1': {
            extend: ['select1-1-1', 'select1-1-2'],
            display: ['选项1-1-1', '选项1-1-2'],
          },
          'select1-2': {
            extend: ['select1-2-1', 'select1-2-2'],
            display: ['选项1-2-1', '选项1-2-2'],
          },
        },
        select2: {
          'select2-1': {
            extend: ['select2-1-1', 'select2-1-2'],
            display: ['选项2-1-1', '选项2-1-2'],
          },
          'select2-2': {
            extend: ['select2-2-1', 'select2-2-2'],
            display: ['选项2-2-1', '选项2-2-2'],
          },
        },
      },
    },
    {
      name: '时间',
      key: 'time1',
      type: 'time',
      format: 'stamp_ms', // 毫秒时间戳 stamp_ms 秒时间戳 stamp_s 年月日 day 年月 month 年 year
      min: -600000, // 最早时间 相对当前时间的偏移值（ms）
      max: 600000, // 最晚时间 相对当前时间的偏移值（ms）
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
      limitedBy: ['temp1'],
    },
    {
      name: '属性名选值2(受限bytemp2)',
      key: 'prop3',
      type: 'prop_index',
      limitedBy: ['temp2'],
    },
    { name: '节点选值', key: 'node1', type: 'node_id' },
    { name: '状态选值1', key: 'status1', type: 'status_index' },
    {
      name: '状态选值2(limitedbytemp2)',
      key: 'status2',
      type: 'status_index',
      limitedBy: ['temp2'],
    },
    { name: '用户选值1', key: 'user1', type: 'user_ad' },
    { name: '用户选值2(limited)', key: 'user2', type: 'user_ad', limitedBy: ['org1'] },
  ],
};
