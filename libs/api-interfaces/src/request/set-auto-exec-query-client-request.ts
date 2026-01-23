/**
 * Query plan for auto-execution (client request).
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type QueryPlanClient = {
    /**
     * Query ID
     */
    query_id: string;

    /**
     * Username for query execution
     */
    username: string;

    /**
     * User password (optional, can be empty)
     */
    userpass?: string;

    /**
     * Period type (e.g., 'MONTH', 'WEEK', 'DAY')
     */
    period: string;

    /**
     * Schedule detail (e.g., '1,20 12:30' for day 1 and 20 at 12:30)
     */
    detail: string;

    /**
     * SQL query string
     */
    query_string: string;
};

/**
 * Plan list container (client request).
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type PlanListClient = {
    /**
     * Query plans array
     */
    queryplan: QueryPlanClient[];
};

/**
 * Client request type for setting auto-execution query.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type SetAutoExecQueryClientRequest = {
    /**
     * Database name
     */
    dbname: string;

    /**
     * Plan list containing query plans
     */
    planlist: PlanListClient[];
};

