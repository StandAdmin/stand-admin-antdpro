import React, { Fragment } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Tag } from 'antd';
import classNames from 'classnames';
import StandRecordsHoc, { TRecordsHocCompProps } from '../RecordsHoc';
import BatchCheckHoc from '../../BatchCheckHoc';
import {
  IListCtrlHocParams,
  IListCtrlProps,
  IStandContextProps,
  IBatchCheckHocProps,
  IBatchCheckProps,
} from '../../interface';
import IdSelectCtrlHoc from './IdSelectCtrlHoc';

import styles from '../styles';

interface IListCtrlState {
  modalVisible: boolean | undefined;
}

export type TListCtrlProps<R> = IListCtrlProps<R> &
  IStandContextProps &
  IBatchCheckHocProps<R> &
  IBatchCheckProps<R>;

function defaultModalTriggerRender({
  props,
  showModal,
}: {
  props: TListCtrlProps<any>;
  showModal: () => void;
}) {
  const {
    checkedList,
    recordNsTitle,
    getRecordId,
    getRecordName,
    modalTriggerDisabled,
    modalTriggerTitle,
    modalTriggerClassName,
    toggleChecked,
  } = props;

  return (
    <div className={modalTriggerClassName}>
      <Button
        onClick={showModal}
        icon={<PlusCircleOutlined />}
        disabled={modalTriggerDisabled}
      >
        选择{modalTriggerTitle || recordNsTitle} (已选 {checkedList.length})
      </Button>
      <div className={styles.tagList}>
        {checkedList.map(record => (
          <Tag
            key={getRecordId(record)}
            closable
            onClose={() => {
              toggleChecked(record, false);
            }}
          >
            {getRecordId(record)}
            {record ? `: ${getRecordName(record)}` : ''}
          </Tag>
        ))}
      </div>
    </div>
  );
}

export type TListCtrlHocCompProps<R> = TRecordsHocCompProps &
  IListCtrlProps<R> &
  IBatchCheckProps<R>;

export type TListCtrlHocComp<R> = React.ComponentType<
  TListCtrlHocCompProps<R>
> & {
  IdSelectCtrl: TListCtrlHocComp<R>;
};

