import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getautobackupdberrlog task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAutoBackupDbErrLogCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'getautobackupdberrlog'
   */
  task: 'getautobackupdberrlog';
};
