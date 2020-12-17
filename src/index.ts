// @ts-ignore
import { getDvaApp, history, connect } from 'umi';

import {
  StandRecordsHoc as OrigStandRecordsHoc,
  StandListCtrlHoc as OrigStandListCtrlHoc,
  IRecordsHocParams,
  IListCtrlHocParams,
} from 'stand-admin-base';

const StandRecordsHoc = (params: IRecordsHocParams) => {
  return OrigStandRecordsHoc({ getDvaApp, history, connect, ...params });
};

const StandListCtrlHoc = (params: IListCtrlHocParams<any>) => {
  return OrigStandListCtrlHoc({ getDvaApp, history, connect, ...params });
};

export * from 'stand-admin-base';
export { StandRecordsHoc, StandListCtrlHoc };
