/**
 * Single backup level entry (data, path, size).
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type BackupLevelEntry = {
  /** Date/time string (e.g. "2026.03.12.09.50") */
  data: string;
  /** Full path to backup file */
  path: string;
  /** Size as string (bytes) */
  size: string;
};

/**
 * Client response type for backupdbinfo.
 * level0, level1, level2 may all be empty arrays when no backups exist.
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type BackupDbInfoClientResponse = {
  dbdir: string;
  freespace: string;
  level0: BackupLevelEntry[];
  level1: BackupLevelEntry[];
  level2: BackupLevelEntry[];
};
