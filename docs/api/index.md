---
title: API
order: 1
toc: menu
nav:
  title: API
  order: 2
---

## buildStandConfigModelPkg

> 放置配置性信息，比如各类枚举值。

示例：

```javascript | pure
const configModel = buildStandConfigModelPkg({
  getConfig: [
    // 异步函数
    async () => {
      const configMap = await fetch('/config/....');
      return { ...configMap };
    },
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

配置信息后续可通过 StandContext 中的`config`读取

| 参数      | 说明   | 类型                                  | 默认值 | 必填 |
| --------- | ------ | ------------------------------------- | ------ | ---- |
| getConfig | 配置项 | `(object \| () => Promise<object>)[]` | -      | -    |

## buildStandRecordModelPkg

> 放置数据对象相关的信息，涵盖一些元数据配置和 CRUD 接口。参数可根据实际情况填写，无相关功能（比如删除）时留空即可

示例：

```javascript | pure
const recordModel = buildStandRecordModelPkg({
  StoreNs: 'DemoRecord',
  StoreNsTitle: '规则',

  // 基础信息
  idFieldName: 'id',
  nameFieldName: 'name',

  /** CRUD services */
  searchRecords,
  // ...
});
```

| 参数            | 说明                                                                                                                                                          | 类型                                                                                                                     | 默认值  | 必填 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------- | ---- |
| StoreNs         | 数据对象的命名空间（类似于数据库的表名），需要**全局唯一**；<br/> 为方便调试，建议填写，不填时自动生成                                                        | `string`                                                                                                                 | -       | 是   |
| StoreNsTitle    | 数据对象的显示名（类似于数据库表的显示名），会影响相关显示，比如新建弹窗的 Title                                                                              | `string`                                                                                                                 | -       | 是   |
| idFieldName     | 数据对象的 ID 字段，可以唯一标识一条数据记录，会用于**更新**操作（ID 不存在时会被判定为**新增**）和列表的 rowKey；<br/> **如果实际数据没有提供，请手动生成!** | `string`                                                                                                                 | `id`    | 是   |
| nameFieldName   | 数据对象的显示名字段，会影响相关显示，比如编辑某条数据之后的反馈                                                                                              | `string`                                                                                                                 | `name`  | 是   |
| searchRecords   | 列表查询接口；[详细](/guide/service#searchRecords)                                                                                                            | `(params?: object ) => Promise<IResponseOfSearchRecords>`                                                                | -       | -    |
| getRecord       | 单条记录查询接口; 留空时会利用 searchRecords，返回首条记录；[详细](/guide/service#getRecord)                                                                  | `(params?: object ) => Promise<IResponseOfGetRecord>`                                                                    | -       | -    |
| addRecord       | 新建接口；[详细](/guide/service#addRecord)                                                                                                                    | `(record: object) => Promise<IResponseOfAction>`                                                                         | -       | -    |
| updateRecord    | 更新接口，通常情况下，record 参数只是比新建多出一个 `[idFieldName]` 字段；[详细](/guide/service#updateRecord)                                                 | `(record: object) => Promise<IResponseOfAction>`                                                                         | -       | -    |
| deleteRecord    | 删除接口；[详细](/guide/service#deleteRecord)                                                                                                                 | `(params?: object) => Promise<IResponseOfAction>`                                                                        | -       | -    |
| fldsPathInResp  | 接口返回的字段路径映射，可适用于一些简单的非标格式，复杂场景需要人工转换接口返回；[详细](/guide/service#fldsPathInResp)                                       | `{ [key]: string \| string[] }` <br> key 可以是 `pageNum`、`pageSize`、`total`、`list`、`errorMsg`、`permissionApplyUrl` | -       | -    |
| searchParamsMap | 查询用字段设置，目前仅包含分页相关的 `pageNum`、`pageSize`                                                                                                    | `{ "pageNum": string; "pageSize": string }`                                                                              | -       | -    |
| isDynamic       | 是否设为动态 Model，动态 Model 会在组件 unMount 时注销，通常不需要主动设置                                                                                    | `boolean`                                                                                                                | `false` | -    |

## StandContextHoc

> HOC 函数，对内提供 StandContext，辅助相关功能的实现

示例：

<a id="MainComp"></a>

```jsx | pure
const MainComp = props => {
  // 被StandContextHoc包裹后，即可使用StandContext
  const context = useStandContext();

  return <>{/* 查询、列表、新建/编辑 */}</>;
};
// hocParams 为defineContextHocParams的返回
const AdminComp = StandContextHoc(hocParams)(MainComp);

