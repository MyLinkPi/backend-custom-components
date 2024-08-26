const TaskPool = require('@mylinkpi/task_pool');
const Decimal = require('decimal.js');
let logNode;
const test = true;

/**
 * @param ljp_sdk {LJP_SDK}
 * @param task {Task}
 * @returns {Promise<void>}
 */

async function main(ljp_sdk, task) {
  await (await ljp_sdk.getNodes([task.n]))[0].send_message(JSON.stringify(task.parm, null, 2));
  if (!task.parm?.pro_temp_id || !task.parm?.car_node_id) {
    await (
      await ljp_sdk.getNodes([task.n])
    )[0].send_message('缺少参数: pro_temp_id 或 car_node_id');
  }
  // const a = {
  //   "pro_temp_id": `95C133535F8011EF8E691070FD936D58`,
  //       "car_node_id": '89fb12047f3b4d0db0c01ddd30f23ca4'
  // }
  task.parm = task.parm ?? {};
  task.parm.pro_temp_id = '95C133535F8011EF8E691070FD936D58';
  task.parm.car_node_id = '89fb12047f3b4d0db0c01ddd30f23ca4';
  const car_node_id = task.parm.car_node_id ?? task.n; // 触发本次操作的 购物车节点ID(使用npm run test测试时，会传入根节点id, 所以这里用param判断，如果是测试，则使用param中的car_node_id, 否则使用n中的节点id)
  const pro_temp_id = task.parm.pro_temp_id; // 待购商品主题类型ID
  const car_node = (await ljp_sdk.getNodes([car_node_id]))[0]; // 获取购物车节点
  logNode = car_node;
  await car_node.send_message(JSON.stringify(task, null, 2)); // 记录日志  通过节点发送消息
  let pro_to_order = await car_node.children(); // 获取购物车中的所有子节点
  pro_to_order = pro_to_order.filter((node) => node.temp_id === pro_temp_id); // 过滤出待购商品节点
  await log(`pro_to_order.length: ${pro_to_order.length}`); // 记录日志  通过节点发送消息
  let sum = 0;
  for (const node of pro_to_order) {
    const a = node.getPropByName('price'); // 获取商品价格
    const b = node.getPropByName('quantity'); // 获取商品数量
    if (!!a && !!b)
      sum += new Decimal(a).mul(b).toNumber(); //使用精确计算库计算总价
    else {
      throw new Error('商品节点缺少价格或数量属性');
    }
  }
  const taskpool = new TaskPool(32);
  await taskpool.push(car_node.set_prop('总价', sum)); // 设置购物车总价 属性
  log('set price success' + sum);
  const result = await Promise.all(taskpool); // 等待所有任务完成
  await log(JSON.stringify(result, null, 2));
  await ljp_sdk.updateVersion(); // 让前端同步数据
}

//自定义一个debug用的log函数
async function log(message) {
  if (logNode) {
    // console.log(`message on ${logNode.title}`, message);
    await logNode.send_message(message);
  }
}

module.exports = main;
