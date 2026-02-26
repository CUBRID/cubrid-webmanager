import React, { useEffect, useState } from 'react';
import { Modal, Button, Checkbox, Table, Divider, Tabs } from 'antd';
import styles from '@/features/sidenav/styles/Modal.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from 'nanoid';
import { lockDBAPI } from '../../../../domain/database/databaseAPI';
import { setLockInformation } from '../../../sideNavSlice';


const LockInformation = (props) => {
  const {activeHost} = useSelector((state) => state.host);
  const {lockInformation} = useSelector((state) => state.sidenav);
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({});
  const [dataSource, setDataSource] = useState([]);

  const columns = [
    { title: 'Index', dataIndex: 'index', key: 'index' },
    { title: 'Pname', dataIndex: 'pname', key: 'pname' },
    { title: 'Uid', dataIndex: '@uid', key: 'uid' },
    { title: 'Host', dataIndex: 'host', key: 'host' },
    { title: 'Pid', dataIndex: 'pid', key: 'pid' },
    { title: 'Isolation level', dataIndex: 'isolevel', key: 'isolevel' },
    { title: 'Time out', dataIndex: 'timeout', key: 'timeout' },
  ];

  const objectLockColumns = [
    { title: 'Oid', dataIndex: 'oid', key: 'oid' },
    { title: 'Object Type', dataIndex: 'type', key: 'type' },
    { title: 'Num holders', dataIndex: 'numholder', key: 'numholder' },
    { title: 'Num blocked', dataIndex: 'numblock', key: 'numblock' },
    { title: 'Num waiters', dataIndex: 'numwaiter', key: 'numwaiter' },
  ];

  const refreshData = async () => {
    const response = await lockDBAPI(activeHost,  lockInformation.node.dbname);
    if(response.success) {
      const {dinterval, esc, lot, transaction} = response.result.lockinfo[0];
      setSettings({
        dinterval, esc, ...lot[0]
      });
      setDataSource(transaction);
    }
  }

  useEffect(() => {
   if(lockInformation.open) {
     refreshData();

   }
  }, [lockInformation]);

  const handleClose = () => {
    dispatch(setLockInformation({open: false}));

  }

  const LockSetting = ()=>{
    return (
      <>
        <div className={styles.db__layout}>
          <div className={'border__text'}>The lock setting for server</div>
          <div>The lock escalation: {settings.esc} </div>
          <div>Run deadlock interval: {settings.dinterval} </div>
        </div>
        <div className={styles.db__layout}>
          <div className={'border__text'}>Clients Currently</div>
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={dataSource}
            bordered
            columns={columns}
            pagination={false}
          />
        </div>
      </>
    );
  }

  const LockObject = () => {
    return (
      <>
        <div className={styles.db__layout}>
          <div className={'border__text'}>The content of object lock table</div>
          <div>Current number of objects which are locked = {settings.numlocked}</div>
          <div>Current number of object which are allocated = {settings.numallocated}</div>
          <div>Current size of objects which are allocated = {settings.sizelock}</div>
        </div>
        <div className={styles.db__layout}>
          <div className={'border__text'}>Clients Currently</div>
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={[]}
            bordered
            columns={objectLockColumns}
            pagination={false}
          />
          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <Button type="primary">Detail</Button>
          </div>
        </div>
      </>
    );
  };



  return (
    <Modal
      title="Lock Information"
      width={800}
      open={lockInformation.open}
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

        <Tabs
          className={"full__width__tab"}
          defaultActiveKey="1"
          centered
          items={[
            {
              label: 'Lock setting / client information',
              key: nanoid(4),
              children: <LockSetting/>,
            },
            {
              label: 'Object lock table',
              key: nanoid(4),
              children: <LockObject/>,
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default LockInformation;
