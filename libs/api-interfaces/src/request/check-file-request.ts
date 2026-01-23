/**
 * Request type for checking a file on CMS host.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type CheckFileRequest = {
    /**
     * Optional file paths to check
     */
    file?: string[];
};

