import { getResponse } from '@/api/endPoint.js';
import axios from '@/api/axiosInstant.js';
export const getLogFilesAPI = async (host, broker) => {
  const payload = {
    task: 'getlogfileinfo',
    broker: broker.name,
  };

  const url = `${host.uid}/log/broker/${broker.name}`;

  const { data } = axios.get(url);
  const response = await getResponse(host, payload);
  return { result: response.logfileinfo?.[0].logfile, success: true };
};

export const getAdminLogFilesAPI = async (host) => {
  const payload = {
    task: 'getadminloginfo',
  };
  const url = `${host.uid}/log/cms`;

  const { data } = axios.get(url);
  const response = await getResponse(host, payload);
  return { result: response.adminloginfo, success: true };
};

export const getLogInfoAPI = async (host, database) => {
  const payload = {
    task: 'getloginfo',
    dbname: database.dbname,
  };
  const url = `${host.uid}/log/database/${database.dbname}`;
  const { data } = axios.get(url);
  const response = await getResponse(host, payload);
  return { result: response.loginfo?.[0].log, success: true };
};

export const getViewLogFilesAPI = async (host, payload) => {
  const url = `${host.uid}/log/view`;
  const { data } = await axios.post(url, payload);
  return { result: data, success: true };
};

export const getLoadAccessLogAPI = async (host) => {
  const payload = {
    task: 'loadaccesslog',
  };

  const response = await getResponse(host, payload);
  return { result: response, success: true };
};


export const getAutoExecQueryErrLog = async (host) => {
  const url = `${host.uid}/database/auto-exec-query-err-log`;
  const { data } = await axios.post(url);
  return { result: data, success: true };
}

export const getAutoBackupDBErrLogAPI = async (host) => {
  const url = `${host.uid}/database/auto-backup-db-err-log`;
  const { data } = await axios.post(url);
  return { result: data, success: true };
};
