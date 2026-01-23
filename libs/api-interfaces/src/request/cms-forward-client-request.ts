/**
 * Universal client request type for CMS forwarding operations.
 * Contains hostUid and task, but excludes token (server adds token).
 * 
 * @category Requests
 * @since 1.0.0
 */
export type CmsForwardClientRequest = {
    hostUid: string;
    task: string;
};

