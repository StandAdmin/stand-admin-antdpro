import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'StandAdmin',

  favicon:
    'https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*f4vPTrs3kVwAAAAAAAAAAAAAARQnAQ',
  logo:
    'https://gw.alipayobjects.com/mdn/rms_9ac13c/afts/img/A*f4vPTrs3kVwAAAAAAAAAAAAAARQnAQ',

  outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config

  mode: 'site',
  locales: [
    //['en-US', 'English'],
    ['zh-CN', '中文'],
  ],
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css',
      },
    ],
  ],
  navs: {
    'zh-CN': [
      null,
      {
        title: 'Demo',
        path: 'https://rooseve.github.io/stand-admin-antdpro-demo',
      },
      {
        title: '讨论区',
        path: 'https://github.com/rooseve/stand-admin-antdpro-demo/issues',
      },
    ],
  },
});
