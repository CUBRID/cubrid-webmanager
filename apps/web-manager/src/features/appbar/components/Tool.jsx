import React from 'react';
import DropdownMenu from './DropdownMenu.jsx';
import { useDispatch, useSelector } from 'react-redux';
import {
  setBrokerLogParser,
  setManageCMUser,
} from '@/features/appbar/appBarSlice.js';
import useDatabaseOperation from '../../domain/database/hook/useDatabaseOperation';
import { setBuffering } from '../../../shared/slice/globalSlice';
import useBrokerOperation from '../../domain/broker/hook/useBrokerOperation';
import { logger } from '../../../lib/log';
import { getSystemParamAPI } from '../../domain/CMSConfig/CMSConfigAPI';
import { extractParam } from '../../../lib/utils';

const Tool = () => {
  const { selectedObject } = useSelector((state) => state.global);
  const {activeHost} = useSelector((state) => state.host);
  const {databases} = useSelector((state) => state.database);
  const {brokers} = useSelector((state) => state.broker);
  const { startDatabase, stopDatabase } = useDatabaseOperation();
  const { startBroker, stopBroker, startAllBroker, stopAllBroker } = useBrokerOperation();
  const dispatch = useDispatch();
  const getStatusDBType = ()=>{

    if(selectedObject && selectedObject.type === 0){
      const db = databases.find(item => item.key === selectedObject.node.databaseId);
      if(db){
        return db.status === 'active' ? 1 : 2;
      }
    }
    return 0
  }
  const getStatusBrokerType = () => {
    if (selectedObject && selectedObject.type === 1) {
      const broker = brokers.find((item) => item.key === selectedObject.node.brokerId);
      if (broker) {
        return broker.state === 'ON' ? 1 : 2;
      }
    }
    return 0;
  };
  const onStartStopDB = async (status) => {
    const db = databases.find((item) => item.key === selectedObject.node.databaseId);
    dispatch(setBuffering(true));
    if (status === 'start') {
      await startDatabase(db);
    } else {
      await stopDatabase(db);
    }
    dispatch(setBuffering(false));
  }

  const onStartStopBroker = async (status) => {
    const broker = brokers.find((item) => item.key === selectedObject.node.brokerId);
    dispatch(setBuffering(true));
    if (status === 'start') {
      await startBroker(broker);
    } else {
      await stopBroker(broker);
    }
    dispatch(setBuffering(false));
  };

  const onStartStopService = async (status) => {
    const isStarting = status === 'start';
    dispatch(setBuffering(true));

    try {
      const response = await getSystemParamAPI(activeHost, 'cubrid.conf');

      // 1. Guard Clause: If we can't get the config, we shouldn't guess what to start
      if (!response?.success) {
        // Your API layer likely shows the error, so we just exit
        return;
      }

      const param = extractParam(response.result);
      // Use optional chaining and default to empty string to prevent crashes
      const serviceConfig = param?.[0]?.['service']["service"] || '';
      const serverConfig = param?.[0]?.['service']['server'] || '';
      const hasServer = serviceConfig.includes('server');
      const hasBroker = serviceConfig.includes('broker');

      if (isStarting) {
        // START LOGIC: DBs first, then Brokers
        if (hasServer) {

          const dbsToStart = databases
            .filter((db) => {
              if(serverConfig){
                const status = db.status !== 'active';
                return serverConfig.includes(db.dbname) && status
              }
            })
            .map((db) => startDatabase(db));
          await Promise.all(dbsToStart);
        }

        if (hasBroker) {
          await startAllBroker();
        }
      } else {
        // STOP LOGIC: Brokers first, then DBs
        if (hasBroker) {
          const isBrokerOn = brokers.find(broker=>broker.state === 'ON');
          if (isBrokerOn) {
            await stopAllBroker();
          }

        }

        if (hasServer) {
          const dbsToStop = databases
            .filter((db) => db.status === 'active')
            .map((db) => stopDatabase(db));
          await Promise.all(dbsToStop);
        }
      }
    } catch (error) {
      // Only log critical logic failures; API errors are handled by your interceptors
      logger.error(`Logic failure during ${status}:`, error);
    } finally {
      dispatch(setBuffering(false));
    }
  };

  const menus = [
    {
      label: 'Start Service',
      disabled: !activeHost.key,
      onClick: () => {
        onStartStopService('start');
      },
    },
    {
      label: 'Stop Service',
      disabled: !activeHost.key,
      onClick: () => {
        onStartStopService('stop');
      },
    },
    {
      label: 'Start Database',
      disabled: getStatusDBType() !== 2,
      onClick: async () => {
        onStartStopDB('start');
      },
    },
    {
      label: 'Stop Database',
      disabled: getStatusDBType() !== 1,
      onClick: async () => {
        onStartStopDB('stop');
      },
    },
    {
      label: 'Start Broker',
      disabled: getStatusBrokerType() !== 2,
      onClick: async () => {
        onStartStopBroker('start');
      },
    },
    {
      label: 'Stop Broker',
      disabled: getStatusBrokerType() !== 1,
      onClick: async () => {
        onStartStopBroker('stop');
      },
    },
    {
      label: 'Parse SQL Log from broker log',
      onClick: () => {
        dispatch(setBrokerLogParser(true));
      },
    },
    {
      label: 'Edit User Management',
      onClick: () => {
        dispatch(setManageCMUser(true));
      },
    },
  ];

  return <DropdownMenu menus={menus} title={'Tool'} />;
};

export default Tool;
