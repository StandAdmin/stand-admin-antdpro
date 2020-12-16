import React from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Empty, Pagination, message } from 'antd';
import classNames from 'classnames';
import { isEqual, debounce, pick } from 'lodash';
import { toUrlQuery, fromUrlQuery } from '../../utils/urlQueryHelper';
import ActionCounterHoc from '../../ActionCounterHoc';
import { StandContext } from '../../const';
import {
  IRecordsProps,
  IRecordsHocParams,
  IActionCounterHocProps,
  // TAsyncFnAny,
  IStoreActionParams,
  IServiceParams,
  TCommonObjOrEmpty,
  IRecordsHocBaseParams,
  ICommonObj,
} from '../../interface';

import styles from '../styles';

export type TRecordsHocCompProps = IRecordsHocBaseParams & ICommonObj;

export type TRecordsHocComp = React.ComponentType<TRecordsHocCompProps>;

let baseMountId = 1;

const getNewMountId = () => {
  baseMountId += 1;
  return baseMountId;
};

export default function(hocParams: IRecordsHocParams) {
  const { recordModel, configModel, connect, ...restHocParams } = hocParams;

  const { idFieldName = 'id', nameFieldName = 'name', StoreNsTitle, StoreNs } =
    recordModel || {};

  const { StoreNs: ConfigStoreNs } = configModel || {};

  const defaultRestHocParams = {
    updateSearchParamsEvenError: false,
    passSearchWhenParamsEqual: false,
    syncParamsToUrl: true,
    urlParamsNs: false,
    searchRecordsOnMount: true,
    searchRecordsOnParamsChange: true,
    searchRecordsOnRefresh: true,
    defaultSearchParams: undefined,
    specSearchParams: undefined,
    sorterSearchParams: undefined,
    reservedUrlParamNames: [],
    useLastSavedSearchParamsOnMount: false,
    ...restHocParams,
  };

  return (WrappedComponent: React.ComponentType<any>): TRecordsHocComp => {
    class Comp extends React.Component<IRecordsProps & IActionCounterHocProps> {
      static defaultProps = {
        ...defaultRestHocParams,
      };

      mountId: number = -1;

      debouncedSearchRecords: (specParams?: any) => Promise<any>;

      latestSearchParams: any;

      autoRegisteredStoreNsMap: { [key: string]: boolean } = {};

      constructor(props: any) {
        super(props);

        this.debouncedSearchRecords = debounce(this.searchRecords, 10) as any;

        this.mountId = getNewMountId();
      }

      async componentDidMount() {
        await this.tryRegisterModels();

        this.resetRecordsState();

        const { searchRecordsOnMount } = this.props;

        if (searchRecordsOnMount) {
          this.searchRecords();
        }
      }

      componentDidUpdate(prevProps: IRecordsProps) {
        const { searchRecordsOnParamsChange } = this.props;

        if (searchRecordsOnParamsChange) {
          const searchParamsChanged = !isEqual(
            this.getFinalSearchParams(prevProps),
            this.getFinalSearchParams(this.props),
          );

          if (searchParamsChanged) {
            const { searchLoading } = this.props;

            if (!searchLoading) {
              this.debouncedSearchRecords();
            }
          }
        }
      }

      async componentWillUnmount() {
        await this.tryUnregisterModels();
        this.resetRecordsState(null);
      }

      resetRecordsState = (mountId?: number | null) => {
        const { dispatch } = this.props;

        dispatch({
          type: `${StoreNs}/resetRecordsState`,
          mountId: mountId !== undefined ? mountId : this.mountId,
        });
      };

      getDvaApp = () => {
        const { getDvaApp } = this.props;

        const app = getDvaApp();

        if (!app) {
          throw new Error('App still empty now!!');
        }

        return app;
      };

      isModelNsExists = (namespace: string) => {
        const app = this.getDvaApp();

        // eslint-disable-next-line no-underscore-dangle
        const existModels = app._models;

        if (!existModels) {
          throw new Error('_models not exists on app');
        }

        return existModels.some((model: any) => model.namespace === namespace);
      };

      getRelModelPkgs = () => {
        return [recordModel, configModel];
      };

      tryRegisterModels = () => {
        const app = this.getDvaApp();

        this.getRelModelPkgs().forEach(modelPkg => {
          if (modelPkg.isDynamic) {
            if (this.isModelNsExists(modelPkg.StoreNs)) {
              console.warn(`Model alreay exists: ${modelPkg.StoreNs}`);
              return;
            }

            app.model(modelPkg.default);

            this.autoRegisteredStoreNsMap[modelPkg.StoreNs] = true;
          }
        });
      };

      tryUnregisterModels = () => {
        const app = this.getDvaApp();

        this.getRelModelPkgs().forEach(modelPkg => {
          if (this.autoRegisteredStoreNsMap[modelPkg.StoreNs]) {
            app.unmodel(modelPkg.StoreNs);

            delete this.autoRegisteredStoreNsMap[modelPkg.StoreNs];
          }
        });
      };

      getFinalSearchParams = (specProps?: IRecordsProps, specParams?: any) => {
        const props = specProps || this.props;

        const params = specParams || this.getSearchParams(props);

        const finalParams = {
          ...this.getDefaultSearchParams(props),
          ...params,
          ...this.getSpecSearchParams(props),
        };

        const { finalSearchParamsFilter } = props;

        return finalSearchParamsFilter
          ? finalSearchParamsFilter(finalParams)
          : finalParams;
      };

      calcParamsWithProp = (
        propKey: string,
        specProps?: IRecordsProps,
        ...rest: any[]
      ) => {
        const props = specProps || this.props;

        const defParams = (props as any)[propKey];

        return typeof defParams === 'function'
          ? defParams(...rest, props)
          : defParams;
      };

      /*
       默认参数
       */
      getDefaultSearchParams = (...args: any) => {
        return this.calcParamsWithProp('defaultSearchParams', ...args);
      };

      /*
       指定参数
       */
      getSpecSearchParams = (...args: any) => {
        return this.calcParamsWithProp('specSearchParams', ...args);
      };

      getSorterSearchParams = (...args: any) => {
        return this.calcParamsWithProp('sorterSearchParams', ...args);
      };

      getFilterSearchParams = (...args: any) => {
        return this.calcParamsWithProp('filterSearchParams', ...args);
      };

      searchRecords = (specParams?: TCommonObjOrEmpty) => {
        const { dispatch, updateSearchParamsEvenError } = this.props;

        this.latestSearchParams = this.getFinalSearchParams(
          this.props,
          specParams,
        );

        return dispatch({
          type: `${StoreNs}/search`,
          params: this.latestSearchParams,
          opts: { updateSearchParamsEvenError },
        }) as Promise<any>;
      };

      getLatestSearchParams = () => {
        return this.latestSearchParams;
      };

      getUrlParams = (specProps?: IRecordsProps) => {
        const props = specProps || this.props;

        if (!props.location) {
          throw new Error('location not exists on props!');
        }

        return fromUrlQuery(props.location.search, { ns: props.urlParamsNs });
      };

      getSearchParams = (specProps?: IRecordsProps) => {
        const props = specProps || this.props;

        const { syncParamsToUrl } = props;

        let params;

        if (syncParamsToUrl) {
          params = this.getUrlParams(props);
        } else {
          const { storeRef } = props;
          params = storeRef.searchParams;
        }

        return params;
      };

      reloadSearch = () => {
        const { storeRef } = this.props;
        this.searchRecords(storeRef.searchParams);
      };

      goSearch = async (params = {}) => {
        const {
          reservedUrlParamNames,
          syncParamsToUrl,
          passSearchWhenParamsEqual,
          urlParamsNs,
          history,
        } = this.props;

        const urlQueryParams = { ns: urlParamsNs };

        if (syncParamsToUrl) {
          if (!this.props.location) {
            throw new Error('location not in props');
          }

          let reservedParams = {};

          if (reservedUrlParamNames && reservedUrlParamNames.length > 0) {
            reservedParams = pick(
              fromUrlQuery(this.props.location.search, urlQueryParams),
              reservedUrlParamNames,
            );
          }

          const newQueryStr = toUrlQuery(
            { ...reservedParams, ...params },
            urlQueryParams,
          );
          const oldQueryParams = fromUrlQuery(
            this.props.location.search,
            urlQueryParams,
          );

          if (
            isEqual(oldQueryParams, fromUrlQuery(newQueryStr, urlQueryParams))
          ) {
            if (passSearchWhenParamsEqual) {
              return;
            }

            this.searchRecords(params);
            return;
          }

          history.push({
            pathname: history.location.pathname,
            search: newQueryStr,
          });

          return;
        }

        this.searchRecords(params);
      };

      showEmptyRecordForm = () => {
        this.showRecordForm(null);
      };

      hideRecordFormOnly = () => {
        const { dispatch, onRecordFormVisibleTagChange } = this.props;
        (dispatch({
          type: `${StoreNs}/hideRecordFormOnly`,
        }) as Promise<any>).then(() => {
          if (onRecordFormVisibleTagChange) {
            onRecordFormVisibleTagChange(false);
          }
        });
      };

      showRecordForm = (activeRecord: any, recordFormVisibleTag = true) => {
        const { dispatch, onRecordFormVisibleTagChange } = this.props;
        (dispatch({
          type: `${StoreNs}/showRecordForm`,
          params: {
            activeRecord,
            recordFormVisibleTag,
          },
        }) as Promise<any>).then(() => {
          if (onRecordFormVisibleTagChange) {
            onRecordFormVisibleTagChange(recordFormVisibleTag);
          }
        });
      };

      clearActiveRecord = () => {
        const { dispatch } = this.props;
        dispatch({
          type: `${StoreNs}/clearActiveRecord`,
        });
      };

      handleActionResponse = (
        resp: any,
        {
          action,
          actionTitle,
          payload,
          shouldRefresh = true,
          successMsg,
          blinkRecord = true,
        }: IStoreActionParams,
      ) => {
        if (resp && resp.success) {
          const { dispatch, searchRecordsOnRefresh, onRefresh } = this.props;

          if (successMsg !== false) {
            message.success(successMsg || `${actionTitle}成功！`);
          }

          const isUpsert = ['addRecord', 'updateRecord'].indexOf(action) >= 0;

          if (shouldRefresh) {
            if (searchRecordsOnRefresh) {
              this.searchRecords().then(() => {
                if (blinkRecord && isUpsert) {
                  const matchRecord = resp.data || payload.record;

                  if (matchRecord) {
                    dispatch({
                      type: `${StoreNs}/blinkRecordById`,
                      id: matchRecord[idFieldName],
                    });
                  }
                }
              });
            }

            if (onRefresh) {
              onRefresh();
            }
          }

          if (isUpsert) {
            this.hideRecordFormOnly();
          }
        }
      };

      callStoreAction = (args: IStoreActionParams) => {
        const {
          action,
          actionForCount: origActionForCount,
          payload: origPayload,
          StoreNs: specStoreNs,
          handleActionResponse = this.handleActionResponse,
        } = args;

        const actionForCount = origActionForCount || action;

        this.props.increaseActionCount(actionForCount);

        const { dispatch } = this.props;

        const { callStoreActionPayloadFilter } = this.props;

        let payload: any;

        if (callStoreActionPayloadFilter) {
          payload = callStoreActionPayloadFilter(action, origPayload);
        } else {
          payload = origPayload;
        }

        if (payload && payload.type) {
          throw new Error('type field is not allowed in  payload!');
        }

        return dispatch({
          type: `${specStoreNs || StoreNs}/${action}`,
          ...payload,
        })
          .then((resp: any) => {
            if (handleActionResponse) {
              handleActionResponse(resp, args);
            }

            return resp;
          })
          .finally(() => {
            this.props.decreaseActionCount(actionForCount);
          });
      };

      /** @deprecated use callStoreAction instead */
      callAction = (
        action: string,
        actionTitle: string,
        payload: any,
        shouldRefresh: boolean = true,
      ) => {
        // eslint-disable-next-line no-console
        console.warn('callAction is deprecated, use callStoreAction instead');
        return this.callStoreAction({
          action,
          actionTitle,
          payload,
          shouldRefresh,
        });
      };

      callService = ({
        serviceTitle,
        serviceFunction,
        serviceParams,
        ...rest
      }: IServiceParams) =>
        this.callStoreAction({
          action: 'callService',
          actionTitle: serviceTitle,
          payload: { serviceTitle, serviceFunction, serviceParams },
          ...rest,
        });

      addRecord = (record: any, callback: (resp: any) => void) => {
        return this.callStoreAction({
          action: 'addRecord',
          actionForCount: 'upsertRecord',
          actionTitle: `创建${StoreNsTitle}`,
          payload: { record, callback },
        });
      };

      updateRecord = (record: any, callback: (resp: any) => void) => {
        return this.callStoreAction({
          action: 'updateRecord',
          actionForCount: 'upsertRecord',
          actionTitle: `编辑${StoreNsTitle} [${[
            this.getRecordId(record),
            this.getRecordName(record),
          ]
            .filter(item => !!item)
            .join('：')}] `,
          payload: {
            record,
            callback,
          },
        });
      };

      deleteRecord = (params: any, callback: (resp: any) => void) => {
        return this.callStoreAction({
          action: 'deleteRecord',
          actionTitle: `删除${StoreNsTitle}`,
          payload: { params, callback },
        });
      };

      onShowSizeChange = (current: number, pageSize: number) => {
        const { storeRef } = this.props;

        const { pagination } = storeRef;

        this.handleTableChange({ ...pagination, current: 1, pageSize });
      };

      showTotal = (total: number) => `共 ${total.toLocaleString('en')} 条`;

      handlePageNumChange = (current: number, pageSize: number) => {
        this.handleTableChange({ current, pageSize });
      };

      handleTableChange = (
        { current, pageSize }: { current: number; pageSize: number },
        filters?: any,
        sorter?: any,
      ) => {
        const { searchParams = {} } = this.props.storeRef;

        const sorterParams = sorter
          ? this.getSorterSearchParams(this.props, sorter)
          : undefined;

        const filterParams = filters
          ? this.getFilterSearchParams(this.props, filters) || filters
          : undefined;

        const newSearchParams = {
          ...searchParams,
          ...sorterParams,
          ...filterParams,
          pageNum: current,
          pageSize,
        };

        const withUpdates = !isEqual(newSearchParams, searchParams);

        if (withUpdates) {
          this.goSearch({ ...searchParams, ...newSearchParams });
        }
      };

      renderEmpty = () => {
        const { searchLoading } = this.props;

        return (
          <Empty
            style={{ marginTop: 36 }}
            description={
              searchLoading ? (
                <span>
                  <LoadingOutlined style={{ marginRight: 4 }} />
                  加载中
                </span>
              ) : (
                undefined
              )
            }
          />
        );
      };

      renderPagination = ({ className, ...restProps }: any = {}) => {
        const { storeRef } = this.props;

        const { pagination } = storeRef;

        const { total } = pagination;

        if (total === undefined || total <= 0) {
          return null;
        }

        return (
          <Pagination
            // size="small"
            className={classNames(styles.pagination, className)}
            {...{
              ...pagination,
              onChange: this.handlePageNumChange,
              onShowSizeChange: this.onShowSizeChange,
              showTotal: this.showTotal,
              pageSizeOptions: [10, 20, 30, 50, 100].map(s => String(s)),
              showSizeChanger: true,
              // showQuickJumper: true,
            }}
            {...restProps}
          />
        );
      };

      getRecordId = (record: any) => record && record[idFieldName];

      getRecordName = (record: any) => record && record[nameFieldName];

      render() {
        const {
          getRecordName,
          clearActiveRecord,
          hideRecordFormOnly,
          updateRecord,
          addRecord,
          showRecordForm,
          deleteRecord,
          goSearch,
          getSearchParams,
          reloadSearch,
          searchRecords,
          getUrlParams,
          showEmptyRecordForm,
          callAction,
          renderPagination,
          renderEmpty,
          handleTableChange,
          getRecordId,
          getDefaultSearchParams,
          getSpecSearchParams,
          callStoreAction,
          callService,
          getLatestSearchParams,
          debouncedSearchRecords,
        } = this;

        const { wrapperClassName, ...restProps } = this.props;

        const {
          storeRef,
          configStoreRef,
          searchLoading,
          configLoading,
          increaseActionCount,
          decreaseActionCount,
          getActionCount,
          formNamePrefix = 'Form',
        } = this.props;

        const contextVal = {
          StoreNs,
          storeRef,
          configStoreRef,
          config: configStoreRef,
          searchLoading,
          configLoading,
          showEmptyRecordForm,
          recordNsTitle: StoreNsTitle,
          StoreNsTitle,
          getUrlParams,
          clearActiveRecord,
          hideRecordFormOnly,
          hideRecordForm: hideRecordFormOnly,
          updateRecord,
          addRecord,
          showRecordForm,
          deleteRecord,
          goSearch,
          getSearchParams,
          searchRecords,
          debouncedSearchRecords,
          idFieldName,
          nameFieldName,
          callAction,
          renderPagination,
          handleTableChange,
          getRecordId,
          reloadSearch,
          getRecordName,
          dispatch: this.props.dispatch,
          increaseActionCount,
          decreaseActionCount,
          getActionCount,

          getDefaultSearchParams,
          getSpecSearchParams,
          callStoreAction,
          callService,
          renderEmpty,
          formNamePrefix,
          getLatestSearchParams,
          isStoreDataStale: !!(
            storeRef &&
            storeRef.mountId &&
            this.mountId !== storeRef.mountId
          ),
          mountId: this.mountId,
        };

        return (
          <div
            className={classNames(
              styles.container,
              {
                [styles.searchLoading]: searchLoading,
                [styles.configLoading]: configLoading,
                [styles.loading]:
                  searchLoading || configLoading || getActionCount() > 0,
              },
              wrapperClassName,
            )}
          >
            <StandContext.Provider value={contextVal}>
              <WrappedComponent {...restProps} {...contextVal} />
            </StandContext.Provider>
          </div>
        );
      }
    }

    return connect(
      ({
        [StoreNs]: storeRef,
        [ConfigStoreNs]: configStoreRef,
        loading,
      }: any) => ({
        storeRef: storeRef || recordModel.default.state,
        configStoreRef: configStoreRef || configModel.default.state,
        searchLoading: loading.effects[`${StoreNs}/search`],
        configLoading: loading.effects[`${ConfigStoreNs}/loadConfig`],
      }),
    )(ActionCounterHoc()(Comp as any));
  };
}
