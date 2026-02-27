import React, { useEffect } from 'react';
import styles from './styles/AppBar.module.css';
import { Dropdown } from 'antd';
import { LogoutOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { useDispatch, useSelector } from 'react-redux';
import Action from './components/Action.jsx';
import File from './components/File.jsx';
import { setLogout } from '../auth/authSlice.js';
import Help from '@/features/appbar/components/Help.jsx';
import { setProfile } from '@/features/appbar/appBarSlice.js';
import AboutCubrid from '@/features/appbar/components/modal/AboutCubrid.jsx';
import Profile from '@/features/appbar/components/modal/Profile.jsx';
import UpdatePassword from '@/features/appbar/components/modal/UpdatePassword.jsx';
import DeleteConfirmAction from '@/components/common/modal/DeleteConfirmAction/DeleteConfirmAction.jsx';
import { deleteAuthUserAPI } from '@/features/auth/authAPI.js';
import ImportHost from '@/features/appbar/components/modal/ImportHost.jsx';
import ExportHost from '@/features/appbar/components/modal/ExportHost.jsx';
import BrokerLogParser from '@/features/appbar/components/modal/BrokerLogParser.jsx';
import Tool from '@/features/appbar/components/Tool.jsx';
import ManageCMUser from '@/features/appbar/components/modal/ManageCMUser.jsx';
import UserPreference from './components/modal/UserPreference';
import { getUserPreferenceAPI } from './appBarAPI';
import { setPreference } from '../../shared/slice/globalSlice';

const AppBar = () => {
  const dispatch = useDispatch();
  const language = [
    {
      label: <b>EN</b>,
      key: nanoid(4),
      // onClick: ()=>dispatch(setLocale("en")),
    },
    {
      label: <b>KR</b>,
      key: nanoid(4),
      // onClick: ()=>dispatch(setLocale("kr")),
    },
  ];
  // useEffect(() => {
  //     setLocale(lang)
  // },[lang])
  const menuItems = [
    {
      key: 'profile',
      label: (
        <>
          <UserDeleteOutlined /> Profile
        </>
      ),
      onClick: () => {
        dispatch(setProfile(true));
      },
    },
    {
      key: 'logout',
      label: (
        <>
          <LogoutOutlined style={{ color: 'var(--color-error)' }} /> Logout
        </>
      ),
      onClick: () => {
        dispatch(setLogout());
      },
    },
  ];

  useEffect(() => {
    getUserPreferenceAPI().then(response => {

      if(response.success) {
        dispatch(setPreference(response.result));
      }
    })
  },[])

  return (
    <div className={styles.layout}>
      <div className={styles.layout__menu}>
        <File />
        <Tool />
        <Action />
        <Help />

        {/*<HelpMenu/>*/}
        {/*{[t("header.title.file"), t("header.title.tools"), t("header.title.actionbar"), t("header.title.help")].map((item, index) => (*/}
        {/*    <Dropdown key={index} menu={{ items: menus[index] }} trigger={['click']}>*/}
        {/*        <div className={styles.dropdown__menu} onClick={(e) => e.preventDefault()}>*/}
        {/*            {item}*/}
        {/*        </div>*/}
        {/*    </Dropdown>*/}
        {/*))}*/}
      </div>

      <div className={styles.layout__action}>
        <div className={styles.action__language}>
          <Dropdown menu={{ items: language }} trigger={['click']}>
            <div className={styles.dropdown__menu} onClick={(e) => e.preventDefault()}>
              {/*{locale.toUpperCase()}*/}
            </div>
          </Dropdown>
        </div>
        <div className={styles.user__nav__layout}>
          {/*<div className={styles.user__nav__title}>{DBUser.id}</div>*/}
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <div className={styles.dropdown__menu} onClick={(e) => e.preventDefault()}>
              <UserDeleteOutlined />
            </div>
          </Dropdown>
          {/*<UserDeleteOutlined />*/}
        </div>
      </div>

      <AboutCubrid />
      <Profile />
      <UpdatePassword />
      <ImportHost />
      <ExportHost />
      <BrokerLogParser />
      <ManageCMUser />
      <UserPreference/>
    </div>
  );
};

export default AppBar;
