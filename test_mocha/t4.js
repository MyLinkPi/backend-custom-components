const readline = require('readline');

// 创建 readline 接口实例
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 使用 async/await 模拟阻塞输入
function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  // 输出提示并等待用户输入
  const name = await askQuestion('Please enter your name: ');
  console.log(`Hello, ${name}!`);

  // 关闭 readline 接口
  rl.close();
}

// main();

module.exports = { askQuestion };
