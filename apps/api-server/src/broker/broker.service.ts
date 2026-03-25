import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleBrokerErrors } from '@common';
import { BrokerError } from '@error/broker/broker-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import {
  AddDbmtUserClientResponse,
  AddDbmtUserRequest,
  BrokerStartStopClientResponse,
  GetBrokerStatusClientResponse,
  StartAllBrokersClientResponse,
  StopAllBrokersClientResponse,
  UpdateDbmtUserClientResponse,
  UpdateDbmtUserRequest,
} from '@api-interfaces';
import {
  AddDbmtUserCmsRequest,
  BaseCmsRequest,
  BaseCmsResponse,
  GetBrokerStatusCmsRequest,
  GetBrokerStatusCmsResponse,
  GetBrokersInfoCmsResponse,
  HandleBrokerCmsRequest,
  StartBrokerCmsRequest,
  StopAllBrokersCmsRequest,
  UpdateDbmtUserCmsRequest,
} from '@type';
import {
  AddDbmtUserCmsResponse,
  StartBrokerCmsResponse,
  StopAllBrokersCmsResponse,
  UpdateDbmtUserCmsResponse,
} from '@type/cms-response';

/**
 * Service for managing broker operations.
 *
 * Provides high-level business logic for broker-related operations
 * including message handling and service coordination.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class BrokerService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService
  ) {
    super(hostService, cmsClient);
  }

  /**
   * Add a DBMT (CMS) user on the host.
   * CMS task: adddbmtuser.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request targetid, password, casauth, dbcreate, statusmonitorauth
   * @returns AddDbmtUserClientResponse dblist and userlist (domain data only)
   */
  @HandleBrokerErrors()
  async addDbmtUser(
    userId: string,
    hostUid: string,
    request: AddDbmtUserRequest
  ): Promise<AddDbmtUserClientResponse> {
    const cmsRequest: AddDbmtUserCmsRequest = {
      task: 'adddbmtuser',
      targetid: request.targetid,
      password: request.password,
      casauth: request.casauth,
      dbcreate: request.dbcreate,
      statusmonitorauth: request.statusmonitorauth,
    };

    const response = await this.executeCmsRequest<
      AddDbmtUserCmsRequest,
      AddDbmtUserCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw BrokerError.AddDbmtUserFailed({ response });
    }

    return {
      dblist: response.dblist ?? [],
      userlist: response.userlist ?? [],
    };
  }

  /**
   * Update a DBMT (CMS) user on the host.
   * CMS task: updatedbmtuser.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request targetid, dbauth, casauth, dbcreate, statusmonitorauth (no password)
   * @returns UpdateDbmtUserClientResponse dblist and userlist (domain data only)
   */
  @HandleBrokerErrors()
  async updateDbmtUser(
    userId: string,
    hostUid: string,
    request: UpdateDbmtUserRequest
  ): Promise<UpdateDbmtUserClientResponse> {
    const cmsRequest: UpdateDbmtUserCmsRequest = {
      task: 'updatedbmtuser',
      targetid: request.targetid,
      dbauth: request.dbauth ?? [],
      casauth: request.casauth,
      dbcreate: request.dbcreate,
      statusmonitorauth: request.statusmonitorauth,
    };

    const response = await this.executeCmsRequest<
      UpdateDbmtUserCmsRequest,
      UpdateDbmtUserCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw BrokerError.UpdateDbmtUserFailed({ response });
    }

    return {
      dblist: response.dblist ?? [],
      userlist: response.userlist ?? [],
    };
  }

  @HandleBrokerErrors()
  async getBrokers(userId: string, hostUid: string) {
    const cmsRequest: BaseCmsRequest = {
      task: 'getbrokersinfo',
    };
    const response = await this.executeCmsRequest<BaseCmsRequest, GetBrokersInfoCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status !== 'success') {
      throw BrokerError.GetBrokersFailed();
    }
    return response.brokersinfo;
  }

  @HandleBrokerErrors()
  async stopBroker(
    userId: string,
    hostUid: string,
    bname: string
  ): Promise<BrokerStartStopClientResponse> {
    const cmsRequest: HandleBrokerCmsRequest = {
      task: 'broker_stop',
      bname: bname,
    };

    const response = await this.executeCmsRequest<
      HandleBrokerCmsRequest,
      import('@type/cms-response/base-cms-response').BaseCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw BrokerError.BrokerStopFailed();
    }
    return { success: true };
  }

  @HandleBrokerErrors()
  async startBroker(
    userId: string,
    hostUid: string,
    bname: string
  ): Promise<BrokerStartStopClientResponse> {
    const cmsRequest: HandleBrokerCmsRequest = {
      task: 'broker_start',
      bname: bname,
    };

    const response = await this.executeCmsRequest<
      HandleBrokerCmsRequest,
      import('@type/cms-response/base-cms-response').BaseCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw BrokerError.BrokerStartFailed();
    }
    return { success: true };
  }

  @HandleBrokerErrors()
  async restartBroker(userId: string, hostUid: string, bname: string): Promise<boolean> {
    const stopRequest: HandleBrokerCmsRequest = {
      task: 'broker_stop',
      bname: bname,
    };

    const stopResponse = await this.executeCmsRequest<
      HandleBrokerCmsRequest,
      BaseCmsResponse
    >(userId, hostUid, stopRequest);
    if (stopResponse.status === 'success') {
      const startRequest: HandleBrokerCmsRequest = {
        task: 'broker_start',
        bname: bname,
      };

      const startResponse = await this.executeCmsRequest<
        HandleBrokerCmsRequest,
        BaseCmsResponse
      >(userId, hostUid, startRequest);
      if (startResponse.status === 'success') {
        return true;
      } else {
        throw BrokerError.BrokerStartFailed();
      }
    } else {
      throw BrokerError.BrokerStopFailed();
    }
  }

  /**
   * Get broker status including application server information.
   *
   * @param userId - User ID
   * @param hostUid - Host unique identifier
   * @param bname - Broker name
   * @returns Broker status data without BaseCmsResponse fields
   * @throws BrokerError if the request fails
   */
  @HandleBrokerErrors()
  async getBrokerStatus(
    userId: string,
    hostUid: string,
    bname: string
  ): Promise<GetBrokerStatusClientResponse> {
    const cmsRequest: GetBrokerStatusCmsRequest = {
      task: 'getbrokerstatus',
      bname: bname,
    };

    const response = await this.executeCmsRequest<
      GetBrokerStatusCmsRequest,
      GetBrokerStatusCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      return this.extractDomainData(response);
    }

    throw BrokerError.GetBrokersFailed({ response });
  }

  @HandleBrokerErrors()
  async stopAllBrokers(
    userId: string,
    hostUid: string
  ): Promise<StopAllBrokersClientResponse> {
    const cmsRequest: StopAllBrokersCmsRequest = {
      task: 'stopbroker',
    };
    const response = await this.executeCmsRequest<
      StopAllBrokersCmsRequest,
      StopAllBrokersCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      return { success: true };
    }

    throw BrokerError.BrokerStopFailed();
  }

  @HandleBrokerErrors()
  async startAllBrokers(
    userId: string,
    hostUid: string
  ): Promise<StartAllBrokersClientResponse> {
    const cmsRequest: StartBrokerCmsRequest = {
      task: 'startbroker',
    };
    const response = await this.executeCmsRequest<
      StartBrokerCmsRequest,
      StartBrokerCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      return { success: true };
    }

    throw BrokerError.BrokerStartFailed();
  }
}
