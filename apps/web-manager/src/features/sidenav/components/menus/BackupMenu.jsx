import { Dropdown } from 'antd';
import { ApiOutlined, PlusOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';

import { useDispatch, useSelector, useStore } from 'react-redux';
import { setBackupModal } from '@/features/sidenav/sideNavSlice.js';
import useBackupAction from '@/features/sidenav/hook/useBackupAction.js';
import { setBuffering } from '@/shared/slice/globalSlice.js';
import { setAutoBackupLog } from '../../sideNavSlice';

const BackupMenu = ({ node, clientX, clientY, open, onClose }) => {
  const { databases } = useSelector((state) => state.database);
  const dispatch = useDispatch();
  const { refreshBackupHook } = useBackupAction();

  const menuItems = [
    {
      label: 'Add Backup Plan',
      key: nanoid(4),
      icon: <PlusOutlined />,
      onClick: () => {
        const updateNode = { ...node, icon: null };
        dispatch(setBackupModal({ open: true, node: updateNode, type: 'add' }));
      },
    },
    {
      label: 'Auto Backup Log',
      key: nanoid(4),
      icon: <PlusOutlined />,
      onClick: () => {
        dispatch(setAutoBackupLog({ open: true, node }));
      }
    },
    {
      label: 'Refresh',
      key: nanoid(4),
      icon: <ApiOutlined />,
      onClick: async () => {
        dispatch(setBuffering(true));
        const database = databases.find((db) => db.key === node.databaseId);
        await refreshBackupHook(database);
        dispatch(setBuffering(false));
      },
    },
  ];

  return (
    <Dropdown
      overlayStyle={{ minWidth: 200 }}
      menu={{ items: menuItems }}
      trigger={['contextMenu']}
      onOpenChange={onClose}
      open={open}
      placement="bottomLeft"
    >
      <div style={{ position: 'absolute', left: clientX, top: clientY, width: 0, height: 0 }} />
    </Dropdown>
  );
};

export default BackupMenu;
