import { BaseCmsResponse } from './base-cms-response';

/**
 * Response type for deletedb task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type DeleteDatabaseCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'deletedb'
   */
  task: 'deletedb';
};
