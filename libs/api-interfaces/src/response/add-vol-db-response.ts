/**
 * Client response type for adding a volume to a database.
 * Returns domain-only data (CMS envelope fields removed).
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type AddVolDbResponse = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Volume purpose
   */
  purpose: string;
};
