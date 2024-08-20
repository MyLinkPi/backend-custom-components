# backend-custom-components

后端自定义组件

## 0. 目录

- [1. 项目介绍](#1-项目介绍)
- [2. sdk功能](#2-sdk功能)
    - [1. 数据操作](#1-数据操作)
    - [2. 任务操作](#2-任务操作)
- [3. sdk使用](#3-sdk使用)
- [4. 上传组件](#4-上传组件)

## 1. 后端自定义组件介绍

连接派零代码平台支持用户执行灵活的数据操作，通过sdk编写自定义组件，上传到连接派平台，可任意调用。
组件示例：

```node
const TaskPool = require('@mylinkpi/task_pool');

/**
 * 示例: 进行数据提取和更新：获取"测试主题"下的所有节点，对每个节点，取出属性‘文本’、‘数字’的值，修改节点属性值：值将数字属性加1。
 * 该批量更新操作使用内置TaskPool工具进行并发控制
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
    await Promise.all(task_pool);
    await ljp_sdk.updateVersion();
}

module.exports = demo;

```

自定义组件的结构是一个nodejs模块，模块导出一个函数，函数接受两个参数：ljp_sdk和task，ljp_sdk是平台提供的sdk，绝大部分功能通过调用此sdk对象实现。task是平台运行组件时提供基础信息的任务对象。

## 2. sdk结构、功能

-
    1. sdk实现：通过封装连接派后端api接口，提供了一系列的数据操作和任务操作功能。
-
    2. sdk类名叫SDK, 位置在 /backend-custom-components/ljp_sdk.js
-
    3. 组件开发中的sdk使用：组件注释引用{LJP_SDK}类型定义，即可在组件函数中使用sdk提供的功能。\

## 3. 自定义组件开发过程

-
    1. 使用登录脚本，登录连接派平台账号。 可选中英文，可选验短信证码或账密登录。

```shell
npm run login
```

```node
//env.js: 在此配置目标用户空间信息(在测试脚本中会被自动引用,用于初始化sdk对象)
const path = require('node:path');
module.exports = {
    LJP_URL_PREFIX: 'https://t****pi.com:8008/', // 填写对应环境的网址
    TEST_ORG: '', // 填写测试ORG_ID
    DEMO_ORG: 'D3B7F181D7B5267DA56062643B0A84AE',
    LOGIN_FILE: path.join(__dirname, '.login'),
    //...
};


//demo.js: 使用sdk制作组件
/**
 * @param ljp_sdk {LJP_SDK} //使用类型注释引用SDK类型定义，即可在开发中引用sdk提供的工具
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
    await Promise.all(task_pool);
    await ljp_sdk.updateVersion();
}

module.exports = demo;
```

测试组件运行效果：先将组件js放入/dist/index.js 再使用内置脚本运行测试

```shell
npm run test
```

打包为zip：先将组件放到/dist 文件夹中，再使用内置打包脚本：

```shell
npm run pack 
```

上传zip： 上传保存组件到连接派平台

```shell
npm run upload
```

## 3. sdk功能一览

-
    1. 依赖
       sdk的工具函数定义在type.d.ts中, 在组件注释中引用类型可方便地进行开发

```node
/**
 * @param {LJP_SDK} ljp_sdk  //使用类型注释引用SDK类型定义，即可在开发中引用sdk提供的工具
 */
async function demo(ljp_sdk, task) {
    //...
}
```

-
    2. 数据操作

1. 获取节点

```node
const temp_node = await ljp_sdk.getTempNode('测试主题');
```

2. 获取节点属性列表
3. 获取节点属性值
4. 设置节点属性值

-
    2. 任务操作

## 4. 上传组件

-
    1. 打包组件

-
    2. 上传组件

-
    3. 配置运行组件