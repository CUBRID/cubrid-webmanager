import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for addvoldb task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type AddVolDbCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'addvoldb'
   */
  task: 'addvoldb';

  /**
   * Database name
   */
  dbname: string;

  /**
   * Volume name (empty string for auto-generated)
   */
  volname: string;

  /**
   * Volume purpose - 'generic', 'data', 'index', 'temp'
   */
  purpose: string;

  /**
   * Volume path
   */
  path: string;

  /**
   * Number of pages
   */
  numberofpages: string;

  /**
   * Size needed in MB (e.g., "512.000(MB)")
   */
  size_need_mb: string;
};
