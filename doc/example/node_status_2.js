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
  for (const node of temp_node) {
    console.log(node.node_status.index, node.node_status.which, node.node_status.is.normal);
  }
  const filtered = temp_node.filter(node => node.node_status.is.normal);
  for (const node of filtered) {
    console.log(node.node_status.index, node.node_status.which, node.node_status.is.normal);
  }
}

async function log(message) {
  if (logNode) {
    console.log(`message on ${logNode.title}`, message);
    await logNode.send_message(message);
  }
}

module.exports = demo;
