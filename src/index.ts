// @ts-ignore
import { getDvaApp, history, connect } from 'umi';

import {
  StandRecordsHoc as OrigStandRecordsHoc,
  StandListCtrlHoc as OrigStandListCtrlHoc,
  StandConfigLoadingHoc as OrigStandConfigLoadingHoc,
  IRecordsHocParams,
  IListCtrlHocParams,
  IConfigLoadingHocParams,
} from 'stand-admin-base';

function getHistory() {
  return history;
}

function getConnect() {
  return connect;
}

const StandRecordsHoc = (params: IRecordsHocParams) => {
  return OrigStandRecordsHoc({ getDvaApp, getHistory, getConnect, ...params });
};

const StandListCtrlHoc = (params: IListCtrlHocParams<any>) => {
  return OrigStandListCtrlHoc({ getDvaApp, getHistory, getConnect, ...params });
};

const StandConfigLoadingHoc = (params: IConfigLoadingHocParams) => {
  return OrigStandConfigLoadingHoc({ getConnect, ...params });
};

export * from 'stand-admin-base';
export { StandRecordsHoc, StandListCtrlHoc, StandConfigLoadingHoc };
