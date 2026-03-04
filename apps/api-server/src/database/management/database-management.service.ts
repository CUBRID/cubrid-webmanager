import {
  AddVolDbRequest,
  AddVolDbResponse,
  CheckDatabaseRequest,
  CheckDatabaseResponse,
  CompactDatabaseRequest,
  CompactDatabaseResponse,
  DeleteDatabaseRequest,
  DeleteDatabaseResponse,
  GetAddVolStatusResponse,
  LoadDatabaseRequest,
  LoadDatabaseResponse,
  LockDatabaseRequest,
  LockDatabaseResponse,
  GetTransactionInfoRequest,
  GetTransactionInfoResponse,
  KillTransactionRequest,
  KillTransactionResponse,
  OptimizeDatabaseRequest,
  OptimizeDatabaseResponse,
  RenameDatabaseRequest,
  RenameDatabaseResponse,
  UnloadDatabaseRequest,
  UnloadInfoClientResponse,
} from '@api-interfaces';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { DatabaseConfigService } from '@database/config/database-config.service';
import {
  checkCmsStatusError,
  checkCmsTokenError,
  HandleCmsStatusErrors,
  HandleDatabaseErrors,
} from '@common';
import { ConfigError } from '@error/config/config-error';
import { ConfigErrorCode } from '@error/config/config-error-code';
import { CmsError } from '@error/cms/cms-error';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable, Logger } from '@nestjs/common';
import {
  AddVolDbCmsRequest,
  CheckDatabaseCmsRequest,
  CompactDatabaseCmsRequest,
  DeleteDatabaseCmsRequest,
  GetAddVolStatusCmsRequest,
  LoadDatabaseCmsRequest,
  LockDatabaseCmsRequest,
  GetTransactionInfoCmsRequest,
  KillTransactionCmsRequest,
  OptimizeDatabaseCmsRequest,
  RenameDatabaseCmsRequest,
  UnloadDatabaseCmsRequest,
  UnloadInfoCmsRequest,
} from '@type/cms-request';
import {
  AddVolDbCmsResponse,
  CheckDatabaseCmsResponse,
  CompactDatabaseCmsResponse,
  DeleteDatabaseCmsResponse,
  GetAddVolStatusCmsResponse,
  LoadDatabaseCmsResponse,
  LockDatabaseCmsResponse,
  GetTransactionInfoCmsResponse,
  KillTransactionCmsResponse,
  OptimizeDatabaseCmsResponse,
  RenameDatabaseCmsResponse,
  UnloadDatabaseCmsResponse,
  UnloadInfoCmsResponse,
} from '@type/cms-response';

