const path = require('node:path');
module.exports = {
  LJP_URL_PREFIX: 'https://test-inner.linkerpi.com:8008/', // 填写对应环境的网址
  TEST_ORG: '', // 填写测空间_ID
  TEST_NODE: null, // 填写测试node_id
  DEMO_ORG: 'D3B7F181D7B5267DA56062643B0A84AE', //公用测试空间id
  LOGIN_FILE: path.join(__dirname, '.login'),
  COMPONENT_ORG_ID: 'B76C8DA4F601AD9B46A62CF2D0E88892',
  COMPONENT_NAME: null, // 组件名称，等于null时每次询问
};
