const readline = require('readline-sync');
const { sendCaptcha, captchaLogin, passwordLogin } = require('./request');

const phoneRegex = /^1\d{10}$/;
const captchaRegex = /^\d{6}$/;
const emailRegex = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

async function main() {
  const login_method = ['短信验证码登陆', '密码登陆'];
  main: while (true) {
    try {
      const index = readline.keyInSelect(login_method, '请选择登陆方式:');
      switch (index) {
        case -1:
          break main;
        case 0:
          const phone = readline.question('请输入手机号：');
          if (phoneRegex.test(phone)) {
            await sendCaptcha(phone);
            while (true) {
              const captcha = readline.question('请输入验证码：');
              if (captchaRegex.test(captcha)) {
                try {
                  await captchaLogin(phone, captcha);
                  break main;
                } catch (e) {}
              } else {
                console.error('[ERROR] 错误的验证码\n');
              }
            }
          } else {
            console.error('[ERROR] 错误的手机号\n');
          }
          break;
        case 1:
          const userName = readline.question('请输入帐号：');
          if (!emailRegex.test(userName) && !phoneRegex.test(userName)) {
            console.error('[ERROR] 帐号错误\n');
            break;
          }
          const password = readline.question('请输入密码：', { hideEchoBack: true });
          await passwordLogin(userName, password);
          break main;
        default:
          console.error('[ERROR] 请选择正确的登陆方式\n');
      }
    } catch (e) {
      console.error(`[ERROR] ${e.message}\n`);
    }
  }
}

main();