// AdminComp 可以通过props接收HOC的常用参数
const render = () => <AdminComp defaultSearchParams={{ status: 0 }} />;
```

### defineContextHocParams

> 定义常用的 HOC 参数；该方法的主要目的是利用 Typescipt 的提示功能

示例：

```javascript | pure
const hocParams = defineContextHocParams({
  recordModel,
  configModel,

  defaultSearchParams: { status: 1 },
  specSearchParams: { source: 'demo' },
});
```

| 参数                        | 说明                                                                                                                                                                                                                                                                 | 类型                          | 默认值                                                                   | 必填 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------ | ---- |
| configModel                 | buildStandConfigModelPkg 的返回；无配置信息时亦可留空                                                                                                                                                                                                                | -                             | -                                                                        | -    |
| recordModel                 | buildStandRecordModelPkg 的返回                                                                                                                                                                                                                                      | -                             | -                                                                        | -    |
| defaultSearchParams         | 默认的查询请求参数（也是查询表单的默认值）                                                                                                                                                                                                                           | `object \| (props) => object` | -                                                                        | -    |
| specSearchParams            | 强制指定的查询请求参数，默认实现中查询表单里对应的 FormItem 会被禁用                                                                                                                                                                                                 | `object \| (props) => object` | -                                                                        | -    |
| syncParamsToUrl             | 同步查询参数到 Url，这样页面刷新后可复原查询条件；取值`'auto'`时，会检测组件接收的 props 里面是否有 `histroy.location`（Umi 体系下 [route](http://github.com/StandAdmin/stand-admin-antdpro-demo/blob/main/config/router.config.js) 对应的组件会接收到），存在则开启 | `'auto' \| boolean`           | `auto`                                                                   | -    |
| reservedUrlParamNames       | 同步查询参数到 Url 时，当前 Url 中需要被保留下来的参数                                                                                                                                                                                                               | `string[]`                    | -                                                                        | -    |
| urlParamsNs                 | 将查询参数编码到单一 get 参数中；如页面存在[多个实例](https://standadmin.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/admin-demo/multi-ns)并同时启用 syncParamsToUrl，可借此实现 get 参数隔离                                                       | -                             | -                                                                        | -    |
| sorterSearchParams          | 由列表（Table）的列排序触发，[示例](http://github.com/StandAdmin/stand-admin-antdpro-demo/tree/main/src/pages/Demos/ColumnSort)                                                                                                                                      | `(sorter, props) => object`   | -                                                                        | -    |
| filterSearchParams          | 由列表（Table）的列筛选触发，[示例](http://github.com/StandAdmin/stand-admin-antdpro-demo/tree/main/src/pages/Demos/ColumnFilter)                                                                                                                                    | `(filters, props) => object`  | -                                                                        | -    |
| searchRecordsOnMount        | didMount 时是否触发查询                                                                                                                                                                                                                                              | `boolean`                     | `true`                                                                   | -    |
| searchRecordsOnParamsChange | [查询参数](/guide/advanced#searchParams) 变化时是否触发查询                                                                                                                                                                                                          | `boolean`                     | `true`                                                                   | -    |
| listRowSelectionSupport     | 列表（Table）是否开启列选择                                                                                                                                                                                                                                          | `boolean`                     | `false`                                                                  | -    |
| wrapperClassName            | 外层容器的类名                                                                                                                                                                                                                                                       | `string`                      | -                                                                        | -    |
| wrapperStyle                | 外层容器的样式                                                                                                                                                                                                                                                       | `React.CSSProperties`         | -                                                                        | -    |
| makeRecordModelPkgDynamic   | recordModel 的数据空间（StoreNs）是全局唯一的，多个组件实例共享一个 recordModel 会相互影响。`makeRecordModelPkgDynamic`非空时会调用[getDynamicModelPkg](/api#getdynamicmodelpkg) 复制出一个新的 recordModel，从而实现数据空间的[隔离](/guide/advanced#cloneModelPkg) | `string`                      | -                                                                        | -    |
| receiveContextAsProps       | 通过 props 传递 StandContext 中的特定内容；通常情况下无需修改                                                                                                                                                                                                        | `boolean \| string[]`         | `false`                                                                  | -    |
| receiveHocParamsAsProps     | 通过 props 传递 HocParams 中的特定内容；通常情况下无需修改                                                                                                                                                                                                           | `boolean \| string[]`         | `['defaultSearchParams', 'specSearchParams', 'listRowSelectionSupport']` | -    |
| placeholderIfConfigLoading  | configLoading 时输出占位符（默认`<Spin/>`）                                                                                                                                                                                                                          | `boolean \| ReactNode`        | `true`                                                                   | -    |

> 查询参数的优先级：
>
> ```jsx | pure
> const finalSearchParams = {
>   ...defaultSearchParams, // 默认参数
>   ...activeParams, // 变动参数，通常来自查询表单或者Url
>   ...specSearchParams, // 指定参数
> };
> ```

<a id="AdminCompProps"></a>
AdminComp 支持的 props（checked 相关的参数通常配合 listRowSelectionSupport 使用）：

| Prop               | 说明                                                 | 类型                       | 默认值 | 必填 |
| ------------------ | ---------------------------------------------------- | -------------------------- | ------ | ---- |
| ...Hoc 相关参数    | 见 [defineContextHocParams](#defineContextHocParams) | -                          | -      | -    |
| defaultCheckedList | 默认的选中行，record 匹配依靠`idFieldName`相等判断   | `record[]`                 | -      | -    |
| checkedList        | 选中行，受控模式                                     | `record[]`                 | -      | -    |
| maxCheckedLength   | 可选中的最大个数，需要>0                             | `number`                   | `-1`   | -    |
| onChange           | 选中项变化时触发                                     | `(list: record[]) => void` | -      | -    |

## StandSelectCtrlHoc

> HOC 函数，参数与 StandContextHoc 基本一致，但返回的是一个数据对象[选择组件](https://standadmin.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/admin-demo/select-ctrl)（通常用于 Form 中）；直观理解，就是把整套 CRUD 嵌在一个 Modal 中，同时开启 listRowSelectionSupport

示例：

```jsx | pure
// hocParams 为defineContextHocParams的返回
const SelectCtrlComp = StandSelectCtrlHoc(hocParams)(MainComp);
```

选择组件通常有两种用法：

- 选对象。value 是`record[]`格式，`valuePropName="checkedList"`

  ```jsx | pure
  <Form.Item label="选对象" name="objList" valuePropName="checkedList">
    <SelectCtrlComp />
  </Form.Item>
  ```

- 选 ID（使用 `SelectCtrlComp.IdSelectCtrl`）。value 是`id[]`格式，`valuePropName="checkedIdList"`（注意，不是 checkedList）

  > ID 模式会使用`recordModel.getRecord`用于显示还原（根据 id 获取 name），请确保正确配置！

  ```jsx | pure
  <Form.Item label="选ID" name="idList" valuePropName="checkedIdList">
    <SelectCtrlComp.IdSelectCtrl />
  </Form.Item>
  ```

<a name="pookie"></a>
SelectCtrlComp 支持的 props：

> SelectCtrlComp 默认的显示是 modalTrigger (如下图），点击后打开 Modal 进行选择
>
> <div><img width="600" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*rM7cTLyejRAAAAAAAAAAAAAAARQnAQ" /></div>

| Prop                          | 说明                                                                                                                         | 类型                                                      | 默认值  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------- |
| ...AdminComp 支持的 props     | 见 [AdminComp](#AdminCompProps)                                                                                              | -                                                         | -       | - |
| modalTriggerClassName         | modalTrigger 的外层容器的类名                                                                                                | `string`                                                  | -       | - |
| modalTriggerButtonRender      | 自定义 Button 部分的 render                                                                                                  | `(opts: IModalTriggerOpts) => ReactNode`                  | -       | - |
| modalTriggerCheckedListRender | 自定义 CheckedList 部分的 render                                                                                             | `(opts: IModalTriggerOpts) => ReactNode`                  | -       | - |
| modalTrigger                  | 自定义 modalTrigger 整体的 render（此时 `modalTriggerClassName`, `modalTriggerButtonRender`,`modalTriggerButtonRender`无效） | `(opts: IModalTriggerOpts) => ReactNode`                  | -       | - |
| modalProps                    | 弹窗 Modal 的 props（注意，不包含`visible`，请使用下述的`modalVisible`替代）                                                 | [ModalProps](https://ant.design/components/modal-cn/#API) | -       | - |
| modalWrapperClassName         | 弹窗 Modal 的外层类名                                                                                                        | `string`                                                  | -       | - |
| onModalShow                   | 显示弹窗时触发                                                                                                               | `() => void`                                              | -       | - |
| onModalHide                   | 隐藏弹窗时触发                                                                                                               | `() => void`                                              | -       | - |
| onModalVisibleChange          | 弹窗显隐变化时触发                                                                                                           | `(visible: boolean) => void`                              | -       | - |
| onModalOk                     | 点击弹窗确定按钮时触发                                                                                                       | `() => void`                                              | -       | - |
| defaultModalVisible           | 弹窗的默认显隐                                                                                                               | `boolean`                                                 | `false` | - |
| modalVisible                  | 弹窗的显隐，受控模式                                                                                                         | `boolean`                                                 | `false` | - |
| resetSearchParamsOnModalShow  | 弹窗打开时是否重置查询                                                                                                       | `boolean`                                                 | `false` | - |
| resetCheckedOnModalShow       | 弹窗打开时将选中项重置为 defaultCheckedList                                                                                  | `boolean`                                                 | `false` | - |
| clearCheckedAfterClose        | 弹窗关闭后清空选中项                                                                                                         | `boolean`                                                 | `false` | - |

SelectCtrlComp.IdSelectCtrl 额外支持的 props：

| Prop                 | 说明                                 | 类型                       | 默认值 | 必填 |
| -------------------- | ------------------------------------ | -------------------------- | ------ | ---- |
| defaultCheckedIdList | 默认的选中行 Id                      | `id[]`                     | -      | -    |
| checkedIdList        | 选中行 Id，受控模式                  | `id[]`                     | -      | -    |
| onChange             | 选中项变化时触发，仅附带 id          | `(idList: id[]) => void`   | -      | -    |
| onChangeWithData     | 选中项变化时触发，附带完整的数据对象 | `(list: record[]) => void` | -      | -    |

> ```javascript | pure
> interface IModalTriggerOpts {
>   props: IListCtrlHocProps; // SelectCtrlComp接收的props
>   showModal: () => void; // 显示Modal
>   hideModal: () => void; // 隐藏Modal
>   toggleModalVisible: (v: boolean) => void; // Modal显隐切换
>   context: IStandContextProps; // StandContext
> }
> ```

示例：

```jsx | pure
<SelectCtrlComp
  modalTriggerButtonRender={opts => {
    const { showModal, context } = opts;
    const { checkedList } = context;

    return (
      <Button type="primary" onClick={showModal}>
        选ID (已选 {checkedList.length})
      </Button>
    );
  }}
