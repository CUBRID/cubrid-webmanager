import { BaseCmsResponse } from './base-cms-response';

/**
 * Lock holder information.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type LockHolder = {
  /**
   * Count
   */
  count: string;

  /**
   * Granted mode (e.g., "IS_LOCK", "IX_LOCK")
   */
  granted_mode: string;

  /**
   * Number of sub-granules
   */
  nsubgranules: string;

  /**
   * Transaction index
   */
  tran_index: string;
};

/**
 * Lock entry information.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type LockEntry = {
  /**
   * Lock holders (optional, only present when lock is held)
   */
  lock_holders?: LockHolder[];

  /**
   * Number of B holders (may be "missing" or numeric string)
   */
  num_b_holders: string;

  /**
   * Number of holders (may be "inser" or numeric string)
   */
  num_holders: string;

  /**
   * Number of waiters (may be "=" or numeric string)
   */
  num_waiters: string;

  /**
   * Object type
   */
  ob_type: string;

  /**
   * Object ID
   */
  oid: string;
};

/**
 * Lock object table information.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type LockObjectTable = {
  /**
   * Array of lock entries
   */
  entry: LockEntry[];

  /**
   * Maximum number of locks
   */
  maxnumlock: string;

  /**
   * Number of allocated locks (optional, may not be present)
   */
  numallocated?: string;

  /**
   * Number of locked objects
   */
  numlocked: string;

  /**
   * Size of lock (optional, may not be present)
   */
  sizelock?: string;
};

/**
 * Transaction information.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type TransactionInfo = {
  /**
   * User ID
   */
  '@uid': string;

  /**
   * Host name
   */
  host: string;

  /**
   * Transaction index
   */
  index: string;

  /**
   * Isolation level
   */
  isolevel: string;

  /**
   * Process ID
   */
  pid: string;

  /**
   * Process name
   */
  pname: string;

  /**
   * Timeout
   */
  timeout: string;
};

/**
 * Lock information.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type LockInfo = {
  /**
   * Deadlock interval
   */
  dinterval: string;

  /**
   * ESC (Escalation) value
   */
  esc: string;

  /**
   * Lock object table
   */
  lot: LockObjectTable[];

  /**
   * Transaction information
   */
  transaction: TransactionInfo[];
};

/**
 * Response type for lockdb task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type LockDatabaseCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'lockdb'
   */
  task: 'lockdb';

  /**
   * Array of lock information
   */
  lockinfo: LockInfo[];
};
