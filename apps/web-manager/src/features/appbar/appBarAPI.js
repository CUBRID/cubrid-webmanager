import { getResponse } from '@/api/endPoint.js';
import axios from '@/api/axiosInstant.js';

export const getAllSystemParamAPI = async (node, data) => {
  let payload = {
    task: 'getallsysparam',
    ...data,
  };
  const response = await getResponse(node, payload);
  return { result: response.conflist[0].confdata, success: response.success };
};

export const setAllSystemParamAPI = async (node, data) => {
  let payload = {
    task: 'setsysparam',
    ...data,
  };
  const response = await getResponse(node, payload);
  return { success: response.success };
};


export const getUserPreferenceAPI = async () => {
  const url = `user/preferences`;
  const {data} = await axios.get(url);
  return { result: data, success: true };
};

export const updateUserPreferenceAPI = async (payload) => {
  const url = `user/preferences`;
  const {data} = await axios.put(url, payload);
  return {result: data, success: true };
};
