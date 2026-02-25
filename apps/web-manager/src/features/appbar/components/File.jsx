import React, { useState } from 'react';
import DropdownMenu from './DropdownMenu.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setExportHost, setHostConnection, setImportHost } from '@/features/appbar/appBarSlice.js';
import { removeAllTabs, removeTab } from '../../../shared/slice/tabSlice';

const File = () => {
  const { tabs, activeTabKey } = useSelector((state) => state.tab);
  const { activeHost } = useSelector((state) => state.host);
  const dispatch = useDispatch();

  const menus = [
    {
      label: 'Add Host',
      onClick: () => {
        dispatch(setHostConnection({ open: true, type: 'add' }));
      },
    },
    {
      label: 'Change Host Info',
      onClick: () => {
        dispatch(setHostConnection({ open: true, type: 'edit', host: activeHost }));
      },
    },
    {
      label: 'Export Host Info',
      onClick: () => {
        dispatch(setExportHost(true));
      },
    },
    {
      label: 'Import Host Info',
      onClick: () => {
        dispatch(setImportHost(true));
      },
    },
    {
      label: 'Close current window',
      disabled: tabs.length === 0,
      onClick: () => {
        console.log(activeTabKey)
        dispatch(removeTab(activeTabKey));
      },
    },
    {
      label: 'Close all windows',
      disabled: tabs.length === 0,
      onClick: () => {
        dispatch(removeAllTabs());
      },
    },
  ];

  return <DropdownMenu menus={menus} title={'file'} />;
};

export default File;
