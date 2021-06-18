---
title: 基础使用
order: 2
toc: menu
---

## 一个典型的 CRUD

<p>
  <a href="https://standadmin.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/admin-demo/base">
    <img alt="典型的CRUD" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*kEKoSpuGPikAAAAAAAAAAAAAARQnAQ" width="800" />
  </a>
</p>

## 完整代码

[见这里](http://github.com/StandAdmin/stand-admin-antdpro-demo/tree/main/src/pages/Demos/BaseDemo)

## 重点说明

### 目录结构

> 注：StandAdmin 对目录结构没有强制要求，如下结构只是一种习惯而已。

<Tree>
  <ul>
    <li>
      List
      <small>列表</small>
      <ul>
        <li>
          index.js
          <small>重点是useStandTableList</small>
        </li>
      </ul>
    </li>
    <li>
      RecordForm
      <small>新建/编辑</small>
      <ul>
        <li>
          index.ts
          <small>重点是useStandUpsertForm</small>
        </li>
      </ul>
    </li>
     <li>
      SearchForm
      <small>查询</small>
      <ul>
        <li>
          index.ts
          <small>重点是useStandSearchForm</small>
        </li>
      </ul>
    </li>
    <li>
      index.js
      <small>页面入口，通常只是做一个Layout相关的包装</small>
    </li>
    <li>
      main.js
      <small>主体文件，负责组装各种配置和UI， 重点是buildStandRecordModelPkg、buildStandConfigModelPkg、StandContextHoc</small>
    </li>
  </ul>
</Tree>

### 重点示意

<p>
  <img alt="StandAdmin" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*m8A3SLcGPlIAAAAAAAAAAAAAARQnAQ" width="800" />
</p>

### 主入口

[代码](http://github.com/StandAdmin/stand-admin-antdpro-demo/blob/main/src/pages/Demos/BaseDemo/main.js)

#### Import

> 注：需要根据 [环境](/guide#umi-体系) 选用对应的 npm 包，Bigfish 下对应的是 @ali/stand-admin

```jsx | pure
// main.js
import {
  buildStandConfigModelPkg,
  buildStandRecordModelPkg,
  defineContextHocParams,
  StandContextHoc,
  // ...
} from '@ali/stand-admin';
```

#### buildStandConfigModelPkg

[buildStandConfigModelPkg](/api#buildstandconfigmodelpkg) 负责提供 config 信息，比如各种枚举值等等。不需要的话，可以不创建或者 getConfig 留空。

```jsx | pure
// main.js
const configModel = buildStandConfigModelPkg({
  getConfig: [
    // 异步函数
    async () => {
      const configMap = await fetch('/config/....');
      return { ...configMap };
    },
    // 其他异步函数....
    // 静态变量
    {
      boolMap: {
        0: '否',
        1: '是',
      },
    },
  ],
});
```

#### buildStandRecordModelPkg

> 在 StandAdmin 的语境中，“record”指代被管理的数据对象（类似数据库里面的 Table），比如对于“规则”管理，record 就是“规则”。

[buildStandRecordModelPkg](/api#buildstandrecordmodelpkg) 负责提供数据对象相关的信息，涵盖接口和一些元数据信息。

```jsx | pure
// main.js
const recordModel = buildStandRecordModelPkg({
  StoreNs: 'DemoRecord', // Dva的Namespace，全局唯一，留空的话会自动生成。建议设置，有助于问题调试
  StoreNsTitle: '规则', // 数据对象的中文名，对显示有影响，比如弹窗的title，接口的反馈等

  /** 基础信息 */
  idFieldName: 'id', // 必填！record中可作为唯一标识（ID）的字段。没有的话可以对接口返回的数据做一个人工处理，生成这个唯一标识
  nameFieldName: 'name', // record中可以作为显示名的字段

  /** CRUD 相关接口，无相关功能的话可以不传 */
  searchRecords, // 列表查询接口
  getRecord, // 单条记录查询接口
  addRecord, // 创建数据对象接口
  updateRecord, // 更新数据对象接口
  deleteRecord, // 删除数据对象接口

  /** 接口返回读取路径，默认配置如下。 **/
  fldsPathInResp: {
    pageNum: 'data.pageNum', // 页码，接口不提供的可不配
    pageSize: 'data.pageSize', // 每页条数，接口不提供的可不配
    total: 'data.total', // 总数
    list: 'data.list', // record列表，是一个数组
    errorMsg: ['message', 'msg', 'resultMsg'], // 错误信息对应的字段，可配置多个， 从前到后尝试读取
    permissionApplyUrl: ['permissionApplyUrl'], // 权限申请链接对应的字段，如success:false并返回该字段，会弹窗提示申请权限
    extraPayload: 'data.extraPayload', // 附加数据，比如接口在list之外返回了额外信息
  },
  /** 分页字段映射，默认配置如下，可换成接口实际定义的参数 **/
  searchParamsMap: {
    pageNum: 'pageNum', // 页码
    pageSize: 'pageSize', // 每页条数
  },
});
```

更多接口相关的内容请参见[这里](/guide/service)

#### StandContextHoc

StandContextHoc 是 StandAdmin 的核心，[HOC](https://reactjs.org/docs/higher-order-components.html)有两方面的作用：

1. 对内给包裹的组件 MainComp 提供 [StandContext](https://standadmin.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/admin-demo/big-context)，内含大量的 API，辅助各类功能（查询、列表、新建/编辑）的实现

2. 对外提供一个新的高阶组件 AdminComp，该组件支持定制参数，从而可以方便的将整个 CRUD 管理功能嵌入不同的地方

```jsx | pure
// main.js
// defineContextHocParams 的主要目的是利用 Typescipt 的提示功能，更多的参数请参见 API 部分
const hocParams = defineContextHocParams({
  recordModel,
  configModel,
  defaultSearchParams: { status: 1 }, // 默认的查询参数
  specSearchParams: { source: 'demo' }, // 强制的查询参数
});

// 构建高阶组件
const AdminComp = StandContextHoc(hocParams)(MainComp);

() => {
  // 设定默认查询参数
  return <AdminComp defaultSearchParams={{ status: 2 }} />;
};
```

### 查询表单

[代码](http://github.com/StandAdmin/stand-admin-antdpro-demo/blob/main/src/pages/Demos/BaseDemo/SearchForm/index.js)

#### useStandSearchForm

useStandSearchForm 是专门辅助查询功能的 Hooks

> 注：查询表单的默认值可以通过 上层 HOC 的 defaultSearchParams 设定

```jsx | pure
// SearchForm/index.js
() => props => {
  const {
    config, // configModel里面的配置信息
    context, // StandContext
    FormItem, // 这个FormItem是对原始的Form.Item的一层封装，会对 specSearchParams 中指定的查询项自动disable
    formProps, // 通常直接传递给 <Form />即可
    resetForm, // 查询表单重置
  } = useStandSearchForm({
    ...getOptsForStandSearchForm(props), //根据外层props自动推断一些配置
    // 表单值（values）转查询参数（searchParams，之后会传递给searchRecords方法)
    searchParamsFromValues: values => {
      return { ...values };
    },
    // 查询参数（searchParams）转表单值
    searchParamsToValues: params => {
      return { ...params };
    },
  });

  const {
    searchLoading, // 查询Loading
    showEmptyRecordForm, // 新建
  } = context;

  return <Form {...formProps}>{/* ...各个FormItem... */}</FormItem>;
};
```

### 列表

[代码](http://github.com/StandAdmin/stand-admin-antdpro-demo/blob/main/src/pages/Demos/BaseDemo/List/index.js)

#### useStandTableList

useStandTableList 是专门辅助列表展示的 Hooks

```jsx | pure
// List/index.js
() => props => {
  const {
    config, // configModel里面的配置信息
    context, // StandContext
    tableListStyles, // 列表常用的一些样式
    standRender, // 默认的列表render方法，是Table+Pagination的一层简单封装
    // records, // 数据列表，自定义列表时使用
  } = useStandTableList({
    ...getOptsForStandTableList(props),
  });

  /**
   * 列表操作常用的一些API辅助
   */
  const {
    idFieldName, // recordModel 中配置的ID字段
    getRecordId, // 获取数据对象的ID
    getRecordName, // 获取数据对象的显示名
    deleteRecord, //删除动作
    callService, // 接口请求
    showRecordForm, // 弹出编辑，直接用列表数据赋值
    loadAndShowRecordForm, // 先拉取数据对象，再弹出编辑
  } = context;

  const columns = [
    /* ...各个Column... */
  ];

  return standRender({ autoScrollX: { defaultWidth: 150 }, columns });
};
```

### 新建/编辑

[代码](http://gitlab.alibaba-inc.com/yk-open/stand-admin-demo/blob/daily/9999.0.1/src/pages/Demos/BaseDemo/RecordForm/index.js)

#### useStandUpsertForm

useStandUpsertForm 是专门辅助新建/编辑的 Hooks，

```jsx | pure
// RecordForm/index.js
() => props => {
  const {
    config, // configModel里面的配置信息
    context, // StandContext
    formProps, // 通常直接传递给 <Form />即可
    modalProps, // 通常直接传递给 <Modal />即可
    activeRecord, // 通过showRecordForm传入的数据对象
    isUpdate, // update还是add，update需要满足 activeRecord[idFieldName] 非空
  } = useStandUpsertForm({
    ...getOptsForStandUpsertForm(props, {
      // 表单默认值
      defaultValues: {
        status: 1,
      },
    }),
    // 接口数据（通常来自于列表接口）转换为表单数据
    recordToValues: record => {
      return {
        ...record,
      };
    },
    // 表单数据转为接口数据（后续会传递给 addRecord/updateRecord）
    recordFromValues: values => {
      return {
        ...values,
      };
    },
  });

  const {
    getActionCount, // 获取Action（通常就是接口请求）计数,
  } = context;

  const isSubmitting = getActionCount() > 0; //这里会获取全部Action的计数，严谨处理的话，可以传入一个参数 upsertRecord

  return (
    <Modal
      // forceRender
      {...modalProps}
      width="70%"
      footer={null}
    >
      <Form {...formProps}>{/* ...各个FormItem... */}</Form>
    </Modal>
  );
};
```
