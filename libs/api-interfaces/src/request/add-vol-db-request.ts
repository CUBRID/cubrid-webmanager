/**
 * Client request type for adding a volume to a database.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type AddVolDbRequest = {
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
