/**
 * Client response type for get-createdb-info request.
 * Provides default values and information needed for creating a database.
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type GetCreatedbInfoClientResponse = {
    /**
     * Default database directory path (from CUBRID_DATABASES environment variable)
     */
    defaultDbDirectory: string;

    /**
     * CUBRID version
     */
    cubridVersion?: string;

    /**
     * CUBRID installation path
     */
    cubridPath?: string;
};
