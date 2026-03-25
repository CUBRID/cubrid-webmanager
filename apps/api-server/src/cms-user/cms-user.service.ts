import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleCmsUserErrors } from '@common';
import { CmsUserError } from '@error/cms-user/cms-user-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import {
  AddDbmtUserClientResponse,
  AddDbmtUserRequest,
  DeleteDbmtUserClientResponse,
  GetDbmtUserInfoClientResponse,
  SetDbmtPasswdClientResponse,
  UpdateDbmtUserClientResponse,
  UpdateDbmtUserRequest,
} from '@api-interfaces';
import {
  AddDbmtUserCmsRequest,
  DeleteDbmtUserCmsRequest,
  GetDbmtUserInfoCmsRequest,
  SetDbmtPasswdCmsRequest,
  UpdateDbmtUserCmsRequest,
} from '@type/cms-request';
import {
  AddDbmtUserCmsResponse,
  DeleteDbmtUserCmsResponse,
  GetDbmtUserInfoCmsResponse,
  SetDbmtPasswdCmsResponse,
  UpdateDbmtUserCmsResponse,
} from '@type/cms-response';

/**
 * Service for CMS (DBMT) user operations: get list, update, delete, set password.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class CmsUserService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService
  ) {
    super(hostService, cmsClient);
  }

  /**
   * Add a DBMT (CMS) user on the host.
   * CMS task: adddbmtuser.
   * Request: task, token, targetid, password, casauth, dbcreate, statusmonitorauth.
   * Response: __EXEC_TIME, dblist, note, status, task, userlist.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request targetid, password, casauth, dbcreate, statusmonitorauth
   * @returns AddDbmtUserClientResponse dblist and userlist
   */
  @HandleCmsUserErrors()
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
      throw CmsUserError.AddDbmtUserFailed({ response });
    }

    return {
      dblist: response.dblist ?? [],
      userlist: response.userlist ?? [],
    };
  }

  /**
   * Get DBMT user info (dblist, userlist). CMS task: getdbmtuserinfo.
   */
  @HandleCmsUserErrors()
  async getDbmtUserInfo(
    userId: string,
    hostUid: string
  ): Promise<GetDbmtUserInfoClientResponse> {
    const cmsRequest: GetDbmtUserInfoCmsRequest = { task: 'getdbmtuserinfo' };
    const response = await this.executeCmsRequest<
      GetDbmtUserInfoCmsRequest,
      GetDbmtUserInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw CmsUserError.GetDbmtUserInfoFailed({ response });
    }

    return {
      dblist: response.dblist ?? [],
      userlist: response.userlist ?? [],
    };
  }

  /**
   * Update DBMT user. CMS task: updatedbmtuser.
   */
  @HandleCmsUserErrors()
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
      throw CmsUserError.UpdateDbmtUserFailed({ response });
    }

    return {
      dblist: response.dblist ?? [],
      userlist: response.userlist ?? [],
    };
  }

  /**
   * Delete DBMT user. CMS task: deletedbmtuser.
   */
  @HandleCmsUserErrors()
  async deleteDbmtUser(
    userId: string,
    hostUid: string,
    targetid: string
  ): Promise<DeleteDbmtUserClientResponse> {
    const cmsRequest: DeleteDbmtUserCmsRequest = {
      task: 'deletedbmtuser',
      targetid,
    };

    const response = await this.executeCmsRequest<
      DeleteDbmtUserCmsRequest,
      DeleteDbmtUserCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw CmsUserError.DeleteDbmtUserFailed({ response, targetid });
    }

    return {
      dblist: response.dblist ?? [],
      userlist: response.userlist ?? [],
    };
  }

  /**
   * Set DBMT user password. CMS task: setdbmtpasswd.
   */
  @HandleCmsUserErrors()
  async setDbmtPasswd(
    userId: string,
    hostUid: string,
    targetid: string,
    newpassword: string
  ): Promise<SetDbmtPasswdClientResponse> {
    const cmsRequest: SetDbmtPasswdCmsRequest = {
      task: 'setdbmtpasswd',
      targetid,
      newpassword,
    };

    const response = await this.executeCmsRequest<
      SetDbmtPasswdCmsRequest,
      SetDbmtPasswdCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw CmsUserError.SetDbmtPasswdFailed({ response, targetid });
    }

    return { success: true };
  }
}