export default function<R = any>(hocParams: IListCtrlHocParams<R>) {
  const { isModalMode = true, ...restOptions } = hocParams;

  return (WrappedComponent: React.ComponentType<any>): TListCtrlHocComp<R> => {
    class Comp extends React.Component<TListCtrlProps<R>, IListCtrlState> {
      static defaultProps = {
        isStandListCtrl: true,
        defaultModalVisible: false,
        disableSpecSearchParams: true,
      };

      static getDerivedStateFromProps(
        props: TListCtrlProps<R>,
        state: IListCtrlState,
      ) {
        if ('modalVisible' in props) {
          return {
            ...state,
            modalVisible: props.modalVisible,
          };
        }
        return null;
      }

      constructor(props: TListCtrlProps<R>) {
        super(props);
        this.state = {
          modalVisible:
            'modalVisible' in props
              ? props.modalVisible
              : props.defaultModalVisible,
        };
      }

      componentDidMount() {
        const { searchRecordsOnMount } = this.props;

        if (!searchRecordsOnMount) {
          if (!isModalMode || this.isModalVisible()) {
            this.props.debouncedSearchRecords();
          }
        }
      }

      componentDidUpdate(
        prevProps: IListCtrlProps<R>,
        prevState: IListCtrlState,
      ) {
        const prevModalVisible = this.isModalVisible(prevProps, prevState);
        const currModalVisible = this.isModalVisible();

        if (!prevModalVisible && currModalVisible) {
          const { resetSearchParamsOnModalShow } = this.props;
          this.props.debouncedSearchRecords(
            resetSearchParamsOnModalShow ? {} : undefined,
          );
        }
      }

      isModalVisible = (
        specProps?: IListCtrlProps<R>,
        specState?: IListCtrlState,
      ) => {
        const { modalProps = {} } = specProps || this.props;

        if (modalProps.visible !== undefined) {
          return modalProps.visible;
        }

        const { modalVisible } = specState || this.state;

        return modalVisible;
      };

      showModal = () => {
        this.toggleVisible(true);
      };

      hideModal = () => {
        this.toggleVisible(false);
      };

      toggleVisible = (v: boolean) => {
        this.setState({ modalVisible: v });

        const {
          onModalShow,
          onModalHide,
          onModalVisibleChange,
          resetCheckedOnModalShow,
          defaultCheckedList,
          setChecked,
        } = this.props;

        if (v) {
          if (resetCheckedOnModalShow) {
            setChecked(defaultCheckedList || []);
          }
          if (onModalShow) {
            onModalShow();
          }
        } else if (onModalHide) {
          onModalHide();
        }

        if (onModalVisibleChange) {
          onModalVisibleChange(v);
        }
      };

      handleOK = () => {
        const { checkedList } = this.props;

        this.hideModal();

        const { onModalOk } = this.props;
        if (onModalOk) {
          onModalOk({ checkedList });
        }
      };

      clearChecked = () => {
        this.props.clearChecked();
      };

      renderFooter = () => {
        const {
          isStandListCtrl,
          storeRef,
          checkedList,
          checkAll,
          isAllChecked,
          maxCheckedLength,
        } = this.props;

        const { records = [] } = storeRef || {};

        return (
          <div className={styles.footer}>
            {isStandListCtrl && (
              <>
                <div className={styles.block}>
                  {maxCheckedLength > 0 ? `限选 ${maxCheckedLength}，` : ''}已选{' '}
                  {checkedList.length}
                </div>
                <div className={styles.block}>
                  <Button
                    type="link"
                    disabled={isAllChecked(records)}
                    onClick={() => checkAll(records)}
                    // className={styles.opBtn}
                  >
                    全选
                  </Button>

                  <Button
                    type="link"
                    disabled={checkedList.length === 0}
                    onClick={this.clearChecked}
                    // className={styles.opBtn}
                  >
                    清空
                  </Button>
                </div>
              </>
            )}
            <div className={classNames(styles.block, styles.right)}>
              {/* <Button style={{ marginRight: 12, width: 80 }} onClick={this.hideModal}>
                取消
              </Button> */}
              <Button
                style={{ width: 80 }}
                type="primary"
                onClick={this.handleOK}
              >
                确定
              </Button>
            </div>
          </div>
        );
      };

      renderModalTrigger = () => {
        const { modalTrigger = defaultModalTriggerRender } = this.props;

        if (typeof modalTrigger === 'function') {
          return modalTrigger(this);
        }

        return modalTrigger;
      };

      onCheckChange = (checked: boolean, record: R) => {
        this.props.toggleChecked(record, checked);
      };

      onModalAfterClose = () => {
        const { modalProps = {}, clearCheckedAfterClose } = this.props;

        const { afterClose: origAfterClose } = modalProps || {};

        if (clearCheckedAfterClose) {
          this.clearChecked();
        }

        if (origAfterClose) {
          origAfterClose();
        }
      };

      renderModal = (mainContent: React.ReactElement) => {
        const { recordNsTitle } = this.props;

        const { modalProps, modalWrapperClassName } = this.props;

        const modalVisible = this.isModalVisible();

        return (
          <Modal
            wrapClassName={classNames(
              styles.modalWrapper,
              modalWrapperClassName,
            )}
            title={`选择${recordNsTitle}`}
            // onOk={this.handleOk}
            onCancel={this.hideModal}
            // afterClose={this.onAfterClose}
            width="80%"
            footer={this.renderFooter()}
            destroyOnClose
            {...modalProps}
            afterClose={this.onModalAfterClose}
            visible={modalVisible}
          >
            {React.cloneElement(mainContent, {
              toggleModalVisible: this.toggleVisible,
            })}
          </Modal>
        );
      };

      render() {
        const {
          modalProps,
          modalTrigger,
          modalTriggerTitle,
          modalWrapperClassName,
          modalTriggerClassName,
          ...restProps
        } = this.props;

        const mainContent = (
          <WrappedComponent
            {...restProps}
            {...{
              isModalMode,
            }}
          />
        );

        return isModalMode ? (
          <Fragment>
            {this.renderModalTrigger()}
            {this.renderModal(mainContent)}
          </Fragment>
        ) : (
          mainContent
        );
      }
    }

    const standHoc = StandRecordsHoc({
      syncParamsToUrl: !isModalMode,
      searchRecordsOnMount: false,
      ...restOptions,
    });

    const CompWithBatchCheck = BatchCheckHoc()(Comp as any);

    const CompWithIdSel = IdSelectCtrlHoc(hocParams)(CompWithBatchCheck);

    const FinalComp = standHoc(CompWithBatchCheck) as TListCtrlHocComp<R>;

    FinalComp.IdSelectCtrl = standHoc(CompWithIdSel) as TListCtrlHocComp<R>;

    return FinalComp;
  };
}
