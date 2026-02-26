import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Request } from '@nestjs/common';
import {
  AddBackupInfoClientRequest,
  AddBackupInfoClientResponse,
  DeleteBackupInfoClientRequest,
  DeleteBackupInfoClientResponse,
  GetBackupInfoClientRequest,
  GetBackupInfoClientResponse,
  SetBackupInfoClientRequest,
  SetBackupInfoClientResponse,
  GetAutoBackupDbErrLogRequest,
  GetAutoBackupDbErrLogResponse,
} from '@api-interfaces';
import { validateRequiredFields } from '@util';
import { DatabaseBackupService } from './database-backup.service';

/**
 * Controller for handling database backup operations.
 * Handles automated backup schedule management.
 *
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/database/backup-schedule/:dbname
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database')
export class DatabaseBackupController {
  private readonly logger = new Logger(DatabaseBackupController.name);

  constructor(private readonly backupService: DatabaseBackupService) {}

  /**
   * Add automated backup schedule information for a database.
   * Returns empty object on success.
   *
   * @route POST /:hostUid/database/backup-schedule/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing backup schedule information
   * @returns AddBackupInfoClientResponse Empty object on success
   * @example
   * // POST /host-uid/database/backup-schedule/demodb
   * // Body: { "backupid": "test_backup", "path": "/path/to/backup", ... }
   */
  @Post('backup-schedule/:dbname')
  async addBackupSchedule(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: AddBackupInfoClientRequest
  ): Promise<AddBackupInfoClientResponse> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      ['backupid', 'path', 'period_type', 'period_date', 'time', 'level'],
      'database/backup-schedule',
      this.logger
    );

    Logger.log(
      `Adding backup schedule for database: ${dbname} on host: ${hostUid}`,
      'DatabaseBackupController'
    );
    return await this.backupService.addBackupSchedule(userId, hostUid, dbname, body);
  }

  /**
   * Set automated backup schedule information for a database.
   * Returns empty object on success.
   *
   * @route PUT /:hostUid/database/backup-schedule/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing backup schedule information
   * @returns SetBackupInfoClientResponse Empty object on success
   * @example
   * // PUT /host-uid/database/backup-schedule/demodb
   * // Body: { "backupid": "t2", "path": "/path/to/backup", ... }
   */
  @Put('backup-schedule/:dbname')
  async setBackupSchedule(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: SetBackupInfoClientRequest
  ): Promise<SetBackupInfoClientResponse> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      ['backupid', 'path', 'period_type', 'period_date', 'time', 'level'],
      'database/backup-schedule',
      this.logger
    );

    Logger.log(
      `Setting backup schedule for database: ${dbname} on host: ${hostUid}`,
      'DatabaseBackupController'
    );
    return await this.backupService.setBackupSchedule(userId, hostUid, dbname, body);
  }

  /**
   * Delete automated backup schedule information for a database.
   * Returns response with execution details.
   *
   * @route DELETE /:hostUid/database/backup-schedule/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing backup ID to delete
   * @returns DeleteBackupInfoClientResponse Response with execution details
   * @example
   * // DELETE /host-uid/database/backup-schedule/demodb
   * // Body: { "backupid": "t2" }
   */
  @Delete('backup-schedule/:dbname')
  async deleteBackupSchedule(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: DeleteBackupInfoClientRequest
  ): Promise<DeleteBackupInfoClientResponse> {
    const userId = req.user.sub;

    validateRequiredFields(body, ['backupid'], 'database/backup-schedule', this.logger);

    Logger.log(
      `Deleting backup schedule for database: ${dbname} on host: ${hostUid}`,
      'DatabaseBackupController'
    );
    return await this.backupService.deleteBackupSchedule(userId, hostUid, dbname, body);
  }

  /**
   * Get automated backup schedule information for a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route GET /:hostUid/database/backup-schedule/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @returns GetBackupInfoClientResponse Backup schedule information
   * @example
   * // GET /host-uid/database/backup-schedule/demodb
   */
  @Get('backup-schedule/:dbname')
  async getBackupSchedule(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string
  ): Promise<GetBackupInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(
      `Getting backup schedule for database: ${dbname} on host: ${hostUid}`,
      'DatabaseBackupController'
    );
    return await this.backupService.getBackupSchedule(userId, hostUid, dbname);
  }

  /**
   * Get auto-backup database error log.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route POST /:hostUid/database/auto-backup-db-err-log
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param body Request body (empty object)
   * @returns GetAutoBackupDbErrLogResponse Error log entries
   * @example
   * // POST /host-uid/database/auto-backup-db-err-log
   * // Body: {}
   */
  @Post('auto-backup-db-err-log')
  async getAutoBackupDbErrLog(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Body() body: GetAutoBackupDbErrLogRequest
  ): Promise<GetAutoBackupDbErrLogResponse> {
    const userId = req.user.sub;

    Logger.log(
      `Getting auto-backup database error log on host: ${hostUid}`,
      'DatabaseBackupController'
    );
    return await this.backupService.getAutoBackupDbErrLog(userId, hostUid, body);
  }
}
