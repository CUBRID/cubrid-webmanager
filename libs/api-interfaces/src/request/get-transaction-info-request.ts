/**
 * Client request type for getting transaction information of a database.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type GetTransactionInfoRequest = {
  /**
   * Database user
   */
  dbuser: string;

  /**
   * Database password (can be empty string)
   */
  dbpasswd: string;
};
