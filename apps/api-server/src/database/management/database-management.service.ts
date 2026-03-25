import {
  AddVolDbRequest,
  AddVolDbResponse,
  CheckDatabaseRequest,
  CheckDatabaseResponse,
  CompactDatabaseRequest,
  CompactDatabaseResponse,
  CopyDbRequest,
  CmsSuccessClientResponse,
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
  StartInfoClientResponse,
  UnloadDatabaseRequest,
  UnloadInfoClientResponse,
} from '@api-interfaces';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { DatabaseInfoService } from '@database/info/database-info.service';
import {
  checkCmsStatusError,
  checkCmsTokenError,
  HandleCmsStatusErrors,
  HandleDatabaseErrors,
} from '@common';
import { CmsError } from '@error/cms/cms-error';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { BaseService } from '@common';
import {
  AddVolDbCmsRequest,
  CheckDatabaseCmsRequest,
  CompactDatabaseCmsRequest,
  CopyDbCmsRequest,
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
  CopyDbCmsResponse,
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
export class DatabaseManagementService extends BaseService {
  constructor(
    hostService: HostService,
    cmsClient: CmsHttpsClientService,
    private readonly databaseInfoService: DatabaseInfoService
  ) {
    super(hostService, cmsClient);
  }

  /**
   * Copy a database (CMS task: copydb).
   * volume is only included when advanced is "on" (or "y").
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Client request (srcdbname, destdbname, destdbpath, exvolpath, logpath, overwrite, move, advanced, volume?)
   * @returns Empty object on success
   */
  @HandleDatabaseErrors()
  async copyDb(
    userId: string,
    hostUid: string,
    request: CopyDbRequest
  ): Promise<CmsSuccessClientResponse> {
    const cmsRequest: CopyDbCmsRequest = {
      task: 'copydb',
      srcdbname: request.srcdbname,
      destdbname: request.destdbname,
      destdbpath: request.destdbpath,
      exvolpath: request.exvolpath,
      logpath: request.logpath,
      overwrite: request.overwrite,
      move: request.move,
      advanced: request.advanced,
    };
    if (request.advanced === 'on' || request.advanced === 'y') {
      if (request.volume && request.volume.length > 0) {
        cmsRequest.volume = request.volume;
      }
    }

    const response = await this.executeCmsRequest<
      CopyDbCmsRequest,
      CopyDbCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw DatabaseError.CopyDbFailed({
        response,
        srcdbname: request.srcdbname,
        destdbname: request.destdbname,
      });
    }

    return { success: true };
  }

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

    const response = await this.executeCmsRequest<
      UnloadDatabaseCmsRequest,
      UnloadDatabaseCmsResponse
    >(userId, hostUid, cmsRequest);

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
    const request: UnloadInfoCmsRequest = {
      task: 'unloadinfo',
    };

    const response = await this.executeCmsRequest<
      UnloadInfoCmsRequest,
      UnloadInfoCmsResponse
    >(userId, hostUid, request);

    const dataOnly = this.extractDomainData(response);

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
    // Build CMS request from client request
    const cmsRequest: LoadDatabaseCmsRequest = {
      task: 'loaddb',
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

    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const requestWithToken = { ...cmsRequest, token: host.token || '' };

    const response = await this.cmsClient.postAuthenticated<
      LoadDatabaseCmsRequest,
      LoadDatabaseCmsResponse
    >(url, requestWithToken);

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

    return { success: true };
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
    // Build CMS request from client request
    const cmsRequest: OptimizeDatabaseCmsRequest = {
      task: 'optimizedb',
      dbname: dbname,
      ...(request.class && { class: request.class }),
    };

    await this.executeCmsRequest<OptimizeDatabaseCmsRequest, OptimizeDatabaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return { success: true };
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
    const cmsRequest: CheckDatabaseCmsRequest = {
      task: 'checkdb',
      dbname: dbname,
      repairdb: request.repairdb,
    };

    const response = await this.executeCmsRequest<
      CheckDatabaseCmsRequest,
      CheckDatabaseCmsResponse
    >(userId, hostUid, cmsRequest);

    return { success: true };
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
    const cmsRequest: CompactDatabaseCmsRequest = {
      task: 'compactdb',
      dbname: dbname,
      verbose: request.verbose,
    };

    const response = await this.executeCmsRequest<
      CompactDatabaseCmsRequest,
      CompactDatabaseCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.log) {
      return {
        success: true,
        log: response.log,
      };
    }

    return { success: true };
  }

  /**
   * Rename a database.
   * Returns start-info (db list) on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Current database name
   * @param request Client request containing rename configuration
   * @returns StartInfoClientResponse Latest database list (start-info) on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async renameDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: RenameDatabaseRequest
  ): Promise<StartInfoClientResponse> {
    // Build CMS request from client request
    const cmsRequest: RenameDatabaseCmsRequest = {
      task: 'renamedb',
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

    await this.executeCmsRequest<
      RenameDatabaseCmsRequest,
      RenameDatabaseCmsResponse
    >(userId, hostUid, cmsRequest);

    // Return latest db list (start-info)
    return await this.databaseInfoService.startInfo(userId, hostUid);
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
    const cmsRequest: GetAddVolStatusCmsRequest = {
      task: 'getaddvolstatus',
      dbname: dbname,
    };

    const response = await this.executeCmsRequest<
      GetAddVolStatusCmsRequest,
      GetAddVolStatusCmsResponse
    >(userId, hostUid, cmsRequest);

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
    const cmsRequest: AddVolDbCmsRequest = {
      task: 'addvoldb',
      dbname: dbname,
      volname: request.volname,
      purpose: request.purpose,
      path: request.path,
      numberofpages: request.numberofpages,
      size_need_mb: request.size_need_mb,
    };

    const response = await this.executeCmsRequest<
      AddVolDbCmsRequest,
      AddVolDbCmsResponse
    >(userId, hostUid, cmsRequest);

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
    const cmsRequest: LockDatabaseCmsRequest = {
      task: 'lockdb',
      dbname: dbname,
    };

    this.logger.debug(`Getting lock information for database: ${dbname}`);

    const response = await this.executeCmsRequest<
      LockDatabaseCmsRequest,
      LockDatabaseCmsResponse
    >(userId, hostUid, cmsRequest);

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
    const cmsRequest: GetTransactionInfoCmsRequest = {
      task: 'gettransactioninfo',
      dbname: dbname,
      dbuser: request.dbuser,
      dbpasswd: request.dbpasswd,
    };

    this.logger.debug(
      `Getting transaction information for database: ${dbname}, user: ${request.dbuser}`
    );

    const response = await this.executeCmsRequest<
      GetTransactionInfoCmsRequest,
      GetTransactionInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    return this.extractDomainData(response);
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
    // Validate parameter requirement based on type
    if (request.type !== 'd' && !request.parameter) {
      const typeDescriptions: Record<string, string> = {
        i: 'transaction index',
        p: 'process name',
        h: 'host name',
      };
      throw DatabaseError.InvalidParameter(
        `Parameter is required for type '${request.type}' (${typeDescriptions[request.type] || 'unknown type'})`,
        {
          type: request.type,
          parameter: request.parameter,
          dbname: dbname,
          message: `Missing required parameter for kill transaction type '${request.type}'. Expected: ${typeDescriptions[request.type] || 'parameter'}`,
        }
      );
    }

    // Build CMS request from client request
    const cmsRequest: KillTransactionCmsRequest = {
      task: 'killtransaction',
      dbname: dbname,
      type: request.type,
      ...(request.type !== 'd' && request.parameter && { parameter: request.parameter }),
    };

    this.logger.debug(
      `Killing transaction for database: ${dbname} on host: ${hostUid} with type: ${request.type} and parameter: ${request.parameter}`
    );

    const response = await this.executeCmsRequest<
      KillTransactionCmsRequest,
      KillTransactionCmsResponse
    >(userId, hostUid, cmsRequest);

    return this.extractDomainData(response);
  }
}
