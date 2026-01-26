/**
 * Client request type for deleting backup information.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type DeleteBackupInfoClientRequest = {
    /**
     * Database name
     */
    dbname: string;

    /**
     * Backup ID to delete
     */
    backupid: string;
};
