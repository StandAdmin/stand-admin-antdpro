import { history, connect, getDvaApp } from 'umi';
import { setConfig } from 'stand-admin-base';
export * from 'stand-admin-base';

// @ts-ignore
setConfig({
  getHistory: function getHistory() {
    return history;
  },
  getConnect: function getConnect() {
    return connect;
  },
  getDvaApp: function getDvaApp$1() {
    return getDvaApp();
  },
});
