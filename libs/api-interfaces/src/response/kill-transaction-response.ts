import { TransactionEntry, TransactionInfoContainer } from './get-transaction-info-response';

/**
 * Client response type for killing a transaction.
 * Returns domain-only data (CMS envelope removed).
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type KillTransactionResponse = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Array of transaction information containers
   */
  transactioninfo: TransactionInfoContainer[];
};
