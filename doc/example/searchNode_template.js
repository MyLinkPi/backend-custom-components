const TaskPool = require('@mylinkpi/task_pool');
let logNode;
const test = true;

/**
 * 示例
 * @param ljp_sdk {LJP_SDK}
 * @param task {Task}
 * @returns {Promise<void>}
 */
async function demo(ljp_sdk, task) {
  const ad_map = await ljp_sdk.getNicknameMap();
  //按照主题和属性搜索节点
  const nodes = await ljp_sdk.searchNode('商品0', [
    {
      index: 'proName',
      value: ['火柴'],
      op: 'and',
    },
  ]);
  if (nodes.length === 0) {
    throw new Error('未找到节点');
  }
  const price = nodes[0].getPropByName('price');
  console.log(nodes[0].title, '的单价是', price);
  const pro = nodes[0];
  const chart = await ljp_sdk.searchNode(
      '购物车a',
      [
        {
          index: '拥有者',
          value: ['BB5219CFB10011EEAB2D043F72FDCAE0'],
          op: 'and',
        },
        {
          index: '总价',
          value: [438.0],
          op: 'and',
        },
      ],
  );
  if (chart.length === 0) {
    throw new Error('未找到购物车');
  }
  const chartNode = chart[0];
  const taskPool = new TaskPool(32);
  const r0 = await chartNode.insert_children([
    {
      title: 'abc',
      temp_id: '待购物',
      prop: {
        proId: pro.getPropByName('proId'),
        quantity: 23,
        datetime: Date.now(),
      },
      status_index: ljp_sdk.getStatusIndexByName('待购物', '待办'),
    },
  ]);
  if (r0.length === 0) {
    throw new Error('插入失败');
  }
  console.log(
      'chart:',
      chartNode.title,
      '新增待购物:',
      r0[0].title,
      r0[0].getPropByName('quantity'),
      '个',
  );

  // await ljp_sdk.updateVersion();
}

async function log(message) {
  if (logNode) {
    console.log(`message on ${logNode.title}`, message);
    await logNode.send_message(message);
  }
}

module.exports = demo;
