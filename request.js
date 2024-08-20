const axios = require('axios');
const fs = require('node:fs');
const env = require('./env');
const { sha512 } = require('./util');
const client = axios.create({ baseURL: env.LJP_URL_PREFIX, proxy: false });
let ad = null,
  token = null,
  device_id = null;
if (fs.existsSync(env.LOGIN_FILE)) {
  const login_info = JSON.parse(fs.readFileSync(env.LOGIN_FILE));
  ad = login_info?.ad ?? null;
  token = login_info?.token ?? null;
  device_id = login_info?.device_id ?? null;
}
if (device_id === null) {
  device_id = require('uuid').v4();
}

async function checkLogin() {
  const ret = await client.post('/api/check_login', { ad, token, device_id });
  return ret?.data?.status === 'ok';
}

async function sendCaptcha(phone) {
  const ret = await client.post(
    '/api/login/captcha',
    { device_id },
    { params: { type: 'login', mobile: phone } },
  );
  if (ret?.data?.status === 'ok') {
    console.log('验证码发送成功');
  } else {
    throw new Error('验证码发送错误', ret?.data?.message ?? '');
  }
}

async function captchaLogin(phone, captcha) {
  const ret = await client.post('/api/login/account', {
    mobile: phone,
    captcha,
    type: 'mobile',
    device_id,
  });
  if (ret?.data?.status === 'ok') {
    ad = ret.data.data.ad;
    token = ret.data.data.token;
    fs.writeFileSync(env.LOGIN_FILE, JSON.stringify({ ad, token, device_id }));
    console.log('登陆成功');
  } else {
    throw new Error('登陆失败', ret?.data?.message ?? '');
  }
}

async function passwordLogin(userName, password) {
  const ret = await client.post('/api/login/account', {
    password: sha512(`${password}${userName}LinkPi20200903!`),
    userName,
    type: 'account',
    device_id,
  });
  if (ret?.data?.status === 'ok') {
    ad = ret.data.data.ad;
    token = ret.data.data.token;
    fs.writeFileSync(env.LOGIN_FILE, JSON.stringify({ ad, token, device_id }));
    console.log('登陆成功');
  } else {
    throw new Error('登陆失败', ret?.data?.message ?? '');
  }
}

function ljp_req(url, prop) {
  return client.post(url, { ...prop, ad, token, device_id }).catch((e) => {
    console.error(e);
    throw e;
  });
}

function getAD() {
  return ad;
}

module.exports = { sendCaptcha, captchaLogin, passwordLogin, checkLogin, ljp_req, getAD };
