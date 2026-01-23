/**
 * Query plan in response (client).
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type QueryPlanClientResponse = {
    /**
     * Query ID
     */
    query_id: string;

    /**
     * Username for query execution
     */
    username: string;

    /**
     * User password (optional)
     */
    userpass?: string;

    /**
     * Period type
     */
    period: string;

    /**
     * Schedule detail
     */
    detail: string;

    /**
     * SQL query string
     */
    query_string: string;
};

/**
 * Plan list container in response (client).
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type PlanListClientResponse = {
    /**
     * Database name
     */
    dbname: string;

    /**
     * Query plans array
     */
    queryplan: QueryPlanClientResponse[];
};

/**
 * Client response type for getautoexecquery request.
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type GetAutoExecQueryClientResponse = {
    /**
     * Plan list containing query plans
     */
    planlist: PlanListClientResponse[];
};

