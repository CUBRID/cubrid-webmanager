import { BaseCmsResponse } from './base-cms-response';
import { TransactionEntry } from './get-transaction-info-cms-response';

/**
 * Transaction info container for kill transaction response.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type KillTransactionInfoContainer = {
  /**
   * Array of transaction entries
   */
  transaction: TransactionEntry[];
};

/**
 * Response type for killtransaction task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type KillTransactionCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'killtransaction'
   */
  task: 'killtransaction';

  /**
   * Database name
   */
  dbname: string;

  /**
   * Array of transaction information containers
   */
  transactioninfo: KillTransactionInfoContainer[];
};
