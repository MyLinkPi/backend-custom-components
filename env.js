const path = require('node:path');
module.exports = {
  LJP_URL_PREFIX: 'https://test-inner.linkerpi.com:8008/', // 填写对应环境的网址
  TEST_ORG: '', // 填写测试ORG_ID
  DEMO_ORG: 'D3B7F181D7B5267DA56062643B0A84AE',
  LOGIN_FILE: path.join(__dirname, '.login'),
};
