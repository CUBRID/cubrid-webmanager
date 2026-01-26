/**
 * Client request type for adding backup information.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type AddBackupInfoClientRequest = {
    /**
     * Database name
     */
    dbname: string;

    /**
     * Backup ID
     */
    backupid: string;

    /**
     * Backup path
     */
    path: string;

    /**
     * Period type (e.g., 'Monthly', 'Weekly', 'Daily')
     */
    period_type: string;

    /**
     * Period date (day of month for Monthly, day of week for Weekly)
     */
    period_date: string;

    /**
     * Backup time (format: HHMM, e.g., '1230' for 12:30)
     */
    time: string;

    /**
     * Backup level (0, 1, 2)
     */
    level: string;

    /**
     * Archive deletion setting ('ON' | 'OFF')
     */
    archivedel: 'ON' | 'OFF';

    /**
     * Update status setting ('ON' | 'OFF')
     */
    updatestatus: 'ON' | 'OFF';

    /**
     * Store old setting ('ON' | 'OFF')
     */
    storeold: 'ON' | 'OFF';

    /**
     * Backup on/off setting ('ON' | 'OFF')
     */
    onoff: 'ON' | 'OFF';

    /**
     * Zip compression ('y' | 'n')
     */
    zip: 'y' | 'n';

    /**
     * Check setting ('y' | 'n')
     */
    check: 'y' | 'n';

    /**
     * Multi-thread setting ('0' for disabled)
     */
    mt: string;

    /**
     * Backup number ('0' for unlimited)
     */
    bknum: string;
};

