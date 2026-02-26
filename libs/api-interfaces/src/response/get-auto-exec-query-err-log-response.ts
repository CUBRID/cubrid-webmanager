/**
 * Auto-execution query error log entry.
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type AutoExecQueryErrorEntry = {
  /**
   * Username
   */
  '@username': string;

  /**
   * Database name
   */
  dbname: string;

  /**
   * Error code
   */
  error_code: string;

  /**
   * Error description
   */
  error_desc: string;

  /**
   * Error time
   */
  error_time: string;

  /**
   * Query ID
   */
  query_id: string;
};

/**
 * Client response type for getting auto-execution query error log.
 * Returns domain-only data (CMS envelope removed).
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type GetAutoExecQueryErrLogResponse = {
  /**
   * Array of error log entries (null if no errors)
   */
  error: AutoExecQueryErrorEntry[] | null;
};
