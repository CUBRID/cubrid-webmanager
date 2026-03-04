import { Body, Controller, Get, Logger, Param, Post, Request } from '@nestjs/common';
import {
  CreateDatabaseClientRequest,
  CreateDatabaseClientResponse,
  CreateDatabaseWithConfigRequest,
  CreateDatabaseWithConfigResponse,
  DatabaseVolumeInfoClientResponse,
  GetCreatedbInfoClientResponse,
  StartInfoClientResponse,
  SaveDatabaseProfileRequest,
} from '@api-interfaces';
import { validateRequiredFields } from '@util';
import { DatabaseLifecycleService } from './database-lifecycle.service';

/**
 * Controller for handling database lifecycle operations.
 * Handles database start, stop, restart, creation, profile management, and space information.
 *
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/database/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database')
export class DatabaseLifecycleController {
  private readonly logger = new Logger(DatabaseLifecycleController.name);

  constructor(private readonly lifecycleService: DatabaseLifecycleService) {}

  /**
   * Get start information for databases on a host.
   * Returns only domain data (BaseCmsResponse fields stripped out).
   *
   * @route GET /:hostUid/database/start-info
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @returns StartInfoClientResponse Start info without CMS envelope fields
   * @example
   * // GET /host-uid/database/start-info
   */
  @Get('start-info')
  async getStartInfo(
    @Request() req,
    @Param('hostUid') hostUid: string
  ): Promise<StartInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(`Getting start info for host: ${hostUid}`, 'DatabaseLifecycleController');
    const response = await this.lifecycleService.startInfo(userId, hostUid);
    return response;
  }

  /**
   * Get default information for creating a database.
   * Returns default database directory path, CUBRID version, and installation path.
   *
   * @route GET /:hostUid/database/create-info
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @returns GetCreatedbInfoClientResponse Default database creation information
   * @example
   * // GET /host-uid/database/create-info
   */
  @Get('create-info')
  async getCreateInfo(
    @Request() req,
    @Param('hostUid') hostUid: string
  ): Promise<GetCreatedbInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(`Getting create info for host: ${hostUid}`, 'DatabaseLifecycleController');
    return await this.lifecycleService.getCreatedbInfo(userId, hostUid);
  }

  /**
   * Start a database on a host.
   * Returns latest start info on success, throws domain error (DatabaseError) on failure.
   *
   * @route POST /:hostUid/database/start/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @returns StartInfoClientResponse Latest database start information
   * @example
   * // POST /host-uid/database/start/demodb
   */
  @Post('start/:dbname')
  async startDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string
  ): Promise<StartInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(`Starting database: ${dbname} on host: ${hostUid}`, 'DatabaseLifecycleController');
    const result = await this.lifecycleService.startDatabase(userId, hostUid, dbname);
    return result;
  }

  /**
   * Stop a database on a host.
   * Returns latest start info on success, throws domain error (DatabaseError) on failure.
   *
   * @route POST /:hostUid/database/stop/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @returns StartInfoClientResponse Latest database start information
   * @example
   * // POST /host-uid/database/stop/demodb
   */
  @Post('stop/:dbname')
  async stopDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string
  ): Promise<StartInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(`Stopping database: ${dbname} on host: ${hostUid}`, 'DatabaseLifecycleController');
    const result = await this.lifecycleService.stopDatabase(userId, hostUid, dbname);
    return result;
  }

  /**
   * Restart a database on a host (stop → start sequence).
   * Returns latest start info on success, throws domain error for each step failure.
   *
   * @route POST /:hostUid/database/restart/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @returns StartInfoClientResponse Latest database start information
   * @example
   * // POST /host-uid/database/restart/demodb
   */
  @Post('restart/:dbname')
  async restartDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string
  ): Promise<StartInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(`Restarting database: ${dbname} on host: ${hostUid}`, 'DatabaseLifecycleController');
    const result = await this.lifecycleService.restartDatabase(userId, hostUid, dbname);
    return result;
  }

  /**
   * Save a database profile for a host.
   * Returns latest start info on success (isProfileExists is updated).
   *
   * @route POST /:hostUid/database/register/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param body Request body containing `id`, `password`
   * @returns StartInfoClientResponse Latest database start information
   * @example
   * // POST /host-uid/database/register/demodb
   * // Body: { "id": "user", "password": "pass" }
   */
  @Post('register/:dbname')
  async saveDatabaseProfile(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Body() body: Omit<SaveDatabaseProfileRequest, 'hostUid' | 'dbname'>
  ): Promise<StartInfoClientResponse> {
    const userId = req.user.sub;

    validateRequiredFields(body, ['id', 'password'], 'database/register', this.logger);

    return await this.lifecycleService.saveDatabaseProfile(
      userId,
      hostUid,
      dbname,
      body.id,
      body.password
    );
  }

  /**
   * Create a new database with optional configuration.
   * Executes database creation, user update, auto-add volume, and auto-start in sequence.
   * Returns results from all executed operations.
   *
   * @route POST /:hostUid/database/create
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param body Request body containing database creation and configuration information
   * @returns CreateDatabaseWithConfigResponse Results from all executed operations
   * @example
   * // POST /host-uid/database/create
   * // Body: {
   * //   "dbname": "testdb", "numpage": "1000", "pagesize": "16384", ...,
   * //   "updateUser": { "dbname": "testdb", "username": "user", ... },
   * //   "setAutoAddVol": { "data": "ON", ... },
   * //   "setAutoStart": { "confname": "cubridconf", "dbname": "testdb" }
   * // }
   */
  @Post('create')
  async createDatabase(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Body() body: CreateDatabaseWithConfigRequest
  ): Promise<CreateDatabaseWithConfigResponse> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      [
        'dbname',
        'numpage',
        'pagesize',
        'logsize',
        'logpagesize',
        'genvolpath',
        'logvolpath',
        'charset',
        'overwrite_config_file',
      ],
      'database/create',
      this.logger
    );

    Logger.log(`Creating database: ${body.dbname} on host: ${hostUid}`, 'DatabaseLifecycleController');
    return await this.lifecycleService.createDatabase(userId, hostUid, body);
  }

  /**
   * Get database volume/space information for a database on a host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route GET /:hostUid/database/volume-info/:dbname
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @returns DatabaseVolumeInfoClientResponse Database volume/space information
   * @example
   * // GET /host-uid/database/volume-info/demodb
   */
  @Get('volume-info/:dbname')
  async getDatabaseVolumeInfo(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string
  ): Promise<DatabaseVolumeInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(
      `Getting volume info for database: ${dbname} on host: ${hostUid}`,
      'DatabaseLifecycleController'
    );
    const response = await this.lifecycleService.getDBSpaceInfo(userId, hostUid, dbname);
    return response;
  }
}
