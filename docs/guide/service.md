---
title: 接口相关
order: 5
toc: menu
---

## 接口返回格式示意

<a id="searchRecords"></a>

### searchRecords - 查询接口

```json
{
  "success": true, // boolean, 标识请求是否成功
  "message": null, // 错误信息，success为false时提示用户
  "data": {
    "list": [
      {
        "id": 1,
        "name": "规则"
        //....
      }
    ], // 查询结果列表
    "total": 1, // 总数
    "pageNum": 1, // 页码，可选
    "pageSize": 10, // 每页条数，，可选
    "extraPayload": null //附加数据，可选
  }
}
```

<a id="getRecord"></a>

### getRecord - 单条记录查询接口

```json
{
  "success": true, // boolean, 标识请求是否成功
  "message": null, // 错误信息，success为false时提示用户
  "data": {
    "id": 1,
    "name": "规则"
    //....
  } // 单一查询结果，如不存在可以为null
}
```

<a id="addRecord"></a>
<a id="updateRecord"></a>

### addRecord/updateRecord - 新建、编辑接口

```json
{
  "success": true, // boolean, 标识请求是否成功
  "message": null, // 错误信息，success为false时提示用户
  "data": {
    "id": 2,
    "name": "规则2"
  } // 新建、更新后的记录，推荐返回
}
```

<a id="deleteRecord"></a>

### deleteRecord - 删除接口

```json
{
  "success": true, // boolean, 标识请求是否成功
  "message": null // 错误信息，success为false时提示用户
}
```

### xxxAction - 动作接口

```json
{
  "success": true, // boolean, 标识请求是否成功
  "message": null // 错误信息，success为false时提示用户
}
```

<a id="fldsPathInResp"></a>

## 格式不一致的处理

- 借助 recordModel 中的 `fldsPathInResp` 配置，适用于简单的路径映射

  ```json
  // buildStandRecordModelPkg
  {
    "fldsPathInResp": {
      "pageNum": "data.pageNum", // 页码，接口不提供的可不配
      "pageSize": "data.pageSize", // 每页条数，接口不提供的可不配
      "total": "data.total", // 总数
      "list": "data.list", // record列表，是一个数组
      "errorMsg": ["message", "msg", "resultMsg"], // 错误信息对应的字段，可配置多个， 从前到后尝试读取
      "permissionApplyUrl": ["permissionApplyUrl"], // 权限申请链接对应的字段，如success:false并返回该字段，会弹窗提示申请权限
      "extraPayload": "data.extraPayload" // 附加数据，比如接口在list之外返回了额外信息
    }
  }
  ```

- 对接口返回统一做处理，使其符合上述要求的格式，对特定业务来说这通常是一次性的工作

  ```javascript | pure
  export async function searchRecords(params) {
    return request(`/api/v1/demo_rest/searchRecords?${stringify(params)}`).then(
      resp => {
        // 这里对返回做标准化处理
        const standResp = myApiFilter(resp);
        return standResp;
      },
    );
  }
  ```

## 分页参数

传递给 searchRecords 的 params 中存在分页参数，默认是 `pageNum`、`pageSize`，可通过 [recordModel](/api#buildstandrecordmodelpkg) 中的 `searchParamsMap` 配置

```json
// buildStandRecordModelPkg
{
  "searchParamsMap": {
    "pageNum": "pageNum", // 页码
    "pageSize": "pageSize" // 每页条数
  }
}
```
