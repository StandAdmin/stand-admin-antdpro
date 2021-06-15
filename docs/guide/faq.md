---
title: 常见问题
order: 4
toc: menu
---

## StandAdmin 和 Umi（Bigfish/AntdPro） 的关系

Umi 是 App 级的脚手架，而 StandAdmin 可以算作 App 下的一个 Lib，专门针对 CRUD 性质的功能。

从历史路径的角度，StandAdmin 其实就是在 Umi 下写了太多 CRUD 后的一个沉淀。

## CRUD 是否专指增删改查

不是。理论上，CRUD 就是数据管理的全部，删除也可以归结为通常意义上的接口动作。从作者的经验来说，StandAdmin 对中后台功能的覆盖能力接近于 100%，只要涉及数据请求、展示都可以发挥作用。

## 学习成本

<p>
  <img alt="学习曲线" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*6RRuR4mD_18AAAAAAAAAAAAAARQnAQ" width="800" />
</p>

StandAdmin 是个代码型的框架，学习曲线接近于左侧的**对数曲线**，需要会用[React](https://reactjs.org/)、[Hooks](https://reactjs.org/docs/hooks-intro.html)、[Antd](https://ant.design/components/overview-cn/)（重点是 Form、Modal、Table），理念上更加推崇”一力降十会“（利用好基础能力，能够解决 200% 的问题）。

与之相对，也有很多配置型的方案，比如 SchemaForm，学习曲线更加接近于右侧的**指数曲线**，能配置的时候用配置是非常高效的，不能配置的时候，成本则会指数增长。

非专业前端，或者对 React 不熟悉的同学，可以直接从[示例站点](https://rooseve.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/)入手，改改代码，看看效果（其实大家都是这么学习做事的）。作者曾经接手过一个 angular1 的项目，完全不知道 angular1 是怎么回事儿，也没法学（版本太老了），但是可以从当前存在的代码里看出功能实现的”套路“，然后模仿着去写。

另外，这张图可以算是一个 CheatSheet

<p>
  <img alt="StandAdmin" src="https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*m8A3SLcGPlIAAAAAAAAAAAAAARQnAQ" width="800" />
</p>

## 关于提效

个人观点，泛泛的说提效 20%、30% 是在一本正经的胡说八道，中后台的业务的场景非常杂，界面上看起来很普通的系统，代码量也可能很大，换句话说，分母都说不清楚，又何来比例？

StandAdmin 的提效包含（不限于）两个方面：

- 省去或者方便了一些事情，比如：

  - 请求控制，比如查询、删除、新建等
  - 状态控制，比如查询按钮和列表的 Loading
  - 表单控制，比如查询默认值，编辑数据恢复
  - 新建/编辑 弹窗（Modal）显隐控制

- 强化了一些事情，比如：

  - CRUD 整体就是一个组件，可以配置参数支持不同的展示，比如[关联展开](https://rooseve.github.io/stand-admin-antdpro-demo/#/stand-admin-antdpro-demo/admin-demo/row-expand)
  - [选取控件](https://admin-demo.abf.alibaba-inc.com/admin-demo/select-ctrl)和[CRUD](https://admin-demo.abf.alibaba-inc.com/admin-demo/base)基本是一套代码，只是用了不同的 Hoc（[StandSelectCtrlHoc](/api#standselectctrlhoc)、[StandContextHoc](/api#standcontexthoc)） 封装而已。
  - 查询功能支持 URL 参数同步，避免页面刷新后查询项丢失

## 非 Umi 体系是否适用

StandAdmin 的重点依赖其实是 [Dva](https://dvajs.com/guide/concepts.html)，非 Umi 体系请参照[这里](/guide#stand-admin-dva)

## 选择对应的 npm 包

- [@ali/stand-admin](https://npm.alibaba-inc.com/package/@ali/stand-admin)，适用于 [Bigfish](https://bigfish.antfin-inc.com/)
- [stand-admin-antdpro](https://www.npmjs.com/package/stand-admin-antdpro)，适用于 [AntdPro](https://pro.ant.design/index-cn)
- [stand-admin-dva](https://www.npmjs.com/package/stand-admin-dva)，适用于[其他体系](/guide#stand-admin-dva)

上述 npm 包主要是根据环境做一些适配性的工作，底层都是[stand-admin-base](https://www.npmjs.com/package/stand-admin-base)，[用法](/api) 上没有区别。

## 与 ProTable、ProForm 的区别

[ProTable](https://procomponents.ant.design/components/table)、[ProForm](https://procomponents.ant.design/components/form) 是更加集成的高级 UI 组件，适用于比较可控、固化的场景。

StandAdmin 针对通用意义上的 CRUD 场景，重心是逻辑而不是 UI（StandAdmin 默认假定 UI 是复杂多样的）。一方面尽量内置那些不可见的同质逻辑，比如状态管理等；另一方面，不是控制 Table、Form 的 UI 细节，而是通过 hooks 提供必要的 api 以辅助 UI 细节的实现。这样常规场景下非常简单，复杂场景下也不需要推倒重来，做到“物尽其用、能省尽省“。

## 类组件怎么使用 useStandXXXXX 的能力

类组件获取[StandContext](/api#standcontext)可以参见[这里](http://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/pages/Demos/ContextAPI/ClassComp.js)

在类组件里使用 Hooks 的能力可以通过中转的方式进行，以`useStandSearchForm`为例：

```jsx | pure
class MyComp extends React.Component {
  render() {
    // this.props.xxxx
    return '....';
  }
}

function CompWrapper() {
  const propsFromHooks = useStandSearchForm({
    //...
  });

  // 把Hooks的返回通过props传递给MyComp
  return <MyComp {...propsFromHooks} />;
}
```
