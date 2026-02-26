import { BaseCmsResponse } from './base-cms-response';

/**
 * Response type for addvoldb task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type AddVolDbCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'addvoldb'
   */
  task: 'addvoldb';

  /**
   * Database name
   */
  dbname: string;

  /**
   * Volume purpose
   */
  purpose: string;
};
