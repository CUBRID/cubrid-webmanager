import { nanoid } from 'nanoid';
// import {FolderGearIcon} from "../components/common/icons/index.js";

export const getTemplateFormat = (node) => {
  return {
    // serverId: node.serverId,
    parentId: node.key,
    key: nanoid(4),
  };
};
export const getHostFormat = (server) => {
  return {
    ...server,
    key: nanoid(4),
    serverId: nanoid(4),
    title: server.alias,
    type: 'host',
    // icon: <i className="fa-regular fa-server success server__icon"/>
  };
};

export const getDatabaseFormat = (item) => {
  const key = nanoid(4);
  return {
    databaseId: key,
    isLogin: false,
    ...item,
    key: key,
    title: item.dbname,
    type: 'database',
    icon: `fa-database ${item.status === 'inactive' ? 'inactive__icon' : 'active__icon'}`,
    // icon: <i className={`fa-regular fa-database ${item.status === "inactive" ? "warning" : "success"}`}/>
  };
};

export const getBrokerFormat = (item) => {
  const key = nanoid(4);
  return {
    brokerId: key,
    key,
    title: `${item.name} (${item.port})`,
    icon: `fa-folder-gear ${item.state === 'ON' ? 'active__icon' : 'inactive__icon'}`,
    ...item,
    type: 'broker',
  };
};

export const getUserFormat = (item, node) => {
  return {
    ...getTemplateFormat(node),
    title: item['@name'],
    type: 'user',
    icon: 'fa-DBUser success',
    isLeaf: true,
    ...item,
  };
};
