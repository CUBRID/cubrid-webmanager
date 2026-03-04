import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for deletedb task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type DeleteDatabaseCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'deletedb'
   */
  task: 'deletedb';

  /**
   * Database name to delete
   */
  dbname: string;

  /**
   * Delete backup option - 'y' to delete backup, 'n' to keep backup
   */
  delbackup: 'y' | 'n';
};
