/**
 * 示例
 * @param ljp_sdk {LJP_SDK}
 * @param task {Task}
 * @returns {Promise<void>}
 */
async function demo(ljp_sdk, task) {
  const node = await ljp_sdk.getRootNode();
  await node.send_message(JSON.stringify(task.parm, null, 2));
  await ljp_sdk.updateVersion();
}

module.exports = demo;
