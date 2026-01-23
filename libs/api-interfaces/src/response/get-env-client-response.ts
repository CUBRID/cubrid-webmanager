import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { GetEnvCmsResponse } from '@type/cms-response/get-env-cms-response';

/**
 * Client-facing response for environment information.
 * Strips CMS envelope fields from GetEnvCmsResponse.
 */
export type GetEnvClientResponse = Omit<GetEnvCmsResponse, keyof BaseCmsResponse>;

