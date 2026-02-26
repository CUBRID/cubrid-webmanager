import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { useSelector } from 'react-redux';
import { getLogFilesAPI } from '@/features/domain/log/logAPI.js';

const useFetchBroker = (node) => {
  const { activeHost } = useSelector((state) => state.host);
  const [SQLLog, setSQLLog] = useState([]);
  const [brokerLogFiles, setBrokerLogFiles] = useState([]);
  useEffect(() => {
    if (node.type === 'broker') {
      const tempSqlFolder = [
        {
          brokerId: node.brokerId,
          parentId: node.key,
          key: nanoid(4),
          title: 'SQL Log',
          icon: 'fa-folder folder__icon',
        },
      ];
      setSQLLog([SQLLog, tempSqlFolder].flat());
      getLogFilesAPI(activeHost, node).then((res) => {
        const temp = res.result
          .filter((item) => item.type === 'script')
          .map((item) => ({
            ...item,
            brokerId: node.brokerId,
            parentId: tempSqlFolder[0].key,
            key: nanoid(4),
            title: item.path.split('/').pop(),
            icon: 'fa-file',
            type: 'broker_sql_log',
            isLeaf: true,
          }));
        setBrokerLogFiles([brokerLogFiles, temp].flat());
      });
    }
  }, [node]);

  return { SQLLog, brokerLogFiles };
};

export default useFetchBroker;
