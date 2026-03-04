import React, { useEffect, useState } from 'react';
import { Modal, Button, Table } from 'antd';
import styles from '@/features/sidenav/styles/Modal.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { setAutoQueryLog } from '../../../sideNavSlice';
import { getAutoExecQueryErrLog } from '../../../../domain/log/logAPI';
import { result } from 'lodash/object';

const AutoQueryLog = () => {
  const {activeHost} = useSelector((state) => state.host);
  const {autoQueryLog} = useSelector((state) => state.sidenav);
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState([]);
  const columns = [
    { title: 'Database', dataIndex: 'dbname', key: 'dbname' },
    { title: 'CM User', dataIndex: '@username', key: '@username' },
    { title: 'Query ID', dataIndex: 'query_id', key: 'query_id' },
    { title: 'Error Code', dataIndex: 'error_code', key: 'error_code' },
    { title: 'Description', dataIndex: 'error_desc', key: 'error_desc' },
  ];

  const refreshData = async () => {
    const response = await getAutoExecQueryErrLog(activeHost);
    if (response.success) {
      if(response.result.error) {
        setDataSource(response.result.error);
      }
    }
  }

  useEffect(() => {
    if(autoQueryLog.open){
      refreshData()
    }
  }, [autoQueryLog]);

  const handleClose = () => {
    dispatch(setAutoQueryLog({open: false}));
  }

  return (
    <Modal
      title="Auto Query Log"
      open={autoQueryLog.open}
      width={640}
      footer={() => {
        return (
          <>
            <Button type="primary" onClick={() => handleClose()}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => refreshData()}>
              Refresh
            </Button>
          </>
        );
      }}
    >
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <div className={styles.text__title}>Show auto query logs</div>
        <div className={styles.db__layout}>
          <div className={"border__text"}>
            Log
          </div>
          <Table dataSource={dataSource} bordered columns={columns} pagination={false} />
        </div>
        </div>
    </Modal>
  );
};

export default AutoQueryLog;
