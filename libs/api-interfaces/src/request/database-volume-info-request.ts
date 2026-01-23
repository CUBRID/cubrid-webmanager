import { BaseDatabaseRequest } from './base-database-request';

/**
 * Request type for getting database volume/space information.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type DatabaseVolumeInfoRequest = BaseDatabaseRequest & { dbname:string };