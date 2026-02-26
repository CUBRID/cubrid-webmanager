import { Tree } from 'antd';
import styles from '../styles/SideNavTree.module.css';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDatabasesAPI } from '../../domain/database/databaseAPI.js';
import { getBrokerFormat, getDatabaseFormat } from '@/lib/treeFormat.js';
import { setDatabases } from '../../domain/database/databaseSlice.js';
import { getBrokersAPI } from '../../domain/broker/brokerAPI.js';
import { setBrokers } from '../../domain/broker/brokerSlice.js';
import useFetchUsers from '@/features/sidenav/hook/useFetchUsers.js';
import { nanoid } from 'nanoid';
import useFetchDatabaseSpace from '@/features/sidenav/hook/useFetchDatabaseSpace.js';
import { buildTree } from '@/lib/utils.js';
import { setBuffering, setDeleteConfirm } from '@/shared/slice/globalSlice.js';
import { addTab } from '@/shared/slice/tabSlice.js';
import useFetchJobAutomation from '@/features/sidenav/hook/useFetchJobAutomation.js';
import BackupMenu from '@/features/sidenav/components/menus/BackupMenu.jsx';
import QueryMenu from '@/features/sidenav/components/menus/QueryMenu.jsx';
import BackupModal from '@/features/sidenav/components/modal/BackupModal/BackupModal.jsx';
import BackupItemMenu from '@/features/sidenav/components/menus/BackupItemMenu.jsx';
import DeleteConfirmAction from '@/components/common/modal/DeleteConfirmAction/DeleteConfirmAction.jsx';
import { deleteBackupInfoAPI } from '@/features/sidenav/sideNavAPI.js';
import useBackupAction from '@/features/sidenav/hook/useBackupAction.js';
import QueryPlanModal from '@/features/sidenav/components/modal/QueryPlanModal/QueryPlanModal.jsx';
import DatabaseMenu from '@/features/sidenav/components/menus/DatabaseMenu.jsx';
import BrokerMenu from '@/features/sidenav/components/menus/BrokerMenu.jsx';
import useFetchBroker from '@/features/sidenav/hook/useFetchBroker.js';
import useFetchLog from '@/features/sidenav/hook/useFetchLog.js';
import UsersMenu from '@/features/sidenav/components/menus/UsersMenu.jsx';
import ManageDBUser from '@/features/sidenav/components/modal/ManageDBUser.jsx';
import UserMenu from '@/features/sidenav/components/menus/UserMenu.jsx';
import DatabaseSpaceMenu from './menus/DatabaseSpaceMenu';
import { setSelectedObject } from '../../../shared/slice/globalSlice';

const menus = [
  { type: 'backup', Screen: BackupMenu },
  { type: 'backup_item', Screen: BackupItemMenu },
  { type: 'query', Screen: QueryMenu },
  { type: 'database', Screen: DatabaseMenu },
  { type: 'broker', Screen: BrokerMenu },
  { type: 'users', Screen: UsersMenu },
  { type: 'user', Screen: UserMenu },
  { type: 'database_space', Screen: DatabaseSpaceMenu },
];

