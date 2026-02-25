import { useDispatch, useSelector } from 'react-redux';
import { setBrokers } from '@/features/domain/broker/brokerSlice.js';
import { startBrokerAPI, stopBrokerAPI } from '@/features/domain/broker/brokerAPI.js';
import { getBrokerFormat } from '../../../../lib/treeFormat';
import { startAllBrokerAPI, stopAllBrokerAPI } from '../brokerAPI';

const useBrokerOperation = () => {
  const { activeHost } = useSelector((state) => state.host);
  const { brokers } = useSelector((state) => state.broker);
  const dispatch = useDispatch();
  const startBroker = async (broker) => {
    const response = await startBrokerAPI(activeHost, broker);
    if (response.success) {
      const newBrokers = brokers.map((item) => {
        if (item.key === broker.key) {
          return {
            ...item,
            state: 'ON',
            icon: 'fa-folder-gear active__icon',
          };
        }
        return item;
      });
      dispatch(setBrokers(newBrokers));
    }
  };

  const stopBroker = async (broker) => {
    const response = await stopBrokerAPI(activeHost, broker);
    if (response.success) {
      const newBrokers = brokers.map((item) => {
        if (item.key === broker.key) {
          return {
            ...item,
            state: 'OFF',
            icon: 'fa-folder-gear inactive__icon',
          };
        }
        return item;
      });
      dispatch(setBrokers(newBrokers));
    }
  };

  const startAllBroker = async () => {
    const response = await startAllBrokerAPI(activeHost);
    if (response.success) {
      const newBrokers = brokers.map((item) => {
        return {
          ...item,
          state: 'ON',
          icon: 'fa-folder-gear active__icon',
        };
      });
      dispatch(setBrokers(newBrokers));
    }
  };
  const stopAllBroker = async () => {
    const response = await stopAllBrokerAPI(activeHost);
    if (response.success) {
      const newBrokers = brokers.map((item) => {
        return {
          ...item,
          state: 'OFF',
          icon: 'fa-folder-gear inactive__icon',
        };
      });
      dispatch(setBrokers(newBrokers));
    }
  };

  return { startBroker, stopBroker, startAllBroker, stopAllBroker };
};

export default useBrokerOperation;
