/**
 * Request type for database operations.
 * Used for client-to-server communication.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type BaseDatabaseRequest = {
    hostUid: string;
    dbname: string;
};

