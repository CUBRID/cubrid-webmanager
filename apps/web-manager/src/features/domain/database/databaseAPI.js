import { getResponse } from '@/api/endPoint.js';
import { isNotEmpty } from '@/lib/utils.js';
import axios from '@/api/axiosInstant.js';
import { data } from 'framer-motion/m';

const getListDatabase = (data) => {
  const databases = [];
  // if (isNotEmpty(data.activelist)) {
  //     for (let db of data.activelist.active) {
  //         databases.push({ ...db, status: "active" });
  //     }
  // }
  if (isNotEmpty(data.dblist)) {
    for (const db of data.dblist.dbs) {
      if (!data.activelist.active.some((obj) => obj.dbname === db.dbname)) {
        databases.push({ ...db, status: 'inactive' });
      } else {
        databases.push({ ...db, status: 'active' });
      }
    }
  }
  return databases;
};

export const getDatabasesAPI = async (host) => {
  const url = `/${host.uid}/database/start-info`;
  const { data } = await axios.get(url);
  const databases = getListDatabase(data);
  return { result: databases, success: true };
};

export const loginDatabaseAPI = async (host, data) => {
  const { id, password, dbname } = data;
  const url = `/${host.uid}/database/users/login/${dbname}`;
  const response = await axios.post(url, { id, password });
  return { result: response.data, success: true };
};

export const getDBSpaceAPI = async (host, db) => {
  const url = `/${host.uid}/database/volume-info/${db.dbname}`;
  const { data } = await axios.get(url);
  return { result: data, success: true };
};

export const getDBSSizeAPI = async (host, data) => {
  const payload = {
    task: 'getdbsize',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};

export const startDatabaseAPI = async (host, db) => {
  const url = `/${host.uid}/database/start/${db.dbname}`;
  const { data } = await axios.post(url);
  const databases = getListDatabase(data);
  return { result: databases, success: true };
};
export const stopDatabaseAPI = async (host, db) => {
  const url = `/${host.uid}/database/stop/${db.dbname}`;
  const { data } = await axios.post(url);
  const databases = getListDatabase(data);
  return { result: databases, success: true };
};

export const compactDBAPI = async (host, data) => {
  const payload = {
    task: 'compactdb',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: data.verbose === 'y' ? response.log[0].line : [], success: true };
};

export const checkDBAPI = async (host, data) => {
  const payload = {
    task: 'checkdb',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};

export const renameDBAPI = async (host, data) => {
  const payload = {
    task: 'renamedb',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};

export const deleteDBAPI = async (host, data) => {
  const payload = {
    task: 'deletedb',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};

export const backupDBAPI = async (host, data) => {
  const payload = {
    task: 'backupdb',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};

export const copyDBAPI = async (host, data) => {
  const payload = {
    task: 'copydb',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};

export const addVolumeAPI = async (host, data) => {
  const payload = {
    task: 'addvoldb',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: response.success };
};

export const getAutoVolumeAPI = async (host, data) => {
  const payload = {
    task: 'getautoaddvol',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};

export const setAutoVolumeAPI = async (host, data) => {
  const payload = {
    task: 'setautoaddvol',
    ...data,
  };
  const response = await getResponse(host, payload);
  return { result: response, success: true };
};

export const getTablesAPI = async (host, payload) => {
  const {dbname, ...res} = payload
  const url = `/${host.uid}/database/class-info/${dbname}`
  const {data} = await axios.post(url, res);

  return { result: data, success: true };
};

export const unloadDBAPI = async (host, payload) => {
  const {dbname, ...res} = payload
  const url = `/${host.uid}/database/unload/${dbname}`
  const {data} = await axios.post(url, res);

  return { result: data, success: true };
}

export const getUnloadDBAPI = async (host) => {
  const url = `/${host.uid}/database/unload-info`
  const {data} = await axios.get(url);

  return { result: data, success: true };
}

export const loadDBAPI = async (host, payload) => {
  const {dbname, ...res} = payload
  const url = `/${host.uid}/database/load/${dbname}`
  const {data} = await axios.post(url, res);

  return { result: data, success: true };
}