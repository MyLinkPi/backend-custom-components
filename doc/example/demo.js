const TaskPool = require('@mylinkpi/task_pool');
const Decimal = require('decimal.js');
let logNode;
const test = true;

/**
 * 示例
 * @param ljp_sdk {LJP_SDK}
 * @param task {Task}
 * @returns {Promise<void>}
 */
async function demo(ljp_sdk, task) {
  const temp_node = await ljp_sdk.getTempNode('测试主题');
  const task_pool = new TaskPool(32);
  for (const node of temp_node) {
    const 测试文本 = node.getPropByName('文本');
    const 测试数字 = node.getPropByName('数字');
    console.log(测试文本, 测试数字);
    await task_pool.push(node.set_prop('数字', 测试数字 + 1));
  }
  await task_pool.push((await ljp_sdk.getNodes([task.n]))[0]?.send_message('喜加壹'));
  await Promise.all(task_pool);
  await ljp_sdk.updateVersion();
}

async function log(message) {
  if (logNode) {
    console.log(`message on ${logNode.title}`, message);
    await logNode.send_message(message);
  }
}

module.exports = demo;
