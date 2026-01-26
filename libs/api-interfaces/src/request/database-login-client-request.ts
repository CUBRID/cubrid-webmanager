import { BaseDatabaseRequest as BaseDatabaseRequest } from "./base-database-request";

/**
 * Request type for database login operations.
 * Used for client-to-server communication.
 * 
 * If profile exists: only dbname is required
 * If profile does not exist: dbname + id + password are required
 * 
 * @category Requests
 * @since 1.0.0
 */
export type DatabaseLoginClientRequest = BaseDatabaseRequest & {
    id?: string;
    password?: string;
};

