let logNode;

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
    console.log('空间id：', node.org_id);
    console.log('节点id', node.node_id);
    console.log('创建时间戳', node.create_time);
    console.log('创建人id', node.creator);
    console.log('更新时间戳', node.update_time);
    console.log('更新人id', node.modifier);
    console.log('节点标题', node.title);
    console.log('节点类型名称', node.temp_name);
    console.log('节点类型id', node.temp_id);
    console.log('节点状态名称', node.status_name);
    console.log('节点状态坐标值', node.status_index);
    console.log('节点的父节点id', node.parent);
    console.log('第一个子节点id', node.first_child);
    console.log('最后一个子节点id', node.last_child);
    console.log('上一个相邻节点（哥哥节点）id', node.elder_brother);
    console.log('下一个相邻节点（弟弟节点）id', node.little_brother);
    console.log('节点版本号', node.version);
  }
}

async function log(message) {
  if (logNode) {
    console.log(`message on ${logNode.title}`, message);
    await logNode.send_message(message);
  }
}

module.exports = demo;
