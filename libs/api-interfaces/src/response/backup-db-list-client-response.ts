import { BackupLevelEntry } from './backup-db-info-client-response';

/**
 * Client response type for getbackuplist.
 *
 * CMS returns 'none' strings when there are no backups.
 */
export type BackupDbListClientResponse = {
  level0: BackupLevelEntry[] | 'none' | string;
  level1: BackupLevelEntry[] | 'none' | string;
  level2: BackupLevelEntry[] | 'none' | string;
};
