import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for gettransactioninfo task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetTransactionInfoCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'gettransactioninfo'
   */
  task: 'gettransactioninfo';

  /**
   * Database name
   */
  dbname: string;

  /**
   * Database user
   */
  dbuser: string;

  /**
   * Database password (can be empty string)
   */
  dbpasswd: string;
};
