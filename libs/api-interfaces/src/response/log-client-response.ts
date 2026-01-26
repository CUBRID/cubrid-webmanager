/**
 * Response types for log operations.
 * 
 * @category Responses
 * @since 1.0.0
 */

/**
 * Broker log list response.
 */
export type BrokerLogListResponse = {
    broker: string;
    logfileinfo: Array<{
        logfile: Array<{
            lastupdate: string;
            owner: string;
            path: string;
            size: string;
            type: string;
        }>;
    }>;
};

/**
 * Database log list response.
 */
export type DatabaseLogListResponse = {
    dbname: string;
    loginfo: Array<{
        log: Array<{
            '@owner'?: string;
            lastupdate: string;
            path: string;
            size: string;
        }>;
    }>;
};

/**
 * CMS log list response.
 */
export type CmsLogListResponse = {
    accesslog: Array<{
        '@user': string;
        taskname: string;
        time: string;
    }>;
    errorlog: Array<{
        '@user': string;
        errornote: string;
        taskname: string;
        time: string;
    }>;
};

/**
 * View log file response.
 */
export type ViewLogResponse = {
    path: string;
    start: string;
    end: string;
    total: string;
    log: Array<{
        line: string[];
    }>;
};

