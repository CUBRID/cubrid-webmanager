import React from 'react';
import DropdownMenu from './DropdownMenu.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenHostVersion } from '@/features/domain/host/hostSlice.js';
import CubridConfig from './contents/CubridConfig.jsx';
import { nanoid } from 'nanoid';
import { addTab, setActiveTabKey } from '@/shared/slice/tabSlice.js';
import { setUserPreference } from '../appBarSlice';

const CONFIG_PARAM_CONTENT = [
  { title: 'Edit Cubrid Config', type: 'cubrid_config' },
  { title: 'Edit Broker Config', type: 'broker_config' },
  { title: 'Cubrid Manager Config', type: 'cm_config' },
];

const Action = () => {
  const dispatch = useDispatch();
  const { activeHost } = useSelector((state) => state.host);
  const menus = [
    {
      label: 'Dashboard Config',
      onClick: () => dispatch(setUserPreference(true)),
    },
    {
      label: 'Properties',
    },
    {
      label: 'Config Params',
      disabled: !activeHost.type,
      children: CONFIG_PARAM_CONTENT.map((param) => {
        return {
          label: param.title,
          onClick: () => {
            dispatch(
              addTab({
                key: nanoid(4),
                ...param,
              })
            );
          },
        };
      }),
    },
  ];

  return <DropdownMenu menus={menus} title={'action'} />;
};

export default Action;
