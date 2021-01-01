# CRUD framework works perfectly with Antd Pro

## Demo

[Basic usage](https://github.com/rooseve/stand-admin-antdpro-demo/tree/main/src/pages/StandAdminDemo)

## Important

Disable Dva model validate in [config/config.ts](https://github.com/rooseve/stand-admin-antdpro-demo/blob/main/config/config.ts), like this:

```
dva: {
   skipModelValidate: true,
},
```

## Usage

1. Privide [CURD](https://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/pages/StandAdminDemo/service.example.ts) Services

2. Wrap Dva Models(Config and Record), in StandAdmin way.

   - [ConfigModel](https://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/pages/StandAdminDemo/models/Config.js), store global configs, e.g. enumeration, select options
   - [RecordModel](https://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/pages/StandAdminDemo/models/Record.js), link the CRUD services

3. Do the admin work
   - [Entry](https://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/pages/StandAdminDemo/main.js)
     - StandRecordsHoc
     - StandListCtrlHoc
   - [SearchForm](https://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/pages/StandAdminDemo/SearchForm/index.js)
     - useStandSearchForm
   - [UpsertForm](https://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/pages/StandAdminDemo/RecordForm/index.js)
     - useStandUpsertForm
   - [List](https://github.com/rooseve/stand-admin-antdpro-demo/blob/main/src/pages/StandAdminDemo/List/index.js)
     - useStandTableList
