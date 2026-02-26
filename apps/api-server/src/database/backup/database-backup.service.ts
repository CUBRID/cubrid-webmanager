import {
  AddBackupInfoClientRequest,
  AddBackupInfoClientResponse,
  DeleteBackupInfoClientRequest,
  DeleteBackupInfoClientResponse,
  GetBackupInfoClientResponse,
  SetBackupInfoClientRequest,
  SetBackupInfoClientResponse,
  GetAutoBackupDbErrLogRequest,
  GetAutoBackupDbErrLogResponse,
} from '@api-interfaces';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
  checkCmsStatusError,
  checkCmsTokenError,
  HandleDatabaseErrors,
} from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable, Logger } from '@nestjs/common';
import {
  AddBackupInfoCmsRequest,
  DeleteBackupInfoCmsRequest,
  GetBackupInfoCmsRequest,
  SetBackupInfoCmsRequest,
  GetAutoBackupDbErrLogCmsRequest,
} from '@type/cms-request';
import {
  AddBackupInfoCmsResponse,
  DeleteBackupInfoCmsResponse,
  GetBackupInfoCmsResponse,
  SetBackupInfoCmsResponse,
  GetAutoBackupDbErrLogCmsResponse,
} from '@type/cms-response';

/**
 * Service for managing database backup operations.
 * Handles automated backup schedule management.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseBackupService {
  private readonly logger = new Logger(DatabaseBackupService.name);

  constructor(
    private readonly hostService: HostService,
    private readonly cmsClient: CmsHttpsClientService
  ) {}

  /**
   * Add automated backup schedule information for a database.
   * Returns empty object on success (CMS envelope fields removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param backupInfo Backup information
   * @returns AddBackupInfoClientResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async addBackupSchedule(
    userId: string,
    hostUid: string,
    dbname: string,
    backupInfo: AddBackupInfoClientRequest
  ): Promise<AddBackupInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const request: AddBackupInfoCmsRequest = {
      task: 'addbackupinfo',
      token: host.token || '',
      dbname: dbname,
      backupid: backupInfo.backupid,
      path: backupInfo.path,
      period_type: backupInfo.period_type,
      period_date: backupInfo.period_date,
      time: backupInfo.time,
      level: backupInfo.level,
      archivedel: backupInfo.archivedel,
      updatestatus: backupInfo.updatestatus,
      storeold: backupInfo.storeold,
      onoff: backupInfo.onoff,
      zip: backupInfo.zip,
      check: backupInfo.check,
      mt: backupInfo.mt,
      bknum: backupInfo.bknum,
    };

    const response = await this.cmsClient.postAuthenticated<
      AddBackupInfoCmsRequest,
      AddBackupInfoCmsResponse
    >(url, request);

    checkCmsTokenError(response);

    checkCmsStatusError(response);

    return {};
  }

  /**
   * Set automated backup schedule information for a database.
   * Returns empty object on success (CMS envelope fields removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param backupInfo Backup information
   * @returns SetBackupInfoClientResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async setBackupSchedule(
    userId: string,
    hostUid: string,
    dbname: string,
    backupInfo: SetBackupInfoClientRequest
  ): Promise<SetBackupInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const request: SetBackupInfoCmsRequest = {
      task: 'setbackupinfo',
      token: host.token || '',
      dbname: dbname,
      backupid: backupInfo.backupid,
      path: backupInfo.path,
      period_type: backupInfo.period_type,
      period_date: backupInfo.period_date,
      time: backupInfo.time,
      level: backupInfo.level,
      archivedel: backupInfo.archivedel,
      updatestatus: backupInfo.updatestatus,
      storeold: backupInfo.storeold,
      onoff: backupInfo.onoff,
      zip: backupInfo.zip,
      check: backupInfo.check,
      mt: backupInfo.mt,
      bknum: backupInfo.bknum,
    };

    const response = await this.cmsClient.postAuthenticated<
      SetBackupInfoCmsRequest,
      SetBackupInfoCmsResponse
    >(url, request);

    checkCmsTokenError(response);

    checkCmsStatusError(response);

    return {
      __EXEC_TIME: response.__EXEC_TIME,
      note: response.note,
      status: response.status as 'success' | 'error',
      task: 'setbackupinfo',
    };
  }

  /**
   * Delete automated backup schedule information for a database.
   * Returns response with execution details.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param backupInfo Backup information to delete
   * @returns DeleteBackupInfoClientResponse Response with execution details
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async deleteBackupSchedule(
    userId: string,
    hostUid: string,
    dbname: string,
    backupInfo: DeleteBackupInfoClientRequest
  ): Promise<DeleteBackupInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const request: DeleteBackupInfoCmsRequest = {
      task: 'deletebackupinfo',
      token: host.token || '',
      dbname: dbname,
      backupid: backupInfo.backupid,
    };

    const response = await this.cmsClient.postAuthenticated<
      DeleteBackupInfoCmsRequest,
      DeleteBackupInfoCmsResponse
    >(url, request);

    checkCmsTokenError(response);

    checkCmsStatusError(response);

    return {
      __EXEC_TIME: response.__EXEC_TIME,
      note: response.note,
      status: response.status as 'success' | 'error',
      task: 'deletebackupinfo',
    };
  }

  /**
   * Get automated backup schedule information for a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @returns GetBackupInfoClientResponse Backup information
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getBackupSchedule(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<GetBackupInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const request: GetBackupInfoCmsRequest = {
      task: 'getbackupinfo',
      token: host.token || '',
      dbname: dbname,
    };

    const response = await this.cmsClient.postAuthenticated<
      GetBackupInfoCmsRequest,
      GetBackupInfoCmsResponse
    >(url, request);

    checkCmsTokenError(response);

    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, dbname: responseDbname, ...rest } = response;
    const backupArray = rest[dbname] as any[];

    return {
      dbname: responseDbname,
      backups: backupArray || [],
    };
  }

  /**
   * Get auto-backup database error log.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Client request (empty object)
   * @returns GetAutoBackupDbErrLogResponse Error log entries
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getAutoBackupDbErrLog(
    userId: string,
    hostUid: string,
    request: GetAutoBackupDbErrLogRequest
  ): Promise<GetAutoBackupDbErrLogResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const cmsRequest: GetAutoBackupDbErrLogCmsRequest = {
      task: 'getautobackupdberrlog',
      token: host.token || '',
    };

    const response = await this.cmsClient.postAuthenticated<
      GetAutoBackupDbErrLogCmsRequest,
      GetAutoBackupDbErrLogCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

    return dataOnly;
  }
}
