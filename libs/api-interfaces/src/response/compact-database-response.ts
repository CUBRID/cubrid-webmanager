import type { CmsSuccessClientResponse } from './cms-success-client-response';

/**
 * Client response type for compacting a database (CMS envelope removed).
 * When verbose is 'y', `log` may be present.
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type CompactDatabaseResponse = CmsSuccessClientResponse & {
  /**
   * Log output (only present when verbose is 'y')
   */
  log?: Array<{
    /**
     * Array of log lines
     */
    line: string[];
  }>;
};
