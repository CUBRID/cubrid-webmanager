/**
 * Client request for viewing log file content.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type ViewLogClientRequest = {
    path: string;
    start: string;
    end: string;
};

