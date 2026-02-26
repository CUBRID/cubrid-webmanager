import { BaseCmsResponse } from './base-cms-response';

/**
 * Transaction information entry.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type TransactionEntry = {
  /**
   * User name
   */
  '@user': string;

  /**
   * SQL ID
   */
  SQL_ID: string;

  /**
   * Host name
   */
  host: string;

  /**
   * Process ID
   */
  pid: string;

  /**
   * Program name
   */
  program: string;

  /**
   * Query time
   */
  query_time: string;

  /**
   * Transaction time
   */
  tran_time: string;

  /**
   * Transaction index (may include status like "ACTIVE")
   */
  tranindex: string;

  /**
   * Wait for lock holder
   */
  wait_for_lock_holder: string;
};

/**
 * Transaction info container.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type TransactionInfoContainer = {
  /**
   * Array of transaction entries
   */
  transaction: TransactionEntry[];
};

/**
 * Response type for gettransactioninfo task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetTransactionInfoCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'gettransactioninfo'
   */
  task: 'gettransactioninfo';

  /**
   * Database name
   */
  dbname: string;

  /**
   * Array of transaction information containers
   */
  transactioninfo: TransactionInfoContainer[];
};
