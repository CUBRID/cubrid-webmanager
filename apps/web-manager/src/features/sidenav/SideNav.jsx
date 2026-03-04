import React from 'react';
import { CloseCircleOutlined, ExpandAltOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { Radio } from 'antd';
import styles from './styles/SideNav.module.css';
import SideNavHost from './components/SideNavHost.jsx';
import SideNavTree from './components/SideNavTree.jsx';
import VerticalResize from '@/components/common/VerticalResize/VerticalResize.jsx';
import { useSelector } from 'react-redux';
import IconButton from '../../components/common/Button/IconButton';
import ManageDBUser from '@/features/sidenav/components/modal/ManageDBUser.jsx';
import BackupModal from '@/features/sidenav/components/modal/BackupModal/BackupModal.jsx';
import QueryPlanModal from '@/features/sidenav/components/modal/QueryPlanModal/QueryPlanModal.jsx';
import ParamDump from '@/features/sidenav/components/modal/DatabaseInfo/ParamDump.jsx';
import PlanDump from '@/features/sidenav/components/modal/DatabaseInfo/PlanDump.jsx';
import OptimizeDB from '@/features/sidenav/components/modal/DatabaseInfo/OptimizeDB.jsx';
import ChangeCMPassword from '@/features/sidenav/components/modal/manageCMUser/ChangeCMPassword.jsx';
import CompactDB from '@/features/sidenav/components/modal/DatabaseManagement/CompactDB.jsx';
import CheckDB from '@/features/sidenav/components/modal/DatabaseManagement/CheckDB.jsx';
import RenameDB from '@/features/sidenav/components/modal/DatabaseManagement/RenameDB.jsx';
import DeleteDB from '@/features/sidenav/components/modal/DatabaseManagement/DeleteDB.jsx';
import BackupDB from './components/modal/DatabaseManagement/BackupDB';
import RestoreDB from './components/modal/DatabaseManagement/RestoreDB';
import CopyDB from './components/modal/DatabaseManagement/CopyDB';
import AddVolume from './components/modal/DatabaseSpace/AddVolume';
import SetAutoVolume from './components/modal/DatabaseSpace/SetAutoVolume';
import UnloadDB from './components/modal/UnloadDB/UnloadDB';
import AutoQueryLog from './components/modal/QueryPlanModal/AutoQueryLog';
import AutoBackupLog from './components/modal/BackupModal/AutoBackupLog';
import LockInformation from './components/modal/DatabaseInfo/LockInformation';
import LoadDB from './components/modal/LoadDB/LoadDB';


const SideNav = () => {
  const [width, setWidth] = React.useState(0);
  const { activeHost } = useSelector((state) => state.host);
  return (
    <div style={{ display: 'flex', width: width, height: 'inherit' }}>
      <ManageDBUser />
      <BackupModal />
      <QueryPlanModal />
      <ParamDump />
      <PlanDump />
      <OptimizeDB />
      <ChangeCMPassword />
      <CompactDB />
      <CheckDB />
      <RenameDB />
      <DeleteDB />
      <BackupDB />
      <RestoreDB />
      <CopyDB />
      <AddVolume />
      <SetAutoVolume />
      <UnloadDB/>
      <AutoQueryLog />
      <AutoBackupLog/>
      <LockInformation />
      <LoadDB/>
      <div className={styles.layout}>
        <div className={styles.top__menu}>
          <div className={styles.mode__view}>
            <Radio.Group defaultValue={'host'}>
              <Radio.Button value="host">Host</Radio.Button>
              <Radio.Button value="monitor">Monitor</Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles.left__menu__button}>
            <IconButton>
              <MinusSquareOutlined />
            </IconButton>
            <IconButton>
              <CloseCircleOutlined />
            </IconButton>
            <IconButton>
              <ExpandAltOutlined />
            </IconButton>
          </div>
        </div>
        <div className={styles.navigation__container}>
          <SideNavHost />
          {activeHost.uid ? <SideNavTree /> : null}
        </div>
      </div>
      <VerticalResize onChangeWidth={setWidth} defaultWidth={280} />
    </div>
  );
};
export default SideNav;
