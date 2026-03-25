import {
  GetAutoAddVolClientResponse,
  GetDbSizeClientResponse,
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
  BaseService,
  checkCmsStatusError,
  checkCmsTokenError,
  HandleCmsConfigErrors,
  HandleDatabaseErrors,
} from '@common';
import { ConfigError } from '@error/config/config-error';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import {
  GetAutoExecQueryCmsRequest,
  SetAutoExecQueryCmsRequest,
  SetAutoAddVolCmsRequest,
  GetAutoAddVolCmsRequest,
  GetDbSizeCmsRequest,
  ClassInfoCmsRequest,
  GetAutoExecQueryErrLogCmsRequest,
} from '@type/cms-request';
import {
  GetAutoExecQueryCmsResponse,
  SetAutoExecQueryCmsResponse,
  SetAutoAddVolCmsResponse,
  GetAutoAddVolCmsResponse,
  GetDbSizeCmsResponse,
  ClassInfoCmsResponse,
  GetAutoExecQueryErrLogCmsResponse,
} from '@type/cms-response';
import { GetAllSysParamCmsResponse } from '@type/cms-response/get-all-sys-param-cms-response';
import { parseConfigParams } from '@util';
import { DATABASE_CONSTANTS } from '../database.constants';

/**
 * Service for managing database configuration operations.
 * Handles auto-execution query, auto-start, and auto-add volume configuration.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseConfigService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService,
    private readonly cmsConfigService: CmsConfigService
  ) {
    super(hostService, cmsClient);
  }

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
    const cmsRequest: SetAutoExecQueryCmsRequest = {
      task: 'setautoexecquery',
      dbname: dbname,
      planlist: autoExecQuery.planlist,
    };

    await this.executeCmsRequest<SetAutoExecQueryCmsRequest, SetAutoExecQueryCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return { success: true };
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
    const cmsRequest: GetAutoExecQueryCmsRequest = {
      task: 'getautoexecquery',
      dbname: dbname,
    };

    const response = await this.executeCmsRequest<
      GetAutoExecQueryCmsRequest,
      GetAutoExecQueryCmsResponse
    >(userId, hostUid, cmsRequest);

    const dataOnly = this.extractDomainData(response);

    const planlist = dataOnly.planlist.map((plan) => {
      const queryplan = plan.queryplan.map((query) => {
        // Handle @username field (from XML) and convert to username
        // Client response requires username to be non-optional
        if ('@username' in query && query['@username'] !== undefined) {
          const { '@username': atUsername, ...rest } = query;
          return {
            ...rest,
            username: atUsername || '',
          };
        }

        // Ensure username exists (required in client response)
        return {
          ...query,
          username: query.username || '',
        };
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
   * Adds database name to the server parameter in cubridconf configuration file.
   * If server parameter does not exist, it will be added to the [service] section.
   * The confname field in the request is ignored - the system always uses 'cubridconf'.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Request containing dbname (confname is ignored, always uses 'cubridconf')
   * @returns SetAutoStartResponse Configuration response on success
   * @throws ConfigError If request fails, [service] section not found, or server parameter cannot be added
   */
  @HandleCmsConfigErrors()
  async setAutoStart(
    userId: string,
    hostUid: string,
    request: SetAutoStartRequest
  ): Promise<SetAutoStartResponse> {
    const confname = DATABASE_CONSTANTS.CUBRID_CONF_NAME;

    // Get current configuration from cubridconf
    const currentConfig = await this.cmsConfigService.getAllSystemParam(
      userId,
      hostUid,
      confname
    );

    if (!currentConfig.conflist || currentConfig.conflist.length === 0) {
      throw ConfigError.NoConflistData(confname);
    }

    const confdata = currentConfig.conflist[0].confdata;
    if (!confdata || confdata.length === 0) {
      throw ConfigError.NoConfdata(confname);
    }
    this.logger.debug(JSON.stringify(currentConfig));

    // Find the server parameter in the [service] section
    const params = parseConfigParams(currentConfig as GetAllSysParamCmsResponse);
    const serverParam = params.find(
      (param) => param.key === 'server' && param.section === 'service'
    );

    let updatedConfdata: string[];

    if (!serverParam) {
      // Server parameter does not exist in [service] section
      // Find [service] section in confdata (case-sensitive, lowercase)
      let serviceSectionStartIndex = -1;

      for (let i = 0; i < confdata.length; i++) {
        const line = confdata[i].trim();

        // Check for [service] section (case-sensitive, lowercase)
        if (line === '[service]') {
          serviceSectionStartIndex = i;
          break;
        }
      }

      if (serviceSectionStartIndex === -1) {
        // [service] section does not exist, throw error
        throw ConfigError.ServerParamNotFound(confname, {
          message: '[service] section not found in configuration file',
        });
      }

      // [service] section exists, add server parameter after the section header
      const insertIndex = serviceSectionStartIndex + 1;
      updatedConfdata = [
        ...confdata.slice(0, insertIndex),
        `server=${request.dbname}`,
        ...confdata.slice(insertIndex),
      ];
      this.logger.debug(
        `Server parameter not found in [service] section, adding server=${request.dbname} at line ${insertIndex + 1}`
      );
    } else {
      // Parse existing server values
      const existingDbnames = serverParam.value
        ? serverParam.value
            .split(',')
            .map((db) => db.trim())
            .filter((db) => db.length > 0)
        : [];

      // Check if dbname already exists - if it does, return success without modification
      if (existingDbnames.includes(request.dbname)) {
        this.logger.debug(
          `Database name ${request.dbname} already exists in server parameter, returning current configuration`
        );
        const rv: SetAutoStartResponse = currentConfig as unknown as SetAutoStartResponse;
        this.logger.debug(JSON.stringify(rv));
        return rv;
      }

      // Append new dbname
      const updatedDbnames = [...existingDbnames, request.dbname];
      const updatedServerLine = `server=${updatedDbnames.join(',')}`;

      // Update confdata with new server line (lineNumber is 1-based, convert to 0-based index)
      updatedConfdata = [...confdata];
      updatedConfdata[serverParam.lineNumber - 1] = updatedServerLine;
    }

    const rv = await this.cmsConfigService.setSystemParam(
      userId,
      hostUid,
      confname,
      updatedConfdata
    );
    // Set updated configuration
    this.logger.debug(JSON.stringify(rv));
    return rv;
  }

  /**
   * Disable auto-start for a database.
   * Removes database name from the server parameter in cubridconf configuration file.
   * The confname field in the request is ignored - the system always uses 'cubridconf'.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Request containing dbname (confname is ignored, always uses 'cubridconf')
   * @returns RemoveAutoStartResponse Empty object on success
   * @throws ConfigError If request fails, server parameter not found in [service] section, or dbname does not exist
   */
  @HandleCmsConfigErrors()
  async removeAutoStart(
    userId: string,
    hostUid: string,
    request: RemoveAutoStartRequest
  ): Promise<RemoveAutoStartResponse> {
    const confname = DATABASE_CONSTANTS.CUBRID_CONF_NAME;

    // Get current configuration from cubridconf
    const currentConfig = await this.cmsConfigService.getAllSystemParam(
      userId,
      hostUid,
      confname
    );

    if (!currentConfig.conflist || currentConfig.conflist.length === 0) {
      throw ConfigError.NoConflistData(confname);
    }

    const confdata = currentConfig.conflist[0].confdata;
    if (!confdata || confdata.length === 0) {
      throw ConfigError.NoConfdata(confname);
    }

    // Find the server parameter in the [service] section
    const params = parseConfigParams(currentConfig as GetAllSysParamCmsResponse);
    const serverParam = params.find(
      (param) => param.key === 'server' && param.section === 'service'
    );

    if (!serverParam) {
      throw ConfigError.ServerParamNotFound(confname, {
        message: 'server parameter not found in [service] section',
      });
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
      throw ConfigError.DbnameNotFound(confname, request.dbname);
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
      confname,
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
    const cmsRequest: SetAutoAddVolCmsRequest = {
      task: 'setautoaddvol',
      dbname: dbname,
      data: request.data,
      data_warn_outofspace: request.data_warn_outofspace,
      data_ext_page: request.data_ext_page,
      index: request.index,
      index_warn_outofspace: request.index_warn_outofspace,
      index_ext_page: request.index_ext_page,
    };

    await this.executeCmsRequest<SetAutoAddVolCmsRequest, SetAutoAddVolCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return { success: true };
  }

  /**
   * Get database size (CMS task: getdbsize).
   * Request: task, token, dbname. Response: __EXEC_TIME, dbsize, note, status, task.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @returns GetDbSizeClientResponse dbsize (bytes as string)
   */
  @HandleDatabaseErrors()
  async getDbSize(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<GetDbSizeClientResponse> {
    const cmsRequest: GetDbSizeCmsRequest = {
      task: 'getdbsize',
      dbname,
    };

    const response = await this.executeCmsRequest<
      GetDbSizeCmsRequest,
      GetDbSizeCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw DatabaseError.GetDbSizeFailed({ response, dbname });
    }

    return {
      dbsize: response.dbsize ?? '0',
    };
  }

  /**
   * Get auto-add volume configuration for a database (CMS task: getautoaddvol).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @returns GetAutoAddVolClientResponse volume fields only (CMS envelope omitted)
   */
  @HandleDatabaseErrors()
  async getAutoAddVol(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<GetAutoAddVolClientResponse> {
    const cmsRequest: GetAutoAddVolCmsRequest = {
      task: 'getautoaddvol',
      dbname,
    };

    const response = await this.executeCmsRequest<
      GetAutoAddVolCmsRequest,
      GetAutoAddVolCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      const cms = response as GetAutoAddVolCmsResponse;
      return {
        data: cms.data,
        data_ext_page: cms.data_ext_page,
        data_warn_outofspace: cms.data_warn_outofspace,
        index: cms.index,
        index_ext_page: cms.index_ext_page,
        index_warn_outofspace: cms.index_warn_outofspace,
      };
    }

    throw DatabaseError.InternalError({ response, dbname });
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
    const cmsRequest: ClassInfoCmsRequest = {
      task: 'classinfo',
      dbname: dbname,
      dbstatus: request.dbstatus,
    };

    const response = await this.executeCmsRequest<ClassInfoCmsRequest, ClassInfoCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return this.extractDomainData(response);
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
    const cmsRequest: GetAutoExecQueryErrLogCmsRequest = {
      task: 'getautoexecqueryerrlog',
    };

    this.logger.debug('Getting auto-execution query error log');

    const response = await this.executeCmsRequest<
      GetAutoExecQueryErrLogCmsRequest,
      GetAutoExecQueryErrLogCmsResponse
    >(userId, hostUid, cmsRequest);

    return this.extractDomainData(response);
  }
}
