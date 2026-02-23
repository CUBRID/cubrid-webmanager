import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getaddvolstatus task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAddVolStatusCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'getaddvolstatus'
   */
  task: 'getaddvolstatus';

  /**
   * Database name
   */
  dbname: string;
};
