/**
 * Backup information entry (client response).
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type BackupInfoClient = {
    /**
     * Backup ID
     */
    backupid: string;

    /**
     * Database name
     */
    dbname: string;

    /**
     * Backup path
     */
    path: string;

    /**
     * Period type
     */
    period_type: string;

    /**
     * Period date
     */
    period_date: string;

    /**
     * Backup time
     */
    time: string;

    /**
     * Backup level
     */
    level: string;

    /**
     * Archive deletion setting
     */
    archivedel: 'ON' | 'OFF';

    /**
     * Update status setting
     */
    updatestatus: 'ON' | 'OFF';

    /**
     * Store old setting
     */
    storeold: 'ON' | 'OFF';

    /**
     * Backup on/off setting
     */
    onoff: 'ON' | 'OFF';

    /**
     * Zip compression
     */
    zip: 'y' | 'n';

    /**
     * Check setting
     */
    check: 'y' | 'n';

    /**
     * Multi-thread setting
     */
    mt: string;

    /**
     * Backup number
     */
    bknum: string;
};

/**
 * Client response type for getbackupinfo request.
 * 
 * @category Client Responses
 * @since 1.0.0
 */
export type GetBackupInfoClientResponse = {
    /**
     * Database name
     */
    dbname: string;

    /**
     * Backup information array
     */
    backups: BackupInfoClient[];
};

