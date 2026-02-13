import { Dropdown } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { useDispatch } from 'react-redux';
import React from 'react';
import { setBuffering } from '@/shared/slice/globalSlice.js';
import useDatabaseOperation from '@/features/sidenav/hook/useDatabaseOperation.js';
import {
  setCheckDB,
  setCompactDB,
  setDeleteDB,
  setParamDump,
  setPlanDump,
  setRenameDB,
  setBackupDB, setCopyDB, setRestoreDB, setUnloadDB
} from '@/features/sidenav/sideNavSlice.js';
import { setLoadDB } from '../../sideNavSlice';

const DatabaseMenu = ({ node, clientX, clientY, open, onClose }) => {
  const { startDatabase, stopDatabase } = useDatabaseOperation();
  const dispatch = useDispatch();
  const menuItems = [
    {
      label: node.status === 'inactive' ? 'Start Database' : 'Stop Database',
      key: nanoid(4),
      icon: <ReloadOutlined />,
      onClick: async () => {
        dispatch(setBuffering(true));
        if (node.status === 'active') {
          await stopDatabase(node);
        } else {
          await startDatabase(node);
        }
        dispatch(setBuffering(false));
      },
    },
    {
      label: 'Manage Database',
      // disabled: true,
      key: nanoid(4),
      icon: <ReloadOutlined />,
      children: [
        {
          label: 'Database Unload',
          key: nanoid(4),
          onClick: () => {
            dispatch(setUnloadDB({open:true, node}));
          }
          // disabled: true
        },
        {
          label: 'Database Load',
          key: nanoid(4),
          disabled: node.status === 'active',
          onClick: ()=>{
            dispatch(setLoadDB({open: true, node}))
          }
        },
        // {
        //     label: "Database Optimize",
        //     key: nanoid(4),
        //     disabled: node.status === "active",
        //
        //     onClick: () => {
        //         dispatch(setOptimizeDB({open: true, node}));
        //     }
        // },
        {
          label: 'Compact Database',
          key: nanoid(4),
          onClick: () => {
            dispatch(setCompactDB({ open: true, node }));
          },
        },
        {
          label: 'Check Database',
          key: nanoid(4),
          onClick: () => {
            dispatch(setCheckDB({ open: true, node }));
          },
        },
        {
          label: 'Copy Database',
          key: nanoid(4),
          disabled: node.status === 'active',
          onClick: () => {
            dispatch(setCopyDB({ open: true, node }));
          },
        },

        {
          label: 'Create Database',
          key: nanoid(4),
          disabled: true,
        },
        {
          label: 'Rename Database',
          key: nanoid(4),
          disabled: node.status === 'active',
          onClick: () => {
            dispatch(setRenameDB({ open: true, node }));
          },
        },
        {
          label: 'Backup Database',
          key: nanoid(4),
          onClick: () => {
            dispatch(setBackupDB({ open: true, node }));
          },
        },
        {
          label: 'Restore DB',
          key: nanoid(4),
          disabled: node.status === 'active',
          onClick: () => {
            dispatch(setRestoreDB({ open: true, node }));
          },
        },
        {
          label: 'Delete Database',
          key: nanoid(4),
          disabled: node.status === 'active',
          onClick: () => {
            dispatch(setDeleteDB({ open: true, node }));
          },
        },
      ],
    },
    {
      label: 'Database Info',
      key: nanoid(4),
      icon: <ReloadOutlined />,
      disabled: false,
      children: [
        {
          label: 'Lock Information',
          key: nanoid(4),
          disabled: true,
        },
        {
          label: 'Transaction Info',
          key: nanoid(4),
          disabled: true,
        },
        {
          label: 'Plan Dump',
          key: nanoid(4),
          disabled: node.status === 'inactive',
          onClick: () => {
            dispatch(setPlanDump({ open: true, node }));
          },
        },
        {
          label: 'Param Dump',
          key: nanoid(4),
          disabled: node.status === 'inactive',
          onClick: () => {
            dispatch(setParamDump({ open: true, node }));
          },
        },
        {
          label: 'OID Navigator',
          key: nanoid(4),
          disabled: true,
        },
      ],
    },
    {
      label: 'Properties',
      key: nanoid(4),
      icon: <ReloadOutlined />,
      disabled: true,
    },
  ];

  return (
    <>
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
    </>
  );
};

export default DatabaseMenu;
