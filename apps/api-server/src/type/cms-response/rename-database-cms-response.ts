import { BaseCmsResponse } from './base-cms-response';

/**
 * Response type for renamedb task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type RenameDatabaseCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'renamedb'
   */
  task: 'renamedb';
};
