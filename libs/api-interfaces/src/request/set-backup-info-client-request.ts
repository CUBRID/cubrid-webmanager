/**
 * Client request type for setting backup information.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type SetBackupInfoClientRequest = {
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
     * Can be a single value (e.g., "11") or comma-separated values (e.g., "11,12")
     */
    period_date: string;

    /**
     * Backup time (format: HHMM, e.g., '0930' for 09:30)
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
