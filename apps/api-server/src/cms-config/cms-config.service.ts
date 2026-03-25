import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
  GetAddBrokerInfoClientResponse,
  GetEnvClientResponse,
  GetAllSysParamClientResponse,
  ParamdumpClientResponse,
  SetSysParamClientResponse,
  StatdumpClientResponse,
} from '@api-interfaces';
import {
  ParamdumpCmsRequest,
  SetSysParamCmsRequest,
  StatdumpCmsRequest,
  BaseCmsRequest,
  GetAddBrokerInfoCmsRequest,
  BrokerSetParamCmsRequest,
} from '@type';
import { GetAddBrokerInfoCmsResponse } from '@type/cms-response/get-add-broker-info-cms-response';
import { GetEnvCmsResponse } from '@type/cms-response/get-env-cms-response';
import { GetAllSysParamCmsRequest } from '@type/cms-request/get-all-sys-param-cms-request';
import { GetAllSysParamCmsResponse } from '@type/cms-response/get-all-sys-param-cms-response';
import { ParamdumpCmsResponse } from '@type/cms-response/paramdump-cms-response';
import { StatdumpCmsResponse } from '@type/cms-response/statdump-cms-response';
import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { BaseService, HandleCmsConfigErrors } from '@common';
import { ConfigError } from '@error/config/config-error';

/**
 * Service for managing CMS environment configuration operations.
 *
 * Provides methods to retrieve environment information from CMS hosts
 * including CUBRID version, broker version, database paths, and system information.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class CmsConfigService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService
  ) {
    super(hostService, cmsClient);
  }

  /**
   * Get environment information from a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @returns GetEnvClientResponse Environment information without CMS envelope fields
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsConfigErrors()
  async getEnv(userId: string, hostUid: string): Promise<GetEnvClientResponse> {
    const cmsRequest: BaseCmsRequest = {
      task: 'getenv',
    };

    const response = await this.executeCmsRequest<BaseCmsRequest, GetEnvCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status === 'success') {
      return this.extractDomainData(response);
    }

    throw ConfigError.GetAllSysParamFailed('getenv', {
      note: response.note || 'Unknown error',
    });
  }

  /**
   * Get database parameters dump from a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param dbname - Database name
   * @returns ParamdumpClientResponse Database parameters without CMS envelope fields
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsConfigErrors()
  async getParamDump(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<ParamdumpClientResponse> {
    const cmsRequest: BaseCmsRequest & { dbname: string; both: 'n' } = {
      task: 'paramdump',
      both: 'n',
      dbname: dbname,
    };

    const response = await this.executeCmsRequest<
      BaseCmsRequest & { dbname: string; both: 'n' },
      ParamdumpCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      return this.extractDomainData(response);
    }

    throw ConfigError.GetAllSysParamFailed('paramdump', {
      note: response.note || 'Unknown error',
    });
  }

  /**
   * Get database statistics dump from a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param dbname - Database name
   * @returns StatdumpClientResponse Database statistics without CMS envelope fields
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsConfigErrors()
  async getStatDump(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<StatdumpClientResponse> {
    const cmsRequest: BaseCmsRequest & { dbname: string } = {
      task: 'statdump',
      dbname,
    };

    const response = await this.executeCmsRequest<
      BaseCmsRequest & { dbname: string },
      StatdumpCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      return this.extractDomainData(response);
    }

    throw ConfigError.GetAllSysParamFailed('statdump', {
      note: response.note || 'Unknown error',
    });
  }

  /**
   * Get all system parameters from a configuration file on a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param confname - Configuration file name (e.g., "cubridconf", "broker.conf")
   * @returns GetAllSysParamClientResponse System parameters without CMS envelope fields
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsConfigErrors()
  async getAllSystemParam(
    userId: string,
    hostUid: string,
    confname: string
  ): Promise<GetAllSysParamClientResponse> {
    const cmsRequest: GetAllSysParamCmsRequest = {
      task: 'getallsysparam',
      confname: confname,
    };

    const response = await this.executeCmsRequest<
      GetAllSysParamCmsRequest,
      GetAllSysParamCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      return this.extractDomainData(response);
    }

    throw ConfigError.GetAllSysParamFailed(confname, { note: response.note });
  }

  /**
   * Set system parameters in a configuration file on a CMS host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param confname - Configuration file name (e.g., "cubridconf", "broker.conf")
   * @param confdata - Configuration data as array of lines
   * @returns SetSysParamClientResponse Empty object on success (CMS envelope fields removed)
   * @throws Error if the request fails or CMS status is not success
   */
  @HandleCmsConfigErrors()
  async setSystemParam(
    userId: string,
    hostUid: string,
    confname: string,
    confdata: string[]
  ): Promise<SetSysParamClientResponse> {
    const cmsRequest: SetSysParamCmsRequest = {
      task: 'setsysparam',
      confname: confname,
      confdata: confdata,
    };

    await this.executeCmsRequest<SetSysParamCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return { success: true };
  }

  /**
   * Get broker config file content from a CMS host (CMS task: getaddbrokerinfo).
   * Returns conflist (config lines) and confname (CMS envelope omitted).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param confname - Config name (e.g. "brokerconf")
   * @returns GetAddBrokerInfoClientResponse conflist, confname
   */
  @HandleCmsConfigErrors()
  async getAddBrokerInfo(
    userId: string,
    hostUid: string,
    confname: string
  ): Promise<GetAddBrokerInfoClientResponse> {
    const cmsRequest: GetAddBrokerInfoCmsRequest = {
      task: 'getaddbrokerinfo',
      confname,
    };

    const response = await this.executeCmsRequest<
      GetAddBrokerInfoCmsRequest,
      GetAddBrokerInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      const cms = response as GetAddBrokerInfoCmsResponse;
      return {
        conflist: cms.conflist,
        confname: cms.confname,
      };
    }

    throw ConfigError.GetAllSysParamFailed('getaddbrokerinfo', {
      note: response.note || 'Unknown error',
    });
  }

  /**
   * Set broker configuration file content on a CMS host (CMS task: broker_setparam).
   *
   * @param userId - User ID from JWT
   * @param hostUid - Host unique identifier
   * @param confdata - Configuration data as array of lines (broker config content)
   * @returns SetSysParamClientResponse Empty object on success
   */
  @HandleCmsConfigErrors()
  async setBrokerParam(
    userId: string,
    hostUid: string,
    confdata: string[]
  ): Promise<SetSysParamClientResponse> {
    const cmsRequest: BrokerSetParamCmsRequest = {
      task: 'broker_setparam',
      confdata,
    };

    const response = await this.executeCmsRequest<
      BrokerSetParamCmsRequest,
      BaseCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw ConfigError.SetSysParamFailed('broker', {
        note: response.note || 'Unknown error',
      });
    }

    return { success: true };
  }
}
