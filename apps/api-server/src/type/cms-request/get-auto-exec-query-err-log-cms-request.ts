import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getautoexecqueryerrlog task.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAutoExecQueryErrLogCmsRequest = BaseCmsRequest & {
  /**
   * Task type - must be 'getautoexecqueryerrlog'
   */
  task: 'getautoexecqueryerrlog';
};
