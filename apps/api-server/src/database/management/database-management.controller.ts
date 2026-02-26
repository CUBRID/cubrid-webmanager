import { Body, Controller, Get, Logger, Param, Post, Request } from '@nestjs/common';
import {
  AddVolDbRequest,
  AddVolDbResponse,
  CheckDatabaseRequest,
  CheckDatabaseResponse,
  CompactDatabaseRequest,
  CompactDatabaseResponse,
  GetAddVolStatusResponse,
  LoadDatabaseRequest,
  LoadDatabaseResponse,
  LockDatabaseRequest,
  LockDatabaseResponse,
  GetTransactionInfoRequest,
  GetTransactionInfoResponse,
  OptimizeDatabaseRequest,
  OptimizeDatabaseResponse,
  RenameDatabaseRequest,
  RenameDatabaseResponse,
  UnloadDatabaseRequest,
  UnloadInfoClientResponse,
} from '@api-interfaces';
import { ValidationError } from '@error/validation/validation-error';
import { validateRequiredFields } from '@util';
import { DatabaseManagementService } from './database-management.service';

/**
 * Controller for handling database management operations.
 * Handles database unloading, loading, optimization, checking, and related management tasks.
 *
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/database/{action}/:dbname
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database')
export class DatabaseManagementController {
  private readonly logger = new Logger(DatabaseManagementController.name);

  constructor(private readonly managementService: DatabaseManagementService) {}

  /**
   * Unload a database.
   * Returns empty object on success.
   *
   * @route POST /:hostUid/database/unload/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing unload configuration
   * @returns Empty object on success
   * @example
   * // POST /host-uid/database/unload/demodb
   * // Body: { "targetdir": "/path/to/backup", "isSchemaIncluded": true, "isDataIncluded": true, "dbuser": "user", "dbpasswd": "pass" }
   */
  @Post('unload/:dbname')
  async unloadDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: UnloadDatabaseRequest
  ): Promise<{}> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      ['targetdir', 'isSchemaIncluded', 'isDataIncluded', 'dbuser', 'dbpasswd'],
      'database/unload',
      this.logger
    );

    Logger.log(`Unloading database: ${dbname} on host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.unloadDatabase(userId, hostUid, dbname, body);
  }

  /**
   * Get unload information for databases on a host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route GET /:hostUid/database/unload-info
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @returns UnloadInfoClientResponse Unload information without CMS envelope fields
   * @example
   * // GET /host-uid/database/unload-info
   */
  @Get('unload-info')
  async getUnloadInfo(
    @Request() req,
    @Param('hostUid') hostUid: string
  ): Promise<UnloadInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(`Getting unload info for host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.getUnloadInfo(userId, hostUid);
  }

  /**
   * Load a database from schema and object files.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route POST /:hostUid/database/load/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing load configuration
   * @returns LoadDatabaseResponse Load process log lines
   * @example
   * // POST /host-uid/database/load/empty
   * // Body: { "checkoption": "both", "period": "none", "user": "dba", "estimated": "none", "oiduse": "yes", "statisticsuse": "yes", "nolog": "no", "schema": "/path/to/schema", "object": "/path/to/object", "index": "none", "errorcontrolfile": "none", "ignoreclassfile": "none" }
   */
  @Post('load/:dbname')
  async loadDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: LoadDatabaseRequest
  ): Promise<LoadDatabaseResponse> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      [
        'checkoption',
        'period',
        'user',
        'estimated',
        'oiduse',
        'statisticsuse',
        'nolog',
        'schema',
        'object',
        'index',
        'errorcontrolfile',
        'ignoreclassfile',
      ],
      'database/load',
      this.logger
    );

    Logger.log(`Loading database: ${dbname} on host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.loadDatabase(userId, hostUid, dbname, body);
  }

  /**
   * Optimize a database.
   * Returns empty object on success.
   *
   * @route POST /:hostUid/database/optimize/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing optional class information
   * @returns OptimizeDatabaseResponse Empty object on success
   * @example
   * // POST /host-uid/database/optimize/empty
   * // Body: { "class": [{ "classname": "dba.test4" }] } (optional - if not provided, optimizes entire database)
   */
  @Post('optimize/:dbname')
  async optimizeDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: OptimizeDatabaseRequest
  ): Promise<OptimizeDatabaseResponse> {
    const userId = req.user.sub;

    Logger.log(`Optimizing database: ${dbname} on host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.optimizeDatabase(userId, hostUid, dbname, body);
  }

  /**
   * Check a database.
   * Returns empty object on success.
   *
   * @route POST /:hostUid/database/check/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing repair option
   * @returns CheckDatabaseResponse Empty object on success
   * @example
   * // POST /host-uid/database/check/test
   * // Body: { "repairdb": "n" } (n = check only, y = check and repair)
   */
  @Post('check/:dbname')
  async checkDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: CheckDatabaseRequest
  ): Promise<CheckDatabaseResponse> {
    const userId = req.user.sub;

    validateRequiredFields(body, ['repairdb'], 'database/check', this.logger);

    Logger.log(`Checking database: ${dbname} on host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.checkDatabase(userId, hostUid, dbname, body);
  }

  /**
   * Compact a database.
   * Returns log output if verbose is 'y', otherwise returns empty object.
   *
   * @route POST /:hostUid/database/compact/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing verbose option
   * @returns CompactDatabaseResponse Log output if verbose is 'y', otherwise empty object
   * @example
   * // POST /host-uid/database/compact/test
   * // Body: { "verbose": "y" } (y = include log output, n = exclude log output)
   */
  @Post('compact/:dbname')
  async compactDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: CompactDatabaseRequest
  ): Promise<CompactDatabaseResponse> {
    const userId = req.user.sub;

    validateRequiredFields(body, ['verbose'], 'database/compact', this.logger);

    Logger.log(`Compacting database: ${dbname} on host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.compactDatabase(userId, hostUid, dbname, body);
  }

  /**
   * Rename a database.
   * Returns empty object on success.
   *
   * @route POST /:hostUid/database/rename/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Current database name from path parameter
   * @param body Request body containing rename configuration
   * @returns RenameDatabaseResponse Empty object on success
   * @example
   * // POST /host-uid/database/rename/rename_test
   * // Body: { "rename": "renamed_db", "exvolpath": "none", "advanced": "on", "volume": [{ "/old/path": "/new/path" }], "forcedel": "n" }
   */
  @Post('rename/:dbname')
  async renameDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: RenameDatabaseRequest
  ): Promise<RenameDatabaseResponse> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      ['rename', 'exvolpath', 'advanced', 'forcedel'],
      'database/rename',
      this.logger
    );

    // Validate volume when advanced is 'on'
    if (body.advanced === 'on' && (!body.volume || body.volume.length===0) ) {
      throw ValidationError.MissingRequiredField(['volume'], {
        endpoint: 'database/rename',
        reason: 'Volume is required when advanced is "on"',
      });
    }

    Logger.log(`Renaming database: ${dbname} to ${body.rename} on host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.renameDatabase(userId, hostUid, dbname, body);
  }

  /**
   * Get additional volume status for a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route GET /:hostUid/database/add-vol-status/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @returns GetAddVolStatusResponse Volume status information
   * @example
   * // GET /host-uid/database/add-vol-status/test
   */
  @Get('add-vol-status/:dbname')
  async getAddVolStatus(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string
  ): Promise<GetAddVolStatusResponse> {
    const userId = req.user.sub;

    Logger.log(
      `Getting add vol status for database: ${dbname} on host: ${hostUid}`,
      'DatabaseManagementController'
    );
    return await this.managementService.getAddVolStatus(userId, hostUid, dbname);
  }

  /**
   * Add a volume to a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route POST /:hostUid/database/add-vol/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing volume information
   * @returns AddVolDbResponse Volume addition result
   * @example
   * // POST /host-uid/database/add-vol/test
   * // Body: { "volname": "", "purpose": "generic", "path": "/path/to/vol", "numberofpages": "32768", "size_need_mb": "512.000(MB)" }
   */
  @Post('add-vol/:dbname')
  async addVolDb(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: AddVolDbRequest
  ): Promise<AddVolDbResponse> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      ['volname', 'purpose', 'path', 'numberofpages', 'size_need_mb'],
      'database/add-vol',
      this.logger
    );

    Logger.log(
      `Adding volume to database: ${dbname} on host: ${hostUid}`,
      'DatabaseManagementController'
    );
    return await this.managementService.addVolDb(userId, hostUid, dbname, body);
  }

  /**
   * Get lock information for a database.
   * Returns lock information including lock entries, transactions, and lock statistics.
   *
   * @route POST /:hostUid/database/lock/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body (empty object, no fields required)
   * @returns LockDatabaseResponse Lock information
   * @example
   * // POST /host-uid/database/lock/demodb
   * // Body: {}
   */
  @Post('lock/:dbname')
  async lockDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: LockDatabaseRequest
  ): Promise<LockDatabaseResponse> {
    const userId = req.user.sub;

    Logger.log(
      `Getting lock information for database: ${dbname} on host: ${hostUid}`,
      'DatabaseManagementController'
    );
    return await this.managementService.lockDatabase(userId, hostUid, dbname, body);
  }

  /**
   * Get transaction information for a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route POST /:hostUid/database/transaction-info/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing dbuser and dbpasswd
   * @returns GetTransactionInfoResponse Transaction information
   * @example
   * // POST /host-uid/database/transaction-info/demodb
   * // Body: { "dbuser": "dba", "dbpasswd": "" }
   */
  @Post('transaction-info/:dbname')
  async getTransactionInfo(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: GetTransactionInfoRequest
  ): Promise<GetTransactionInfoResponse> {
    const userId = req.user.sub;

    validateRequiredFields(body, ['dbuser', 'dbpasswd'], 'database/transaction-info', this.logger);

    Logger.log(
      `Getting transaction information for database: ${dbname} on host: ${hostUid}`,
      'DatabaseManagementController'
    );
    return await this.managementService.getTransactionInfo(userId, hostUid, dbname, body);
  }
}
