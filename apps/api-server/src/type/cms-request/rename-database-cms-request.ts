import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for renamedb task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type RenameDatabaseCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'renamedb'
   */
  task: 'renamedb';

  /**
   * Current database name
   */
  dbname: string;

  /**
   * New database name
   */
  rename: string;

  /**
   * Extended volume path - 'none' or path string
   */
  exvolpath: string;

  /**
   * Advanced option - 'on' or 'off'
   */
  advanced: 'on' | 'off';

  /**
   * Volume mapping (only present when advanced is 'on')
   * Array containing a single object with old path to new path mappings
   */
  volume?: Array<{
    [oldPath: string]: string;
  }>;

  /**
   * Force delete option - 'y' or 'n'
   */
  forcedel: 'y' | 'n';
};
