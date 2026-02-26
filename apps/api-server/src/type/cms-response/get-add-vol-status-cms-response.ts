import { BaseCmsResponse } from './base-cms-response';

/**
 * Response type for getaddvolstatus task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetAddVolStatusCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'getaddvolstatus'
   */
  task: 'getaddvolstatus';

  /**
   * Free space available
   */
  freespace: string;

  /**
   * Volume path
   */
  volpath: string;
};
