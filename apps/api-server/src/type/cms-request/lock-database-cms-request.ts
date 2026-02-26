import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for lockdb task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type LockDatabaseCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'lockdb'
   */
  task: 'lockdb';

  /**
   * Database name to get lock information
   */
  dbname: string;
};
