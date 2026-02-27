import React, { useEffect, useRef, useState } from 'react';
import { Table } from 'antd';
import { useSelector } from 'react-redux';
import styles from '../styles/DatabaseVolumeTable.module.css';
import { getResponse } from '@/api/endPoint.js';
import { getDatabasesAPI, getDBSpaceAPI } from '@/features/domain/database/databaseAPI.js';
import globalSlice from '@/shared/slice/globalSlice.js';
import { nanoid } from 'nanoid';

const columns = [
  {
    title: 'Database',
    dataIndex: 'database',
    key: 'database',
  },
  {
    title: 'Temp U/T/F',
    dataIndex: 'temporary',
    key: 'temporary',
  },
  {
    title: 'Permanent U/T/F',
    dataIndex: 'permanent',
    key: 'permanent',
  },
  {
    title: 'Active log',
    key: 'activeLog',
    dataIndex: 'activeLog',
  },
  {
    title: 'Archive Log',
    key: 'archiveLog',
    dataIndex: 'archiveLog',
  },
];

const getSizeFormat = (size) => {
  if (size >= 1024 ** 3) {
    return `${(size / 1024 ** 3).toFixed(0)}GB`;
  } else if (size >= 1024 ** 2) {
    return `${(size / 1024 ** 2).toFixed(0)}MB`;
  } else if (size >= 1024) {
    return `${(size / 1024).toFixed(0)}KB`;
  } else {
    return `${size}B`;
  }
};

export default function DatabaseVolumeTable(props) {
  const { preference } = useSelector((state) => state.global);
  const { activeTabKey } = useSelector((state) => state.tab);
  const { activeHost } = useSelector((state) => state.host);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dashboardInterval } = preference;
  // ✅ persistent interval storage
  const intervalRef = useRef(null);

  const getVolumeColumn = (dbSpace, type) => {
    let totalPage = 0;
    let freePage = 0;
    let pageSize = parseInt(dbSpace.pagesize);
    for (const space of dbSpace.spaceinfo) {
      if (space.type === type) {
        totalPage += parseInt(space.totalpage);
        freePage += parseInt(space.freepage);
      }
    }
    if (totalPage > 0) {
      return `${getSizeFormat((totalPage - freePage) * pageSize)} / ${getSizeFormat(totalPage * pageSize)} / ${((freePage * 100) / totalPage).toFixed(0)}%`;
    }
    return '-';
  };

  const getLogColumn = (dbSpace, type) => {
    let totalPage = 0;
    let pageSize = parseInt(dbSpace.pagesize);
    for (const space of dbSpace.spaceinfo) {
      if (space.type === type) {
        totalPage += parseInt(space.totalpage);
      }
    }
    if (totalPage > 0) {
      return getSizeFormat(totalPage * pageSize);
    }
    return '-';
  };

  const getSpaceInfo = async () => {
    if (!activeHost?.key) return;

    const resDB = await getDatabasesAPI(activeHost);
    let tempData = [];

    if (resDB.success) {
      const allRequest = resDB.result
        ?.filter((res) => res.status === 'active')
        .map((res) => getDBSpaceAPI(activeHost, res));

      const responses = await Promise.all(allRequest);
      for (const { result } of responses) {
        let permanent = '-';
        let temporary = '-';
        let activeLog = '-';
        let archiveLog = '-';
        for (const spaceInfo of result.spaceinfo) {
          if (spaceInfo.type === 'PERMANENT') {
            permanent = getVolumeColumn(result, spaceInfo.type);
          } else if (spaceInfo.type === 'TEMPORARY') {
            temporary = getVolumeColumn(result, spaceInfo.type);
          } else if (spaceInfo.type === 'Active_log') {
            activeLog = getLogColumn(result, spaceInfo.type);
          } else if (spaceInfo.type === 'Archive_log') {
            archiveLog = getLogColumn(result, spaceInfo.type);
          }
        }

        tempData.push({
          key: nanoid(4),
          database: result.dbname,
          permanent,
          temporary,
          activeLog,
          archiveLog,
        });
      }
    }

    setDataSource(tempData);
    setLoading(false);
  };

  // Run once on mount
  useEffect(() => {
    if (activeHost.key) getSpaceInfo();
  }, []);

  // Re-run interval when activePanel changes
  useEffect(() => {
    // ✅ Clear old interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // ✅ Start new interval if this panel is active
    if (props.uniqueKey === activeTabKey) {
      const value = parseInt(dashboardInterval, 10);
      if (dashboardInterval > 0) {
        intervalRef.current = setInterval(getSpaceInfo, value * 1000);
      }
    }

    // ✅ Cleanup when unmounting
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTabKey, dashboardInterval]);

  return (
    <div className={styles.volume}>
      <Table pagination={false} loading={loading} columns={columns} dataSource={dataSource} />
    </div>
  );
}
