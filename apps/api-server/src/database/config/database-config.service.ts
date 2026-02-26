import {
  GetAutoExecQueryClientResponse,
  SetAutoExecQueryClientRequest,
  SetAutoExecQueryClientResponse,
  SetAutoStartRequest,
  SetAutoStartResponse,
  RemoveAutoStartRequest,
  RemoveAutoStartResponse,
  SetAutoAddVolRequest,
  SetAutoAddVolResponse,
  ClassInfoRequest,
  ClassInfoResponse,
  GetAutoExecQueryErrLogRequest,
  GetAutoExecQueryErrLogResponse,
} from '@api-interfaces';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
  checkCmsStatusError,
  checkCmsTokenError,
  HandleDatabaseErrors,
} from '@common';
import { ConfigError } from '@error/config/config-error';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable, Logger } from '@nestjs/common';
import {
  GetAutoExecQueryCmsRequest,
  SetAutoExecQueryCmsRequest,
  SetAutoAddVolCmsRequest,
  ClassInfoCmsRequest,
  GetAutoExecQueryErrLogCmsRequest,
} from '@type/cms-request';
import {
  GetAutoExecQueryCmsResponse,
  SetAutoExecQueryCmsResponse,
  SetAutoAddVolCmsResponse,
  ClassInfoCmsResponse,
  GetAutoExecQueryErrLogCmsResponse,
} from '@type/cms-response';
import { GetAllSysParamCmsResponse } from '@type/cms-response/get-all-sys-param-cms-response';
import { parseConfigParams } from '@util';