/**
 * Service for managing database management operations.
 * Handles database unloading, loading, optimization, checking, and related management tasks.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseManagementService {
  private readonly logger = new Logger(DatabaseManagementService.name);

  constructor(
    private readonly hostService: HostService,
    private readonly cmsClient: CmsHttpsClientService,
    private readonly databaseConfigService: DatabaseConfigService
  ) {}

  /**
   * Unload a database.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing unload information
   * @returns Empty object on success
   * @throws DatabaseError If request fails or parameters are invalid
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async unloadDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: UnloadDatabaseRequest
  ): Promise<{}> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    // Determine target based on isSchemaIncluded and isDataIncluded
    let target: 'schema' | 'object' | 'both';

    if (request.isSchemaIncluded && request.isDataIncluded) {
      target = 'both';
    } else if (request.isSchemaIncluded) {
      target = 'schema';
    } else if (request.isDataIncluded) {
      target = 'object';
    } else {
      throw DatabaseError.InvalidParameter(
        'Both isSchemaIncluded and isDataIncluded cannot be false',
        {
          isSchemaIncluded: request.isSchemaIncluded,
          isDataIncluded: request.isDataIncluded,
        }
      );
    }

    // Build CMS request from client request
    const cmsRequest: UnloadDatabaseCmsRequest = {
      task: 'unloaddb',
      token: host.token || '',
      dbname: dbname,
      targetdir: request.targetdir,
      target: target,
      dbuser: request.dbuser,
      dbpasswd: request.dbpasswd,
      usehash: request.usehash,
      hashdir: request.hashdir,
      class: request.class,
      ref: request.ref,
      classonly: request.classonly,
      'as-dba': request['as-dba'],
      'skip-index-detail': request['skip-index-detail'],
      'split-schema-files': request['split-schema-files'],
      delimit: request.delimit,
      estimate: request.estimate,
      prefix: request.prefix,
      cach: request.cach,
      lofile: request.lofile,
    };

    const response = await this.cmsClient.postAuthenticated<
      UnloadDatabaseCmsRequest,
      UnloadDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    return response.result;
  }

  /**
   * Get unload information for databases on a host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @returns UnloadInfoClientResponse Unload information without CMS envelope fields
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getUnloadInfo(
    userId: string,
    hostUid: string
  ): Promise<UnloadInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const request: UnloadInfoCmsRequest = {
      task: 'unloadinfo',
      token: host.token || '',
    };

    const response = await this.cmsClient.postAuthenticated<
      UnloadInfoCmsRequest,
      UnloadInfoCmsResponse
    >(url, request);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

    return {
      database: dataOnly.database || [],
    };
  }

  /**
   * Load a database from schema and object files.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing load configuration
   * @returns LoadDatabaseResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async loadDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: LoadDatabaseRequest
  ): Promise<LoadDatabaseResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    // Build CMS request from client request
    const cmsRequest: LoadDatabaseCmsRequest = {
      task: 'loaddb',
      token: host.token || '',
      dbname: dbname,
      checkoption: request.checkoption,
      period: request.period,
      user: request.user,
      estimated: request.estimated,
      oiduse: request.oiduse,
      statisticsuse: request.statisticsuse,
      nolog: request.nolog,
      schema: request.schema,
      object: request.object,
      index: request.index,
      errorcontrolfile: request.errorcontrolfile,
      ignoreclassfile: request.ignoreclassfile,
    };

    const response = await this.cmsClient.postAuthenticated<
      LoadDatabaseCmsRequest,
      LoadDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    
    try {
      checkCmsStatusError(response);
    } catch (error) {
      if (error instanceof CmsError) {
        // Join line array with newline characters
        const lines = response.line || [];
        const lineMessage = lines.join('\n');

        // Update error message with line information
        const updatedMessage = error.additionalData?.message
          ? `${error.additionalData.message}\n${lineMessage}`
          : lineMessage || 'Error occurred during database loading';

        throw CmsError.RequestFailed(
          {
            message: updatedMessage,
            response: response,
          },
          error
        );
      }
      throw error;
    }

    // Success: return empty object
    return {};
  }

  /**
   * Optimize a database.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing optional class information
   * @returns OptimizeDatabaseResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async optimizeDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: OptimizeDatabaseRequest
  ): Promise<OptimizeDatabaseResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    // Build CMS request from client request
    const cmsRequest: OptimizeDatabaseCmsRequest = {
      task: 'optimizedb',
      token: host.token || '',
      dbname: dbname,
      ...(request.class && { class: request.class }),
    };

    const response = await this.cmsClient.postAuthenticated<
      OptimizeDatabaseCmsRequest,
      OptimizeDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    // Success: return empty object
    return {};
  }

  /**
   * Check a database.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing repair option
   * @returns CheckDatabaseResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async checkDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: CheckDatabaseRequest
  ): Promise<CheckDatabaseResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const cmsRequest: CheckDatabaseCmsRequest = {
      task: 'checkdb',
      token: host.token || '',
      dbname: dbname,
      repairdb: request.repairdb,
    };

    const response = await this.cmsClient.postAuthenticated<
      CheckDatabaseCmsRequest,
      CheckDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    // Success: return empty object
    return {};
  }

  /**
   * Compact a database.
   * Returns log output if verbose is 'y', otherwise returns empty object.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing verbose option
   * @returns CompactDatabaseResponse Log output if verbose is 'y', otherwise empty object
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async compactDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: CompactDatabaseRequest
  ): Promise<CompactDatabaseResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const cmsRequest: CompactDatabaseCmsRequest = {
      task: 'compactdb',
      token: host.token || '',
      dbname: dbname,
      verbose: request.verbose,
    };

    const response = await this.cmsClient.postAuthenticated<
      CompactDatabaseCmsRequest,
      CompactDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    // Return log if present, otherwise return empty object
    if (response.log) {
      return {
        log: response.log,
      };
    }

    return {};
  }

  /**
   * Rename a database.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Current database name
   * @param request Client request containing rename configuration
   * @returns RenameDatabaseResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async renameDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: RenameDatabaseRequest
  ): Promise<RenameDatabaseResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    // Build CMS request from client request
    const cmsRequest: RenameDatabaseCmsRequest = {
      task: 'renamedb',
      token: host.token || '',
      dbname: dbname,
      rename: request.rename,
      exvolpath: request.exvolpath,
      advanced: request.advanced,
      forcedel: request.forcedel,
    };

    // Include volume only when advanced is 'on'
    // Parse client volume format [{oldPath, newPath}, ...] to CMS format [{oldPath: newPath, ...}]
    if (request.advanced === 'on' && request.volume && request.volume.length > 0) {
      // Convert array of {oldPath, newPath} to single object with {oldPath: newPath} mappings
      const volumeMapping: { [oldPath: string]: string } = {};
      for (const item of request.volume) {
        volumeMapping[item.oldPath] = item.newPath;
      }
      cmsRequest.volume = [volumeMapping];
    }

    const response = await this.cmsClient.postAuthenticated<
      RenameDatabaseCmsRequest,
      RenameDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    // Success: return empty object
    return {};
  }

  /**
   * Get additional volume status for a database.
   * Returns domain-only data (CMS envelope fields removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @returns GetAddVolStatusResponse Volume status information
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async getAddVolStatus(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<GetAddVolStatusResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const request: GetAddVolStatusCmsRequest = {
      task: 'getaddvolstatus',
      token: host.token || '',
      dbname: dbname,
    };

    const response = await this.cmsClient.postAuthenticated<
      GetAddVolStatusCmsRequest,
      GetAddVolStatusCmsResponse
    >(url, request);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    return {
      freespace: response.freespace,
      volpath: response.volpath,
    };
  }

  /**
   * Add a volume to a database.
   * Returns domain-only data (CMS envelope fields removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Volume information
   * @returns AddVolDbResponse Volume addition result
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async addVolDb(
    userId: string,
    hostUid: string,
    dbname: string,
    request: AddVolDbRequest
  ): Promise<AddVolDbResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const cmsRequest: AddVolDbCmsRequest = {
      task: 'addvoldb',
      token: host.token || '',
      dbname: dbname,
      volname: request.volname,
      purpose: request.purpose,
      path: request.path,
      numberofpages: request.numberofpages,
      size_need_mb: request.size_need_mb,
    };

    const response = await this.cmsClient.postAuthenticated<
      AddVolDbCmsRequest,
      AddVolDbCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    return {
      dbname: response.dbname,
      purpose: response.purpose,
    };
  }

  /**
   * Get lock information for a database.
   * Returns lock information including lock entries, transactions, and lock statistics.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request (empty object, no body required)
   * @returns LockDatabaseResponse Lock information
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async lockDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: LockDatabaseRequest
  ): Promise<LockDatabaseResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const cmsRequest: LockDatabaseCmsRequest = {
      task: 'lockdb',
      token: host.token || '',
      dbname: dbname,
    };

    const response = await this.cmsClient.postAuthenticated<
      LockDatabaseCmsRequest,
      LockDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    // Return lockinfo only (CMS envelope removed)
    return {
      lockinfo: response.lockinfo,
    };
  }

  /**
   * Get transaction information for a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing dbuser and dbpasswd
   * @returns GetTransactionInfoResponse Transaction information
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async getTransactionInfo(
    userId: string,
    hostUid: string,
    dbname: string,
    request: GetTransactionInfoRequest
  ): Promise<GetTransactionInfoResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const cmsRequest: GetTransactionInfoCmsRequest = {
      task: 'gettransactioninfo',
      token: host.token || '',
      dbname: dbname,
      dbuser: request.dbuser,
      dbpasswd: request.dbpasswd,
    };

    const response = await this.cmsClient.postAuthenticated<
      GetTransactionInfoCmsRequest,
      GetTransactionInfoCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

    return dataOnly;
  }

  /**
   * Kill a transaction in a database or display active transactions.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing type and optional parameter:
   *   - type 'd': Display active transaction (parameter not required)
   *   - type 'i': Kill transaction by transaction index (parameter: transaction index)
   *   - type 'p': Kill all transactions with the specified process name (parameter: process name)
   *   - type 'h': Kill all transactions from the specified host (parameter: host name)
   * @returns KillTransactionResponse Transaction information
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async killTransaction(
    userId: string,
    hostUid: string,
    dbname: string,
    request: KillTransactionRequest
  ): Promise<KillTransactionResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    // Validate parameter requirement based on type
    if (request.type !== 'd' && !request.parameter) {
      throw DatabaseError.InvalidParameter(
        `Parameter is required for type '${request.type}'`,
        { type: request.type, parameter: request.parameter }
      );
    }

    // Build CMS request from client request
    const cmsRequest: KillTransactionCmsRequest = {
      task: 'killtransaction',
      token: host.token || '',
      dbname: dbname,
      type: request.type,
      ...(request.type !== 'd' && request.parameter && { parameter: request.parameter }),
    };

    const response = await this.cmsClient.postAuthenticated<
      KillTransactionCmsRequest,
      KillTransactionCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

    return dataOnly;
  }

  /**
   * Delete a database.
   * Also removes the database name from the server parameter in cubridconf if it exists.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing delbackup option
   * @returns DeleteDatabaseResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async deleteDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: DeleteDatabaseRequest
  ): Promise<DeleteDatabaseResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const cmsRequest: DeleteDatabaseCmsRequest = {
      task: 'deletedb',
      token: host.token || '',
      dbname: dbname,
      delbackup: request.delbackup,
    };

    const response = await this.cmsClient.postAuthenticated<
      DeleteDatabaseCmsRequest,
      DeleteDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    // Remove dbname from server parameter in cubridconf if it exists
    try {
      await this.databaseConfigService.removeAutoStart(userId, hostUid, {
        confname: 'cubridconf',
        dbname: dbname,
      });
      this.logger.debug(
        `Removed database name ${dbname} from server parameter in cubridconf`
      );
    } catch (error: any) {
      // Ignore DbnameNotFound error (dbname may not exist in server parameter)
      // Log other errors but don't fail the delete operation
      if (error instanceof ConfigError && error.code === ConfigErrorCode.DBNAME_NOT_FOUND) {
        this.logger.debug(
          `Database name ${dbname} not found in server parameter, skipping removal`
        );
      } else {
        this.logger.warn(
          `Failed to remove dbname from server parameter: ${error.message}`,
          error.stack
        );
      }
    }

    // Success: return empty object
    return {};
  }
}
