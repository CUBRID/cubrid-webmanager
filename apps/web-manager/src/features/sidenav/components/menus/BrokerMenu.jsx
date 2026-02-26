import { Dropdown } from 'antd';
import { EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { useDispatch, useSelector } from 'react-redux';
import { setBuffering } from '@/shared/slice/globalSlice.js';
import { addTab } from '@/shared/slice/tabSlice.js';
import useBrokerOperation from '../../../domain/broker/hook/useBrokerOperation';

export default function ({ node, clientX, clientY, open, onClose }) {
  const dispatch = useDispatch();
  const { startBroker, stopBroker } = useBrokerOperation();
  const started = node.state === 'ON';
  const menuItems = [
    {
      label: started ? 'Stop Broker' : 'Start Broker',
      key: nanoid(4),
      icon: <PlusOutlined />,
      onClick: async () => {
        dispatch(setBuffering(true));
        if (started) {
          await stopBroker(node);
        } else {
          await startBroker(node);
        }
        dispatch(setBuffering(false));
      },
    },
    {
      label: 'status',
      key: nanoid(4),
      icon: <ReloadOutlined />,
      onClick: () => {
        dispatch(addTab(node));
      },
    },
    {
      label: 'properties',
      key: nanoid(4),
      icon: <ReloadOutlined />,
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
}
