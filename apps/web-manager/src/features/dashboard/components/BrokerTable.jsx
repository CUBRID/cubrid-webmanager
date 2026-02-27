import React, { useEffect, useRef, useState } from 'react';
import { Table } from 'antd';
import { useSelector } from 'react-redux';
import { nanoid } from 'nanoid';
import { getBrokersAPI, getBrokerStatusAPI } from '@/features/domain/broker/brokerAPI.js';
import { getBrokerFormat } from '@/lib/treeFormat.js';
import styles from '../styles/BrokerTable.module.css';
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Status',
    dataIndex: 'state',
    key: 'status',
  },
  {
    title: 'PID',
    dataIndex: 'pid',
    key: 'pid',
  },
  {
    title: 'PORT',
    key: 'port',
    dataIndex: 'port',
  },
  {
    title: 'AS',
    key: 'as',
    dataIndex: 'as',
  },
  {
    title: 'JQ',
    key: 'jq',
    dataIndex: 'jq',
  },
  {
    title: 'REQ',
    dataIndex: 'req',
    key: 'req',
  },
  {
    title: 'TPS',
    key: 'tps',
    dataIndex: 'tps',
  },
  {
    title: 'QPS',
    key: 'qps',
    dataIndex: 'qps',
  },
  {
    title: 'LONG-T',
    key: 'long_t',
    dataIndex: 'long_tran_time',
  },
  {
    title: 'LONG-Q',
    dataIndex: 'long_query_time',
    key: 'long_q',
  },
  {
    title: 'EER-Q',
    key: 'err_q',
    dataIndex: 'error_query',
  },
];

const BrokerTable = (props) => {
  const { preference } = useSelector((state) => state.global);
  const { activeTabKey } = useSelector((state) => state.tab);
  const { activeHost } = useSelector((state) => state.host);
  const [brokerData, setBrokerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { brokerStatusInterval } = preference;
  // ✅ store interval per component
  const intervalRef = useRef(null);

  const getRefreshData = async () => {
    try {
      const res = await getBrokersAPI(activeHost);
      const newBrokers = res.result?.map((item) => getBrokerFormat(item)) || [];
      const responses = await Promise.all(newBrokers.map((b) => getBrokerStatusAPI(activeHost, b)));

      const dataSource = responses
        .map((r, i) => {
          if (!r.success) return null;
          if (!r.result) {
            return newBrokers[i];
          }
          const result = r.result[0];
          return {
            ...newBrokers[i],
            key: nanoid(4),
            qps: result.as_num_query,
            tps: result.as_num_tran,
          };
        })
        .filter(Boolean);

      setBrokerData(dataSource);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getRefreshData(); // first load
  }, []);

  useEffect(() => {
    // clear previous interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // start new interval only if this panel is active
    if (props.uniqueKey === activeTabKey) {
      const value = parseInt(brokerStatusInterval, 10);
      if (brokerStatusInterval > 0) {
        intervalRef.current = setInterval(getRefreshData, value * 1000);
      }
    }

    // ✅ cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTabKey, brokerStatusInterval]);

  return (
    <div className={styles.broker}>
      <Table
        pagination={false}
        bordered
        loading={loading}
        columns={columns}
        dataSource={brokerData}
      />
    </div>
  );
};

export default BrokerTable;