const SideNavTree = () => {
  const [activeTree, setActiveTree] = useState(0);
  const { hostHeight } = useSelector((state) => state.sidenav);
  const { databases } = useSelector((state) => state.database);
  const { brokers } = useSelector((state) => state.broker);
  const { activeHost } = useSelector((state) => state.host);
  const { users } = useSelector((state) => state.DBUser);
  const [subDatabase, setSubDatabase] = useState([]);
  const [subLogger, setSubLogger] = useState([]);
  const [menu, setMenu] = useState({ open: false });
  const [hook, setHook] = useState({});
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState({ open: false });
  useFetchUsers(hook);
  const DBSpaceInfo = useFetchDatabaseSpace(hook);
  const jobAutomation = useFetchJobAutomation(hook);
  const { refreshBackupInfo } = useBackupAction();
  const { SQLLog, brokerLogFiles } = useFetchBroker(hook);
  const {
    logBrokerFolder,
    accessLogs,
    errorLogs,
    adminLogs,
    logManager,
    logServerFolder,
    logInfo,
  } = useFetchLog(hook);

  const treeItems = ['DB', 'Broker', 'Log'];
  const dispatch = useDispatch();

  const convertIcon = (treeData) =>
    treeData.map((node) => ({
      ...node,
      icon: node.iconClass ? <i className={node.iconClass} /> : null,
      children: node.children ? convertIcon(node.children) : [],
    }));

  const getTreeData = () => {
    if (activeTree === 0) {
      // console.log(buildTree(databases, subDatabase, users))
      return buildTree(databases, subDatabase, users, DBSpaceInfo, jobAutomation);
    } else if (activeTree === 1) {
      return buildTree(brokers, SQLLog, brokerLogFiles);
    } else if (activeTree === 2) {
      return buildTree(
        subLogger,
        logBrokerFolder,
        accessLogs,
        errorLogs,
        adminLogs,
        logManager,
        logServerFolder,
        logInfo
      );
    }
  };

  useEffect(() => {
    if (activeHost.uid) {
      dispatch(setBuffering(true));
      getDatabasesAPI(activeHost).then((res) => {
        dispatch(setBuffering(false));
        if (res.success) {
          const newSubDB = [];
          const newDB = [];
          res.result.forEach((db) => {
            const dbFormat = getDatabaseFormat(db);
            newDB.push(dbFormat);
            newSubDB.push([
              {
                key: nanoid(4),
                parentId: dbFormat.key,
                databaseId: dbFormat.databaseId,
                title: 'Users',
                icon: 'fa-users',
                type: 'users',
                isLeaf: false,
              },
              {
                key: nanoid(4),
                parentId: dbFormat.key,
                databaseId: dbFormat.databaseId,
                title: 'Job Automation',
                icon: 'fa-folder folder__icon',
                type: 'job_automation',
              },
              {
                key: nanoid(4),
                parentId: dbFormat.key,
                databaseId: dbFormat.databaseId,
                title: 'Database Space',
                icon: 'fa-folder folder__icon',
                type: 'database_space',
              },
            ]);
          });
          dispatch(setDatabases(newDB));
          setSubDatabase(newSubDB.flat());
        }
      });
      getBrokersAPI(activeHost).then((res) => {
        if (res.success) {
          dispatch(setBrokers(res.result.map((broker) => getBrokerFormat(broker))));
        }
      });

      const subLog = [
        {
          // ...getTemplateFormat(activeServer),
          key: nanoid(4),
          title: 'Broker',
          type: 'log_broker',
          icon: 'fa-folder-gear',
        },
        {
          key: nanoid(4),
          title: 'Manager',
          type: 'log_manager',
          icon: 'fa-computer',
        },
        {
          key: nanoid(4),
          title: 'Server',
          type: 'log_server',
          icon: 'fa-server',
        },
      ];
      setSubLogger(subLog);
    }
  }, [activeHost]);

  const onDoubleClick = (node) => {
    dispatch(addTab(node));
  };

  const handleTreeRightClick = (e) => {
    const { node, event } = e;
    menus.forEach((item) => {
      if (item.type === node.type) {
        setMenu({ ...event, e, node, Screen: item.Screen, open: true });
      }
    });
  };

  const onDeleteModal = async ({ node }) => {
    const database = databases.find((db) => db.key === node.databaseId);
    switch (node.type) {
      case 'backup_item': {
        const response = await deleteBackupInfoAPI(activeHost, {
          dbname: database.dbname,
          backupid: node.backupid,
        });
        if (response.success) {
          await refreshBackupInfo(database);
          onCloseModal();
        }
      }
    }
  };

  const onSelected = (key, {node}) => {
    if(key.length > 0) {
      dispatch(setSelectedObject({type: activeTree, node}));
    }else{
      dispatch(setSelectedObject(null));
    }
  }

  const onCloseModal = () => {
    setOpenDeleteConfirm({ open: false });
  };
  const renderManu = () => {
    const { Screen, open, ...e } = menu;
    if (Screen) {
      return (
        <Screen
          {...e}
          open={open}
          onDeleteModal={(data) => setOpenDeleteConfirm({ open: true, ...data })}
          onCloseModal={onCloseModal}
          onClose={() => setMenu({ ...menu, open: false })}
        />
      );
    }
    return null;
  };

  return (
    <div className={styles.layout}>
      <DeleteConfirmAction {...openDeleteConfirm} onClose={onCloseModal} onOK={onDeleteModal} />
      <div className={styles.alias}>{activeHost.alias}</div>
      <div className={styles.item__layout}>
        {treeItems.map((res, index) => {
          return (
            <div
              onClick={() => setActiveTree(index)}
              key={index}
              className={`${styles.item} ${activeTree === index ? styles.item__active : ''}`}
            >
              {treeItems[index]}
            </div>
          );
        })}
      </div>
      {renderManu()}
      <div
        className={styles.tree__layout}
        style={{ height: `calc(100vh - ${260 + hostHeight}px)` }}
      >
        <Tree
          onSelect={onSelected}
          showLine
          showIcon
          onRightClick={handleTreeRightClick}
          loadData={async (node) => await setHook(node)}
          switcherIcon={({ expanded }) => {
            return <i className={`fa-regular fa-square-${expanded ? 'minus' : 'plus'}`} />;
          }}
          titleRender={(node) => (
            <span onDoubleClick={() => onDoubleClick(node)}>{node.title}</span>
          )}
          treeData={convertIcon(getTreeData())}
        />
      </div>
    </div>
  );
};

export default SideNavTree;
