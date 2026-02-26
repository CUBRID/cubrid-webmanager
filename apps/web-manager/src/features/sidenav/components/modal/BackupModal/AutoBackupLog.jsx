import React, { useEffect, useState } from 'react';
import { Modal, Button, Table, Divider } from 'antd';
import styles from '@/features/sidenav/styles/Modal.module.css';
import { getAutoBackupDBErrLogAPI } from '../../../../domain/log/logAPI';
import { useDispatch, useSelector } from 'react-redux';
import { setAutoBackupLog } from '../../../sideNavSlice';
import { setBuffering } from '../../../../../shared/slice/globalSlice';

const AutoBackupLog = () => {
  const {activeHost} = useSelector((state) => state.host);
  const {autoBackupLog} = useSelector((state) => state.sidenav);
  const dispatch = useDispatch();
  const [dataSource, setDataSource] = useState([]);
  const columns = [
    { title: 'Database', dataIndex: 'dbname', key: 'dbname' },
    { title: 'Backup ID', dataIndex: 'backupid', key: 'backupid' },
    { title: 'Log Time', dataIndex: 'error_time', key: 'error_time' },
    { title: 'Description', dataIndex: 'error_desc', key: 'error_desc' },
  ];

  const refreshData = ()=>{
    dispatch(setBuffering(true))
    getAutoBackupDBErrLogAPI(activeHost).then((res) => {
      if (res.success) {
        if (res.result.error) {
          setDataSource(res.result.error);
        }
      }
    }).finally(() => {
      dispatch(setBuffering(false))
    });
  }
  useEffect(() => {
    if (autoBackupLog.open) {
      refreshData()
    }
  }, [autoBackupLog]);
  const handleClose = () => {
    dispatch(setAutoBackupLog({ open: false }));
  }
  return (
    <Modal
      width={740}
      title="Auto Backup Log"
      open={autoBackupLog.open}
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
        <div className={styles.title}>Below you can view the unload database result</div>
        <Divider />
        <Table dataSource={dataSource} bordered columns={columns} pagination={false} />
      </div>
    </Modal>
  );
};

export default AutoBackupLog;
