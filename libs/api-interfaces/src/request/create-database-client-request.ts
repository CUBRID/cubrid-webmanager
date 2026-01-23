/**
 * Extended volume information.
 * 
 * @category Client Requests
 * @since 1.0.0
 */


export type ExvolInfo = {
    /**
     * Volume type (e.g., 'data', 'index', 'temp', 'generic')
     */
    type: 'data' | 'index' | 'temp' | 'generic';

    /**
     * Volume size in MB
     */
    size: number;

    /**
     * Page size in bytes
     */
    pagesize: number;

    /**
     * Volume path
     */
    volpath: string;
};

/**
 * Client request type for creating a database.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type CreateDatabaseClientRequest = {
    /**
     * Database name to create
     */
    dbname: string;

    /**
     * Number of pages for the database
     */
    numpage: string;

    /**
     * Page size in bytes
     */
    pagesize: string;

    /**
     * Log size
     */
    logsize: string;

    /**
     * Log page size in bytes
     */
    logpagesize: string;

    /**
     * General volume path
     */
    genvolpath: string;

    /**
     * Log volume path
     */
    logvolpath: string;

    /**
     * Extended volumes array
     * 
     * Format: Array containing objects with volume name as key and ExvolInfo as value
     * 
     * Example:
     * [
     *   {
     *     "dbname_data_x001": {
     *       type: "data",
     *       size: 512,  // MB
     *       pagesize: 16384,  // bytes
     *       volpath: "/path/to/dbname"
     *     },
     *     "dbname_index_x001": {
     *       type: "index",
     *       size: 512,  // MB
     *       pagesize: 16384,  // bytes
     *       volpath: "/path/to/dbname"
     *     }
     *   }
     * ]
     */
    exvol?: Array<Record<string, ExvolInfo>>;

    /**
     * Character set for the database
     * 
     * Example: "ko_KR.utf8", "en_US.utf8"
     */
    charset: string;

    /**
     * Whether to overwrite config file
     * 
     * Values: "YES" | "NO"
     */
    overwrite_config_file: "YES" | "NO";
};

