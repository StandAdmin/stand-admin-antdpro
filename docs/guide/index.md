---
title: 介绍
order: 1
toc: menu
nav:
  title: 指南
  order: 1
---

## StandAdmin

StandAdmin 是一个 CRUD 框架，配合 [Bigfish](https://bigfish.antfin-inc.com/) 或者 [AntdPro](https://pro.ant.design/index-cn)，可以非常高效的实现中后台常见的[管理功能](https://rooseve.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/admin-demo/base)。

一个典型的 CRUD:

<p>
  <a href="https://rooseve.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/admin-demo/base">
    <img alt="典型的CRUD" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*kEKoSpuGPikAAAAAAAAAAAAAARQnAQ" width="500" />
  </a>
</p>

纯手工实现的话，通常需要处理如下一些细节：

- 请求控制，比如查询、删除、新建等
- 状态控制，比如查询按钮和列表的 Loading
- 表单控制，比如查询默认值，编辑数据恢复
- 新建/编辑 弹窗（Modal）显隐控制
- 反馈处理，比如删除后刷新列表
- 分页控制

StandAdmin 可以省去或者简化这些同质的琐事，辅助开发者聚焦在业务特定逻辑的开发上。

## 特性

- 完美配合 [Bigfish](https://bigfish.antfin-inc.com/) 或者 [AntdPro](https://pro.ant.design/index-cn)
- 写更少的代码，更简单的代码，同时实现更优的功能效果
- 尊重中后台的业务复杂性，保证自由度，辅助而不是控制
- 大量[示例](https://admin-demo.abf.alibaba-inc.com)，推崇模仿

## 思路

前端开发的视角，接手某个数据对象的 CRUD 管理功能后，通常要处理两块事情：

1. 弄清楚外界的输入，通常包括配置信息（比如各种状态的枚举值）和数据对象（涵盖字段、接口等）相关的信息

2. 弄清楚 UI 层面的细节，比如查询表单、列表展示、新建/编辑表单，这块通常是前端工作的重心，不同的业务环境会有非常大的差异

<p>
  <img alt="StandAdmin" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*YaMiRrQCCeMAAAAAAAAAAAAAARQnAQ" width="800" />
</p>

与之对照，StandAdmin 的“靶点”也是两块：

1. 向左看：利用配置、数据对象信息构建一个标准的 Context，覆盖常规或者同质的逻辑（比如状态管理），将开发者从”胶水“性质的工作中解脱出来

2. 向右看：提供 3 大标准 hooks（查询、列表、新建/编辑），辅助 UI 细节的实现。所谓“辅助”，就编辑弹窗而言，不是直接内置一个 Modal+Form 的 UI 组件，而是提供通用意义上的 modalProps（visible、onOk、onCancel 等） 和 formProps（form、onFinfish、initialValues 等），这样开发者有足够的**自由度**去控制全部的 UI 细节，比如可以不用 Modal 而是用 Drawer，或者不用 Antd 的 Form 而是使用其他 Form

总结一下，StandAdmin 试图把 CRUD 的开发主体变成如下的样子：

1. 准备好接口和配置

2. 改查询表单里面的 Form.Item，列表里面的 columns 和新建/编辑表单里面的 Form.Item

## 环境准备

### 基本要求

React 16+、Antd 4

### 新项目

如果是新建一个中后台工程，可以直接使用下述工程模板，改造一个运行正常的代码库远比从头开始容易，对吧~

<table style="width:900px">
  <tr>
    <td>
      <strong>StandAdmin 模板</strong>
      <div>
        <a href="https://admin-demo.abf.alibaba-inc.com" target="_blank">
          <img alt="StandAdmin" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*RjcgTJddV-4AAAAAAAAAAAAAARQnAQ" width="400" />
        </a>
      </div>
    </td>
    <td>
      <strong>Bigfish 默认模板</strong>
      <div>
        <a href="https://bigfish-admin-demo.abf.alibaba-inc.com" target="_blank">
          <img alt="Bigfish StandAdmin" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*VGinTbAIwDAAAAAAAAAAAAAAARQnAQ" width="400" />
        </a>
      </div>
    </td>
  </tr>
</table>

### Umi 3+ 工程

使用[Bigfish](https://bigfish.antfin-inc.com/)或者[AntdPro](https://pro.ant.design/index-cn)

- 使用内置的 Dva

  1. 配置开启 Dva（StandAdmin 只是内部依赖 Dva 做状态管理，**并不要求使用者了解或者学习 Dva**）

     ```json
     // config/config.js
     dva: {}
     ```

     为避免出现 `export 'connect' (imported as 'connect') was not found in '@alipay/bigfish'` 错误，请手动添加一个[空 model](http://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/models/empty.js) 文件

     ```javascript
     // model/emptyts
     export default {
       namespace: 'empty_placeholder',
       state: false,
     };
     ```

  2. [Bigfish](https://bigfish.antfin-inc.com/) 下请使用 [@ali/stand-admin](https://npm.alibaba-inc.com/package/@ali/stand-admin) ； [AntdPro](https://pro.ant.design/index-cn) 下请使用 [stand-admin-antdpro](https://www.npmjs.com/package/stand-admin-antdpro) 。 两个 npm 包只是根据不同环境做一些简单的适配，用法完全一致

- 不方便开启内置的 Dva

  请参照下述其他工程的做法，直接使用[stand-admin-dva](https://www.npmjs.com/package/stand-admin-dva)

### 其他工程

<a id="stand-admin-dva"></a>

请使用 [stand-admin-dva](https://www.npmjs.com/package/stand-admin-dva)，使用时多出一个额外步骤。

**App 外层使用 `DvaContainer` 包裹**

```jsx | pure
import { DvaContainer } from 'stand-admin-dva';

const App = props => {
  return (
    {/* 使用 DvaContainer 包裹 */}
    <DvaContainer appOptions={{ history: 'browser' }}>
      <MyApp {...props} />
    </DvaContainer>
  );
};
```

**Umi2+ 下 可以通过 [`rootContainer`](https://umijs.org/guide/runtime-config.html#rootcontainer)完成**

```jsx | pure
// src/app.js
import React from '@alipay/bigfish/react';
import { DvaContainer } from 'stand-admin-dva';

export function rootContainer(container) {
  return (
    <DvaContainer appOptions={{ history: 'browser' }}>{container}</DvaContainer>
  );
}
```
