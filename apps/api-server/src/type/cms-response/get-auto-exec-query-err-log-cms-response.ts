import { BaseCmsResponse } from './base-cms-response';

/**
 * Auto-execution query error log entry.
 *
 * @category CMS Responses
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
 * Response type for getautoexecqueryerrlog task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetAutoExecQueryErrLogCmsResponse = BaseCmsResponse & {
  /**
   * Task type - must be 'getautoexecqueryerrlog'
   */
  task: 'getautoexecqueryerrlog';

  /**
   * Array of error log entries (null if no errors)
   */
  error: AutoExecQueryErrorEntry[] | null;
};