/>
```

## StandRecordInfoHoc

> 与 StandContextHoc 类似，区别是用 `getRecord` 实现 `searchRecords`，实现单条记录的查询。查询信息可通过 props 下的 recordInfo、recordInfoLoading 获取

示例：

```jsx | pure
function MainComp(props) {
  const { recordInfoLoading, recordInfo } = props;
  return recordInfo && <pre>{JSON.stringify(recordInfo, null, 2)}</pre>;
}

const hocParams = defineContextHocParams({
  recordModel, // 需要提供 getRecord 或者同等查询能力的 searchRecords
});

const RecordInfoComp = StandRecordInfoHoc(hocParams)(MainComp);

const render = () => (
  <>
    <RecordInfoComp specSearchParams={{ id: 1 }} />
  </>
);
```

注意：如果需要同时显示多个组件实例（比如不同的 id），请参照[数据空间隔离](/guide/advanced#cloneModelPkg)的做法！

## useStandContext

> Hooks，返回 StandContext

```jsx | pure
function MainComp(props) {
  const context = useStandContext();
  // do something with context
}
```

### StandContext

<a id="StandContext"></a>

[示例代码](http://github.com/StandAdmin/stand-admin-antdpro-demo/blob/main/src/pages/Demos/ContextAPI/APIDemo/index.js)

| 属性                   | 说明                                                                                                                                                                   | 类型                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| config                 | 配置信息，来自 `configModel`；`placeholderIfConfigLoading`开启的情况下，`config`为加载完成状态                                                                         | `object`                                                                                                                  | - |
| StoreNs                | 数据对象的命名空间，即`recordModel.StoreNS`                                                                                                                            | `string`                                                                                                                  |
| StoreNsTitle           | 数据对象的命名空间显示名，即`recordModel.StoreNsTitle`                                                                                                                 | `string`                                                                                                                  | - |
| idFieldName            | 数据对象的 ID 字段 ，即`recordModel.idFieldName`                                                                                                                       | `string`                                                                                                                  | - |
| nameFieldName          | 数据对象的 name 字段 ，即`recordModel.nameFieldName`                                                                                                                   | `string`                                                                                                                  | - |
| searchRecords          | 查询，调用 `recordModel.searchRecords`；相对而言，`goSearch`更加常用                                                                                                   | `(params?: object) => Promise<IResponseOfSearchRecords>`                                                                  | - |
| debouncedSearchRecords | [debounce](https://lodash.com/docs/#debounce) 版的 `SearchRecords`，wait=10ms                                                                                          | 同`searchRecords`                                                                                                         | - |
| goSearch               | 查询，与 `searchRecords` 的区别在于 `goSearch` 会同步查询参数到 URL（syncParamsToUrl 开启）                                                                            | 同`searchRecords`                                                                                                         | - |
| reloadSearch           | 刷新查询                                                                                                                                                               | 同`searchRecords`                                                                                                         | - |
| searchLoading          | 查询加载中                                                                                                                                                             | `boolean`                                                                                                                 | - |
| addRecord              | 添加数据对象，调用 `recordModel.addRecord`                                                                                                                             | `(record) => Promise<IResponseOfAction>`                                                                                  | - |
| updateRecord           | 更新数据对象，调用 `recordModel.updateRecord`                                                                                                                          | `(record) => Promise<IResponseOfAction>`                                                                                  | - |
| deleteRecord           | 删除数据对象，调用 `recordModel.deleteRecord`                                                                                                                          | `(params?: object) => Promise<IResponseOfAction>`                                                                         | - |
| callService            | 调用服务（通常就是接口请求），[示例](http://github.com/StandAdmin/stand-admin-antdpro-demo/blob/main/src/pages/Demos/RowAction/List/index.js)                          | `(params: IServiceParams) => Promise<IResponse>;` [IServiceParams 定义](#IServiceParams)                                  | - |
| getRecord              | 获取单条数据对象，调用 `recordModel.getRecord`或者`recordModel.searchRecords`                                                                                          | `(params?: object) => Promise<IRecord>`                                                                                   | - |
| getRecordId            | 返回数据对象的 ID，即`record[idFieldName]`                                                                                                                             | `(record) => id`                                                                                                          | - |
| getRecordName          | 返回数据对象的 name，即`record[nameFieldName]`                                                                                                                         | `(record) => name`                                                                                                        | - |
| storeRef               | 当前 state 信息，包括`searchParams`、`records`、`pagination`、`recordFormVisibleTag`、`activeRecord`等，[详见下](#IStoreRef)                                           | `object`                                                                                                                  | - |
| showEmptyRecordForm    | 显示新建弹窗，即设置 `recordFormVisibleTag = true`, `activeRecord = null`                                                                                              | `() => void`                                                                                                              | - |
| showRecordForm         | 显示编辑弹窗，即设置 `recordFormVisibleTag = true`, `activeRecord = record`                                                                                            | `(record, recordFormVisibleTag = true) => void`                                                                           | - |
| loadAndShowRecordForm  | 实时查询 record，然后显示编辑弹窗                                                                                                                                      | `(params?: object, recordFormVisibleTag = true) => void`                                                                  | - |
| hideRecordForm         | 隐藏编辑弹窗，即设置 `recordFormVisibleTag = false`,                                                                                                                   | `() => void`                                                                                                              | - |
| clearActiveRecord      | 清空`activeRecord`                                                                                                                                                     | `() => void`                                                                                                              | - |
| getDefaultSearchParams | 返回默认的查询参数，来自`hocParams.defaultSearchParams`                                                                                                                | `() => object`                                                                                                            | - |
| getSpecSearchParams    | 返回强制指定的查询参数，来自`hocParams.specSearchParams`                                                                                                               | `() => object`                                                                                                            | - |
| getSearchParams        | 返回当前查询参数，`syncParamsToUrl` 启用时从 Url 获取，否则返回`storeRef.searchParams`                                                                                 | `() => object`                                                                                                            | - |
| renderPagination       | 渲染分页，自定义列表时可手动调用                                                                                                                                       | `(params?: PaginationProps) => React.ReactNode`，[PaginationProps 定义](https://ant.design/components/pagination-cn/#API) | - |
| checkedList            | 选中项列表                                                                                                                                                             | `record[]`                                                                                                                | - |
| clearChecked           | 清空选中项                                                                                                                                                             | `() => void`                                                                                                              | - |
| isChecked              | 判断某条数据对象是否选中，匹配规则为 id 相同                                                                                                                           | `(record) => boolean`                                                                                                     | - |
| setChecked             | 设定`checkedList`，覆盖模式                                                                                                                                            | `(list: record[]) => void`                                                                                                | - |
| toggleChecked          | 设定指定数据对象的选中状态，追加模式                                                                                                                                   | `(list: record \| record[], checked: boolean) => void`                                                                    | - |
| increaseActionCount    | 增加某个动作的计数，通常于异步请求开始时调用（`callService`已内置该操作）                                                                                              | `(action?: string, num?: number) => void`                                                                                 | - |
| decreaseActionCount    | 减少某个动作计数，通常用于异步请求结束时调用（`callService`已内置该操作）                                                                                              | `(action?: string, num?: number) => void`                                                                                 | - |
| getActionCount         | 获取某个（些）动作的计数，以此判断动作是否进行中                                                                                                                       | `(action?: string \| string[]) => number`                                                                                 | - |
| updateConfig           | 更新 config，`getConfig`同`buildStandConfigModelPkg.getConfig`；`updateConfigLoading`标识是否更新 configLoading 状态，默认 `false`（configLoading 变化会影响页面输出） | `(getConfig, updateConfigLoading?: boolean,) => Promise<object>`                                                          | - |

<a id="IServiceParams"></a>

```javascript | pure
interface IServiceParams {
  serviceTitle: string; // 服务名称，比如：'发布'，会影响反馈提示
  serviceFunction: (...args: any[]) => Promise<IResponse>; // 服务调用函数，IResponse需包含 success 字段
  serviceParams: any[]; // 传递给serviceFunction的参数，比如：[ { id:1 }, 'online']
  actionForCount?: string; // 指定用于计数的action
  shouldRefresh?: boolean; // serviceFunction返回成功后(success:true)是否刷新列表，默认 true
  successMsg?: string | false; // serviceFunction返回成功后(success:true)的message提示，false时跳过
  handleActionResponse?: (resp: IResponse, params: IStoreActionParams) => void; // 自定义返回处置
}
```

<a id="IStoreRef"></a>

```javascript | pure
interface IStoreRef<R> {
  records: object[]; // 列表数据，即 searchRecords 的返回
  searchParams: object; // 查询参数
  pagination: { total; current; pageSize }; // 分页参数
  recordFormVisibleTag: boolean | number | string | object; // 编辑弹窗显隐标识，由 showRecordForm 设定
  activeRecord: object | null; // 编辑的数据对象，由 showRecordForm 设定
  removingRecord: object | null; // 处于删除中的数据对象
}
```

## useStandSearchForm

> 辅助查询表单的 Hooks

示例：

```jsx | pure
export default props => {
  const {
    config,
    FormItem,
    context,
    formProps,
    resetForm,
  } = useStandSearchForm({
    ...getOptsForStandSearchForm(props),
    searchParamsFromValues: values => {
      return { ...values };
    },
    searchParamsToValues: params => {
      return { ...params };
    },
  });

  const { searchLoading } = context;

  return (
    <Form {...formProps} layout="inline">
      <FormItem name="name" label="规则名称">
        <Input style={{ width: 150 }} />
      </FormItem>

      <FormItem className={styles.btnBlock}>
        <Button type="primary" htmlType="submit" loading={searchLoading}>
          查询
        </Button>
        <Button onClick={resetForm}>重置</Button>
      </FormItem>
    </Form>
  );
};
```

useStandSearchForm 的参数：

> getOptsForStandSearchForm 可以根据 props（透传自[MainComp](#MainComp)）推断一些参数，建议保留 `...getOptsForStandSearchForm(props)`

| 参数                   | 说明                                                                                    | 类型                                               | 默认值   | 必填 |
| ---------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------- | -------- | ---- |
| searchParamsToValues   | 查询参数（`storeRef.searchParams`）转表单值(`values`)                                   | `(params: object) => object`                       | -        | -    |
| searchParamsFromValues | 表单值转查询参数                                                                        | `(values: object, searchParams: object) => object` | -        | -    |
| disabledSearchParams   | 需要禁用的查询项名称；`getOptsForStandSearchForm`会检测`props.specSearchParams`进行推断 | `string[]`                                         | -        | -    |
| formIdTag              | Id 标识，会影响 Form 的 name，通常不需要主动设置                                        | `string`                                           | `Search` | -    |

useStandSearchForm 的返回：

| 属性                     | 说明                                                                                                                      | 类型                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| formProps                | 传递给 [Form](https://ant.design/components/form-cn/#API) 的 预设 props，包含`name`，`form`，`initialValues`，`onFinish`  | `object`                | - |
| submitForm               | 提交表单，即 `form.validateFields().then(onFinish)`                                                                       | `() => void`            | - |
| resetForm                | 重置表单                                                                                                                  | `() => void`            | - |
| form                     | 表单实例，即`formProps.form`                                                                                              | `FormInstance`          | - |
| config                   | 配置信息，即`context.config`                                                                                              | `object`                | - |
| context                  | [StandContext](#StandContext)                                                                                             | `StandContext`          | - |
| FormItem                 | [Form.FormItem](https://ant.design/components/form-cn/#Form.Item)的简单封装，支持通过 `disabledSearchParams` 设定禁用状态 | `string[]`              | - |
| renderFormHistroyTrigger | [表单草稿](/guide/advanced#FormHistroy)功能                                                                               | `() => React.ReactNode` | - |

## useStandTableList

> 辅助列表展示的 Hooks

示例：

```jsx | pure
export default props => {
  const { config, context, standRender } = useStandTableList({
    ...getOptsForStandTableList(props),
  });

  const { showRecordForm } = context;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <a
          onClick={() => {
            showRecordForm(record);
          }}
        >
          编辑
        </a>
      ),
    },
  ];

  return standRender({ columns });
};
```

useStandTableList 的参数：

> getOptsForStandTableList 可以根据 props（透传自[MainComp](#MainComp)）推断一些参数，建议保留 `...getOptsForStandTableList(props)`

| 参数                    | 说明                                                                                                                    | 类型      | 默认值  | 必填 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------- | ------- | ---- |
| listRowSelectionSupport | 是否启用 [Table](https://ant.design/components/table-cn/#API) 的 rowSelection，通常由`getOptsForStandTableList`自动推断 | `boolean` | `false` | -    |
| maxCheckedLength        | 可选中的最大个数，需要>0，通常由`getOptsForStandTableList`自动推断                                                      | `number`  | `-1`    | -    |

useStandTableList 的返回：

| 属性           | 说明                                   | 类型                                                                                                             |
| -------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| standRender    | 默认的列表 render 方法                 | `(params: IStandTableRenderParams) => React.ReactNode`，[IStandTableRenderParams 定义](#IStandTableRenderParams) | - |
| records        | 列表数据，即`context.storeRef.records` | `record[]`                                                                                                       | - |
| tableListProps | 默认列表的一些预设 props               | [TableProps](https://ant.design/components/table-cn/#API)                                                        | - |
| config         | 配置信息，即`context.config`           | `object`                                                                                                         | - |
| context        | [StandContext](#StandContext)          | `StandContext`                                                                                                   | - |

## useStandUpsertForm

> 辅助新建/编辑表单的 Hooks

示例：

```jsx | pure
export default props => {
  const {
    isUpdate,
    config,
    context,
    formProps,
    modalProps,
  } = useStandUpsertForm({
    ...getOptsForStandUpsertForm(props),
    // 表单默认值
    defaultValues: {
      status: 1,
    },
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

  const { getActionCount } = context;

  const isSubmitting = getActionCount() > 0;

  return (
    <Modal {...modalProps} width="70%" footer={null}>
      <Form {...formProps} {...formItemLayout}>
        <FormItem name="name" label="名称" rules={[{ required: true }]}>
          <Input allowClear />
        </FormItem>

        <FormItem>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {isUpdate ? '提交' : '创建'}
          </Button>
        </FormItem>
      </Form>
    </Modal>
  );
};
```

useStandUpsertForm 的参数：

> getOptsForStandUpsertForm 可以根据 props（透传自[MainComp](#MainComp)）推断一些参数，建议保留 `...getOptsForStandUpsertForm(props)`

| 参数             | 说明                                                                                                | 类型                                                                                                                                | 默认值   | 必填 |
| ---------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ---- |
| defaultValues    | 表单默认值                                                                                          | `object \| (options: { config }) => object`                                                                                         | -        | -    |
| recordToValues   | 数据对象（record，通常来自于接口）转换为表单数据（values）                                          | `(record, options: { config; defaultValues }) => object`                                                                            | -        | -    |
| recordFromValues | 表单数据转为数据对象                                                                                | `(values, activeRecord) => object`                                                                                                  | -        | -    |
| isModalVisible   | 弹窗显隐判断，配合`recordFormVisibleTag`使用可实现多个弹窗的显隐控制                                | `(recordFormVisibleTag) => boolean`                                                                                                 | -        | -    |
| submitValues     | 表单提交，默认实现依赖传入的`activeRecord`判断调用更新还是新建，更新时会自动附加`[idFieldName]`字段 | `(values, options: { config; context; activeRecord; isUpdate; addRecord; updateRecord; recordFormVisibleTag }): Promise<IResponse>` | -        | -    |
| onSuccess        | 表单提交成功时触发                                                                                  | `(resp: IResponse) => void`                                                                                                         | -        | -    |
| formIdTag        | Id 标识，会影响 Form 的 name，通常不需要主动设置                                                    | `string`                                                                                                                            | `Upsert` | -    |

useStandUpsertForm 的返回：

| 属性                     | 说明                                                                                                                                | 类型                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| formProps                | 传递给 [Form](https://ant.design/components/form-cn/#API) 的 预设 props，包含`name`，`form`，`initialValues`，`onFinish`            | `object`                     | - |
| modalProps               | 传递给 [Modal](https://ant.design/components/modal-cn/#API) 的 预设 props，包含`title`，`visible`，`onOK`，`onCancel`，`afterClose` | `object`                     | - |
| isUpdate                 | 编辑还是新建，`activeRecordId`非空时为编辑，否则为新建                                                                              | `boolean`                    | - |
| activeRecord             | 编辑针对的 record，通常由`showRecordForm`指定                                                                                       | `record \| null`             | - |
| activeRecordId           | 即`getRecordId(activeRecord)`                                                                                                       | `any`                        | - |
| submitForm               | 提交表单，即 `form.validateFields().then(onFinish)`                                                                                 | `() => void`                 | - |
| resetForm                | 重置表单                                                                                                                            | `() => void`                 | - |
| form                     | 表单实例，即`formProps.form`                                                                                                        | `FormInstance`               | - |
| config                   | 配置信息，即`context.config`                                                                                                        | `object`                     | - |
| context                  | [StandContext](#StandContext)                                                                                                       | `StandContext`               | - |
| recordFormVisibleTag     | 编辑弹窗显隐标识，由 showRecordForm 设定                                                                                            | `string \| number \| object` | - |
| renderFormHistroyTrigger | [表单草稿](/guide/advanced#FormHistroy)功能                                                                                         | `() => React.ReactNode`      | - |

## cloneModelPkg

> `recordModel.StoreNs`是全局唯一的，多个组件实例共享同一个 recordModel 时会[相互影响](https://standadmin.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/admin-demo/same-ns)，借助 `cloneModelPkg` 可以“克隆”出一个具备新的 `StoreNs` 的副本，从而实现状态空间的隔离

示例：

```javascript | pure
const recordModel = buildStandRecordModelPkg(opts);

const recordModelA = cloneModelPkg(recordModel, 'A', { StoreNsTitle: '规则A' });

const recordModelB = cloneModelPkg(recordModel, 'B', { StoreNsTitle: '规则B' });
```

| 参数     | 说明                                                                             | 类型     | 默认值   | 必填 |
| -------- | -------------------------------------------------------------------------------- | -------- | -------- | ---- |
| modelPkg | modelPkg 实例，通常来自`buildStandRecordModelPkg`                                | `object` | -        | 是   |
| nsTag    | 新的`StoreNs`中的一个标识                                                        | `string` | `_Clone` | -    |
| opts     | [buildStandRecordModelPkg](#buildstandrecordmodelpkg)支持的参数（`StoreNs`除外） | `object` | -        | -    |

## getDynamicModelPkg

> 即`cloneModelPkg(modelPkg, nsTag, { isDynamic: true })`, isDynamic 的意思是组件 unMount 时注销掉该 model

## standUtils

> 一些工具方法

| 属性                 | 说明                                                                      | 类型                                                |
| -------------------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| mapToOptions         | 将`{key:value}` 转换到 `[{label:value,value:key}]`                        | `(object, opts?:{ valueFilter:(val: any) => any })` | - |
| arrayToOptions       | 将`[value]` 转换到 `[{label:value,value}]`                                | `(object, opts?:{ valueFilter:(val: any) => any })` | - |
| stringifyQueryParams | Url 参数编码；该函数会试图保留参数的类型，比如`{id:1}`会被编码为`_n_id=1` | `(params: object) => string`                        | - |
| parseQueryString     | `stringifyQueryParams`的反函数                                            | `(query: string) => object`                         | - |
