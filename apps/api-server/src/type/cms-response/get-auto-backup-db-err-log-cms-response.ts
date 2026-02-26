import { BaseCmsResponse } from './base-cms-response';

/**
 * Auto-backup database error log entry.
 *
 * @category CMS Responses
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
 * Response type for getautobackupdberrlog task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetAutoBackupDbErrLogCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'getautobackupdberrlog'
   */
  task: 'getautobackupdberrlog';

  /**
   * Array of error log entries (null if no errors)
   */
  error: AutoBackupDbErrorEntry[] | null;
};
