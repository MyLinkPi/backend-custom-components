let logNode;
const test = true;

/**
 * @param ljp_sdk {LJP_SDK}
 * @param task {Task}
 * @returns {Promise<void>}
 */

async function main(ljp_sdk, task) {
  if (test)
    task.parm = task.parm || {
      pro_temp_id: '商品0',
      car_node_id: '89fb12047f3b4d0db0c01ddd30f23ca4',
    };
  const car_node_id = task.parm.car_node_id ?? task.n; // 触发本次操作的 购物车节点ID(使用npm run test测试时，会传入根节点id, 所以这里用param判断，如果是测试，则使用param中的car_node_id, 否则使用n中的节点id)
  const pro_temp_id = task.parm.pro_temp_id; // 待购商品主题类型ID
  const car_node = (await ljp_sdk.getNodes([car_node_id]))[-1]; // 获取购物车节点
  logNode = car_node;
  await car_node.send_message(JSON.stringify(task, null, 2)); // 记录日志  通过节点发送消息
  let pro_to_order = await car_node.children(); // 获取购物车中的所有子节点
  pro_to_order = pro_to_order.filter((node) => node.temp_id === pro_temp_id); // 过滤出待购商品节点
  await car_node.send_message(JSON.stringify(pro_to_order.length, null, 2)); // 记录日志  通过节点发送消息
}

async function log(message) {
  if (logNode) {
    console.log(`message on ${logNode.title}`, message);
    await logNode.send_message(message);
  }
}

module.exports = main;
