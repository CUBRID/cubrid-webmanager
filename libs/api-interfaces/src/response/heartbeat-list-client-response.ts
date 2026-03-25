export type HaDbModeClientItem = {
  dbname: string;
  server_mode: string;
  server_msg: string;
};

export type HaDbProcInfoClientItem = {
  dbname: string;
  pid: string;
  state: string;
};

export type HaApplyLogClientItem = {
  dbname: string;
  hostname: string;
  logpath: string;
  pid: string;
  state: string;
};

export type HaCopyLogClientItem = {
  dbname: string;
  hostname: string;
  logpath: string;
  mode: string;
  pid: string;
  state: string;
};

export type HaServerClientItem = {
  applylogdb?: Array<{ element: HaApplyLogClientItem[] }>;
  copylogdb?: Array<{ element: HaCopyLogClientItem[] }>;
  dbmode?: HaDbModeClientItem[];
  dbprocinfo?: HaDbProcInfoClientItem[];
};

export type HaNodeClientItem = {
  hostname: string;
  ip: string;
  priority: string;
  state: string;
};

/**
 * Client response for heartbeatlist (domain fields only; CMS envelope stripped).
 */
export type HeartbeatListClientResponse = {
  currentnode?: string;
  currentnodestate?: string;
  hadbinfolist?: Array<{ server: HaServerClientItem[] }> | Record<string, never>;
  hanodelist?: Array<{ node: HaNodeClientItem[] }>;
};

