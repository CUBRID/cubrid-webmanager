import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDatabasesAPI } from '@/features/domain/database/databaseAPI.js';
import { nanoid } from 'nanoid';
import { Checkbox, Table } from 'antd';
import {
  deletePrefAutoStartupDatabase,
  getPrefAutoStartupDatabase,
  setPrefAutoStartupDatabase,
} from '@/preference/pref.js';
import styles from '../styles/DatabaseTable.module.css';
import { getSystemParamAPI } from '../../domain/CMSConfig/CMSConfigAPI';
import { extractParam } from '../../../lib/utils';
import databaseMenu from '../../sidenav/components/menus/DatabaseMenu';
import { removeAutoStartAPI, setAutoStartAPI } from '../../domain/database/databaseAPI';
import { setBuffering } from '../../../shared/slice/globalSlice';

export const DatabaseTable = (props) => {
  const { preference } = useSelector((state) => state.global);
  const { activeTabKey } = useSelector((state) => state.tab);
  const { activeHost } = useSelector((state) => state.host);
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dashboardInterval } = preference;
  // ✅ useRef to store the interval ID safely
  const intervalRef = useRef(null);

  const columns = [
    {
      title: 'Database',
      dataIndex: 'database',
      key: 'database',
    },
    {
      title: 'Auto Startup',
      dataIndex: 'auto',
      key: 'auto',
      render: (value, record) => (
        <Checkbox
          value={value}
          onClick={({ target }) => {
            updateAutoStartupDatabase(target.checked, record);
          }}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const getRefreshData = async () => {
    if (!activeHost?.uid) return;

    const response = await getDatabasesAPI(activeHost);
    const autoStart = await getAutoStartupDatabase()
    if (response.success) {
      const newData = response.result?.map((res) => {
        const auto = autoStart && autoStart.includes(res.dbname);
        return {
          serverId: activeHost.uid,
          key: nanoid(4),
          database: res.dbname,
          auto,
          status: res.status === 'active' ? 'running' : 'stopped',
        };
      });
      setData(newData);
      getPrefAutoStartupDatabase(newData);
    }
    setLoading(false);
  };

  // Run once initially
  useEffect(() => {
    if (activeHost.key) {
      getRefreshData();
    }
  }, []);

  // Handle interval updates when panel changes
  useEffect(() => {
    // ✅ clear old interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // ✅ start a new one if this panel is active
    if (props.uniqueKey === activeTabKey) {
      const value = parseInt(dashboardInterval, 10);
      if (dashboardInterval > 0) {
        intervalRef.current = setInterval(getRefreshData, value * 1000);
      }
    }

    // ✅ cleanup when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTabKey, dashboardInterval]);

  const getAutoStartupDatabase = async () => {
    const response = await getSystemParamAPI(activeHost, 'cubrid.conf');

    // 1. Guard Clause: If we can't get the config, we shouldn't guess what to start
    if (!response?.success) {
      // Your API layer likely shows the error, so we just exit
      return;
    }

    const param = extractParam(response.result);
    // Use optional chaining and default to empty string to prevent crashes
    const serverConfig = param?.[0]?.['service']['server'] || '';
    if(serverConfig) {
      return serverConfig;
    }
    return null

  }

  const updateAutoStartupDatabase = async (status, record) => {

    dispatch(setBuffering(true))
    try{
      if (status) {
        const response = await setAutoStartAPI(activeHost, record.database);
        if (response.success) {
          getRefreshData();
        }
      } else {
        const response = await removeAutoStartAPI(activeHost, record.database);
        if (response.success) {
          getRefreshData();
        }
      }
    }finally {
      dispatch(setBuffering(false));
    }



  }

  return (
    <div className={styles.database}>
      <Table pagination={false} loading={loading} columns={columns} dataSource={data} />
    </div>
  );
};

export default DatabaseTable;
