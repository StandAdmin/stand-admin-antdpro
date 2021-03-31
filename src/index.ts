// @ts-ignore
import { getDvaApp, history, connect } from 'umi';

import { setConfig } from 'stand-admin-base';

setConfig({
  getHistory: () => {
    return history;
  },
  getConnect: () => {
    return connect;
  },
  getDvaApp,
});

export * from 'stand-admin-base';
