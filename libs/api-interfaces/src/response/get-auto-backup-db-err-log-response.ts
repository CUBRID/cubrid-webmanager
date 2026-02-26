/**
 * Auto-backup database error log entry.
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type AutoBackupDbErrorEntry = {
  /**
   * Backup ID
   */
  backupid: string;

  /**
   * Database name
   */
  dbname: string;

  /**
   * Error description
   */
  error_desc: string;

  /**
   * Error time
   */
  error_time: string;
};

/**
 * Client response type for getting auto-backup database error log.
 * Returns domain-only data (CMS envelope removed).
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type GetAutoBackupDbErrLogResponse = {
  /**
   * Array of error log entries (null if no errors)
   */
  error: AutoBackupDbErrorEntry[] | null;
};