/**
 * Service for managing database configuration operations.
 * Handles auto-execution query, auto-start, and auto-add volume configuration.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseConfigService {
  private readonly logger = new Logger(DatabaseConfigService.name);

  constructor(
    private readonly hostService: HostService,
    private readonly cmsClient: CmsHttpsClientService,
    private readonly cmsConfigService: CmsConfigService
  ) {}

  /**
   * Set auto-execution query for a database.
   * Returns empty object on success (CMS envelope fields removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param autoExecQuery Auto-execution query configuration
   * @returns SetAutoExecQueryClientResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async setAutoExecQuery(
    userId: string,
    hostUid: string,
    dbname: string,
    autoExecQuery: SetAutoExecQueryClientRequest
  ): Promise<SetAutoExecQueryClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const request: SetAutoExecQueryCmsRequest = {
      task: 'setautoexecquery',
      token: host.token || '',
      dbname: dbname,
      planlist: autoExecQuery.planlist,
    };

    const response = await this.cmsClient.postAuthenticated<
      SetAutoExecQueryCmsRequest,
      SetAutoExecQueryCmsResponse
    >(url, request);

    checkCmsTokenError(response);

    checkCmsStatusError(response);

    return {};
  }

  /**
   * Get auto-execution query for a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @returns GetAutoExecQueryClientResponse Auto-execution query information
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getAutoExecQuery(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<GetAutoExecQueryClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const request: GetAutoExecQueryCmsRequest = {
      task: 'getautoexecquery',
      token: host.token || '',
      dbname: dbname,
    };

    const response = await this.cmsClient.postAuthenticated<
      GetAutoExecQueryCmsRequest,
      GetAutoExecQueryCmsResponse
    >(url, request);

    checkCmsTokenError(response);

    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

    const planlist = dataOnly.planlist.map((plan) => {
      const queryplan = plan.queryplan.map((query) => {
        const queryAny = query as any;

        if (queryAny['@username'] !== undefined) {
          const { '@username': atUsername, ...rest } = queryAny;
          return {
            ...rest,
            username: atUsername || '',
          };
        }

        return queryAny;
      });

      return {
        dbname: plan.dbname,
        queryplan: queryplan,
      };
    });

    return {
      planlist: planlist,
    };
  }

  /**
   * Enable auto-start for a database.
   * Adds database name to the server parameter in configuration file.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Request containing confname and dbname
   * @returns SetAutoStartResponse Empty object on success
   * @throws DatabaseError If request fails, server parameter not found, or dbname already exists
   */
  @HandleDatabaseErrors()
  async setAutoStart(
    userId: string,
    hostUid: string,
    request: SetAutoStartRequest
  ): Promise<SetAutoStartResponse> {
    // Get current configuration
    const currentConfig = await this.cmsConfigService.getAllSystemParam(
      userId,
      hostUid,
      request.confname
    );

    if (!currentConfig.conflist || currentConfig.conflist.length === 0) {
      throw ConfigError.NoConflistData(request.confname);
    }

    const confdata = currentConfig.conflist[0].confdata;
    if (!confdata || confdata.length === 0) {
      throw ConfigError.NoConfdata(request.confname);
    }

    // Find the server parameter using utility function
    // Type assertion is safe because parseConfigParams only uses conflist property
    const params = parseConfigParams(currentConfig as GetAllSysParamCmsResponse);
    const serverParam = params.find((param) => param.key === 'server');

    if (!serverParam) {
      throw ConfigError.ServerParamNotFound(request.confname);
    }

    // Parse existing server values
    const existingDbnames = serverParam.value
      ? serverParam.value
          .split(',')
          .map((db) => db.trim())
          .filter((db) => db.length > 0)
      : [];

    // Check if dbname already exists
    if (existingDbnames.includes(request.dbname)) {
      throw ConfigError.DbnameAlreadyExists(request.confname, request.dbname);
    }

    // Append new dbname
    const updatedDbnames = [...existingDbnames, request.dbname];
    const updatedServerLine = `server=${updatedDbnames.join(',')}`;

    // Update confdata with new server line (lineNumber is 1-based, convert to 0-based index)
    const updatedConfdata = [...confdata];
    updatedConfdata[serverParam.lineNumber - 1] = updatedServerLine;

    // Set updated configuration
    return await this.cmsConfigService.setSystemParam(
      userId,
      hostUid,
      request.confname,
      updatedConfdata
    );
  }

  /**
   * Disable auto-start for a database.
   * Removes database name from the server parameter in configuration file.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Request containing confname and dbname
   * @returns RemoveAutoStartResponse Empty object on success
   * @throws DatabaseError If request fails, server parameter not found, or dbname does not exist
   */
  @HandleDatabaseErrors()
  async removeAutoStart(
    userId: string,
    hostUid: string,
    request: RemoveAutoStartRequest
  ): Promise<RemoveAutoStartResponse> {
    // Get current configuration
    const currentConfig = await this.cmsConfigService.getAllSystemParam(
      userId,
      hostUid,
      request.confname
    );

    if (!currentConfig.conflist || currentConfig.conflist.length === 0) {
      throw ConfigError.NoConflistData(request.confname);
    }

    const confdata = currentConfig.conflist[0].confdata;
    if (!confdata || confdata.length === 0) {
      throw ConfigError.NoConfdata(request.confname);
    }

    // Find the server parameter using utility function
    // Type assertion is safe because parseConfigParams only uses conflist property
    const params = parseConfigParams(currentConfig as GetAllSysParamCmsResponse);
    const serverParam = params.find((param) => param.key === 'server');

    if (!serverParam) {
      throw ConfigError.ServerParamNotFound(request.confname);
    }

    // Parse existing server values
    const existingDbnames = serverParam.value
      ? serverParam.value
          .split(',')
          .map((db) => db.trim())
          .filter((db) => db.length > 0)
      : [];

    // Check if dbname exists
    if (!existingDbnames.includes(request.dbname)) {
      throw ConfigError.DbnameNotFound(request.confname, request.dbname);
    }

    // Remove dbname
    const updatedDbnames = existingDbnames.filter((db) => db !== request.dbname);
    const updatedServerLine =
      updatedDbnames.length > 0 ? `server=${updatedDbnames.join(',')}` : 'server=';

    // Update confdata with updated server line (lineNumber is 1-based, convert to 0-based index)
    const updatedConfdata = [...confdata];
    updatedConfdata[serverParam.lineNumber - 1] = updatedServerLine;

    // Set updated configuration
    return await this.cmsConfigService.setSystemParam(
      userId,
      hostUid,
      request.confname,
      updatedConfdata
    );
  }

  /**
   * Set auto-add volume configuration for a database.
   * Returns empty object on success (CMS envelope fields removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Auto-add volume configuration
   * @returns SetAutoAddVolResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async setAutoAddVol(
    userId: string,
    hostUid: string,
    dbname: string,
    request: SetAutoAddVolRequest
  ): Promise<SetAutoAddVolResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const cmsRequest: SetAutoAddVolCmsRequest = {
      task: 'setautoaddvol',
      token: host.token || '',
      dbname: dbname,
      data: request.data,
      data_warn_outofspace: request.data_warn_outofspace,
      data_ext_page: request.data_ext_page,
      index: request.index,
      index_warn_outofspace: request.index_warn_outofspace,
      index_ext_page: request.index_ext_page,
    };

    const response = await this.cmsClient.postAuthenticated<
      SetAutoAddVolCmsRequest,
      SetAutoAddVolCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);

    checkCmsStatusError(response);

    return {};
  }

  /**
   * Get class information for a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Request containing dbstatus
   * @returns ClassInfoResponse Class information (system classes and user classes)
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getClassInfo(
    userId: string,
    hostUid: string,
    dbname: string,
    request: ClassInfoRequest
  ): Promise<ClassInfoResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const cmsRequest: ClassInfoCmsRequest = {
      task: 'classinfo',
      token: host.token || '',
      dbname: dbname,
      dbstatus: request.dbstatus,
    };

    const response = await this.cmsClient.postAuthenticated<
      ClassInfoCmsRequest,
      ClassInfoCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

    return dataOnly;
  }

  /**
   * Get auto-execution query error log.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Client request (empty object)
   * @returns GetAutoExecQueryErrLogResponse Error log entries
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getAutoExecQueryErrLog(
    userId: string,
    hostUid: string,
    request: GetAutoExecQueryErrLogRequest
  ): Promise<GetAutoExecQueryErrLogResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const cmsRequest: GetAutoExecQueryErrLogCmsRequest = {
      task: 'getautoexecqueryerrlog',
      token: host.token || '',
    };

    const response = await this.cmsClient.postAuthenticated<
      GetAutoExecQueryErrLogCmsRequest,
      GetAutoExecQueryErrLogCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

    return dataOnly;
  }
}
