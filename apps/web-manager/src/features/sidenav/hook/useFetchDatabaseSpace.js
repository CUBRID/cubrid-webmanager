import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDBSpaceAPI } from '@/features/domain/database/databaseAPI.js';
import { nanoid } from 'nanoid';
import { addDBSpaceItem } from '@/features/domain/database/databaseSlice.js';
import { buildTree } from '@/lib/utils.js';

const useFetchDatabaseSpace = (node) => {
  const titleSubDB = [
    'Permanent_PermanentData',
    'Permanent_TemporaryData',
    'Temporary_TemporaryData',
    'Log',
  ];
  const { activeHost } = useSelector((state) => state.host);
  const { databases, DBSpaceItem } = useSelector((state) => state.database);
  const dispatch = useDispatch();
  const [subDBSpaceFolder, setSubDBSpaceFolder] = useState([]);
  const [subLogFolder, setSubLogFolder] = useState([]);

  const getFormatSpace = (item) => {
    return {
      title: item.spacename.split('/')?.pop(),
      key: nanoid(4),
      isLeaf: true,
      ...item,
      type: 'space_info',
      typeSpace: item.type,
      icon: 'fa-file',
    };
  };

  useEffect(() => {
    if (node.type === 'database_space') {
      const database = databases.find((item) => item.key === node.parentId);
      const newSubDBSpaceFolder = titleSubDB.map((res) => {
        return {
          databaseId: node.databaseId,
          parentId: node.key,
          title: res,
          key: nanoid(4),
          icon: 'fa-folder folder__icon',
        };
      });
      setSubDBSpaceFolder([subDBSpaceFolder, newSubDBSpaceFolder].flat());
      getDBSpaceAPI(activeHost, { dbname: database.title }).then((res) => {
        if (res.success) {
          const logFolder = [
            {
              databaseId: newSubDBSpaceFolder[3].databaseId,
              title: 'active',
              key: nanoid(4),
              parentId: newSubDBSpaceFolder[3].key,
              icon: 'fa-folder folder__icon',
            },
            {
              databaseId: newSubDBSpaceFolder[3].databaseId,
              title: 'archive',
              key: nanoid(4),
              parentId: newSubDBSpaceFolder[3].key,
              icon: 'fa-folder folder__icon',
            },
          ];
          setSubLogFolder([subLogFolder, logFolder].flat());

          const editionProps = {
            pagesize: res.result.pagesize,
          };
          const itemInfo = [];

          res.result.spaceinfo.forEach((item) => {
            switch (item.type) {
              case 'PERMANENT': {
                itemInfo.push({
                  databaseId: newSubDBSpaceFolder[0].databaseId,
                  ...getFormatSpace(item),
                  ...editionProps,
                  parentId: newSubDBSpaceFolder[0].key,
                });
                break;
              }
              case 'Active_log': {
                itemInfo.push({
                  databaseId: logFolder[0].databaseId,
                  ...getFormatSpace(item),
                  ...editionProps,
                  parentId: logFolder[0].key,
                });
                break;
              }
              case 'Archive_log': {
                itemInfo.push({
                  databaseId: logFolder[1].databaseId,
                  ...getFormatSpace(item),
                  ...editionProps,
                  parentId: logFolder[1].key,
                });
              }
            }
          });
          dispatch(addDBSpaceItem(itemInfo));
        }
      });
    }
  }, [node]);

  return [subDBSpaceFolder, subLogFolder, DBSpaceItem].flat();
};

export default useFetchDatabaseSpace;
