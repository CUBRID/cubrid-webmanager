/**
 * Client response type for deletebackupinfo request.
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type DeleteBackupInfoClientResponse = {
    /**
     * Execution time in milliseconds
     */
    __EXEC_TIME: string;

    /**
     * Note or additional message
     */
    note: string;

    /**
     * Response status ('success' | 'error')
     */
    status: 'success' | 'error';

    /**
     * Task name that was executed
     */
    task: 'deletebackupinfo';
};
