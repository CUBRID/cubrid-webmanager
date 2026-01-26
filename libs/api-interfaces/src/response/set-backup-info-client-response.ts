/**
 * Client response type for setbackupinfo request.
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type SetBackupInfoClientResponse = {
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
    task: 'setbackupinfo';
};
