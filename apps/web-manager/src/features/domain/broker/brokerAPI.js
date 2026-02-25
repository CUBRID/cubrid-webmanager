import axios from '@/api/axiosInstant.js';
import { getResponse } from '@/api/endPoint.js';

export const getBrokersAPI = async (host) => {
  const url = `/${host.uid}/broker/list`;
  const { data } = await axios.get(url);
  return { result: data?.[0].broker, success: true };
};

export const getBrokerStatusAPI = async (host, broker) => {
  const url = `/${host.uid}/broker/status/${broker.name}`;
  const { data } = await axios.get(url);
  return { result: data.asinfo, success: true };
};

export const startBrokerAPI = async (host, broker) => {
  const url = `/${host.uid}/broker/start/${broker.name}`;
  const response = await axios.post(url);
  return { result: response.data, success: true };
};

export const stopBrokerAPI = async (host, broker) => {
  const url = `/${host.uid}/broker/stop/${broker.name}`;
  const response = await axios.post(url);
  return { result: response.data, success: true };
};

export const startAllBrokerAPI = async (host) => {
  const payload = {
    task: 'startbroker',
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};
export const stopAllBrokerAPI = async (host) => {
  const payload = {
    task: 'stopbroker',
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};