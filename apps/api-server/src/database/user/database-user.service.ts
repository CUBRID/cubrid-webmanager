import {
  CreateDbUserResponse,
  DeleteDbUserResponse,
  UpdateDbUserResponse,
} from '@api-interfaces';
import {
  BaseService,
  HandleCmsHttpsClientErrors,
  HandleDatabaseErrors,
  HandleHostErrors,
} from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '@repository';
import { DBAuthResolver } from '@util/db-auth-resolver';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseCmsResponse } from '@type';
import {
  LoginDBCmsRequest,
  UpdateUserCmsRequest,
  UserInfoCmsRequest,
  CreateUserCmsRequest,
  DeleteUserCmsRequest,
  UserVerifyCmsRequest,
} from '@type/cms-request';
import {
  UpdateUserCmsResponse,
  UserInfoCmsResponse,
  CreateUserCmsResponse,
  DeleteUserCmsResponse,
  UserVerifyCmsResponse,
} from '@type/cms-response';

/**
 * Service for managing database users.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseUserService extends BaseService {
  constructor(
    private readonly repository: UserRepositoryService,
    protected readonly cmsClient: CmsHttpsClientService,
    protected readonly hostService: HostService
  ) {
    super(hostService, cmsClient);
  }

  /**
   * Get list of database users for a specific host.
   *
   * @param userId User ID from JWT
   * @returns Database users list
   */
  async getDatabaseUsers(userId: string) {
    return [];
  }

  /**
   * Login to a database using profile or client-provided credentials.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param clientId Client-provided DB user ID (required if profile doesn't exist)
   * @param clientPassword Client-provided DB password (required if profile doesn't exist)
   * @returns true on success
   * @throws DatabaseError If CMS status is fail or profile doesn't exist and credentials are not provided
   */
  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
  @HandleDatabaseErrors()
  async loginDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    clientId?: string,
    clientPassword?: string
  ): Promise<boolean> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const dbAuth = DBAuthResolver.resolve(host, dbname, clientId, clientPassword);

    const cmsRequest: LoginDBCmsRequest = {
      task: 'dbmtuserlogin',
      targetid: host.id,
      dbname: dbAuth.dbname,
      dbuser: dbAuth.id,
      dbpasswd: dbAuth.password,
    };

    const response = await this.executeCmsRequest<LoginDBCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status === 'success') {
      return true;
    }

    throw DatabaseError.LoginDatabaseFailed({ response, dbname });
  }

  /**
   * Update a database user.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param username Username to update
   * @param userpass User password
   * @param groups Groups object containing group array
   * @param authorization Authorization array
   * @returns Empty object on success
   * @throws DatabaseError If CMS status is fail
   */
  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
  @HandleDatabaseErrors()
  async updateUser(
    userId: string,
    hostUid: string,
    dbname: string,
    username: string,
    userpass: string,
    groups: { group: string[] },
    authorization: string[]
  ): Promise<UpdateDbUserResponse> {
    const cmsRequest: UpdateUserCmsRequest = {
      task: 'updateuser',
      dbname,
      username,
      userpass,
      groups,
      authorization,
    };

    const response = await this.executeCmsRequest<
      UpdateUserCmsRequest,
      UpdateUserCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw DatabaseError.InternalError({ response, dbname, username });
    }

    return { success: true };
  }

  /**
   * Get user info (list of users) for a database. CMS task: userinfo.
   */
  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
  @HandleDatabaseErrors()
  async getUserInfo(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<{ dbname: string; user: Array<Record<string, unknown>> }> {
    const cmsRequest: UserInfoCmsRequest = { task: 'userinfo', dbname };

    const response = await this.executeCmsRequest<
      UserInfoCmsRequest,
      UserInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw DatabaseError.GetUserInfoFailed({ response, dbname });
    }

    return {
      dbname: response.dbname ?? dbname,
      user: response.user ?? [],
    };
  }

  /**
   * Create a database user. CMS task: createuser.
   */
  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
  @HandleDatabaseErrors()
  async createUser(
    userId: string,
    hostUid: string,
    dbname: string,
    username: string,
    userpass: string,
    groups: { group: string[] },
    authorization: unknown[]
  ): Promise<CreateDbUserResponse> {
    const cmsRequest: CreateUserCmsRequest = {
      task: 'createuser',
      dbname,
      username,
      userpass,
      groups,
      authorization,
    };

    const response = await this.executeCmsRequest<
      CreateUserCmsRequest,
      CreateUserCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw DatabaseError.CreateUserFailed({ response, dbname, username });
    }

    return { success: true };
  }

  /**
   * Delete a database user. CMS task: deleteuser.
   */
  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
  @HandleDatabaseErrors()
  async deleteUser(
    userId: string,
    hostUid: string,
    dbname: string,
    username: string
  ): Promise<DeleteDbUserResponse> {
    const cmsRequest: DeleteUserCmsRequest = {
      task: 'deleteuser',
      dbname,
      username,
    };

    const response = await this.executeCmsRequest<
      DeleteUserCmsRequest,
      DeleteUserCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw DatabaseError.DeleteUserFailed({ response, dbname, username });
    }

    return { success: true };
  }

  /**
   * Verify database user credentials. CMS task: userverify.
   */
  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
  @HandleDatabaseErrors()
  async userVerify(
    userId: string,
    hostUid: string,
    dbname: string,
    dbuser: string,
    dbpasswd: string
  ): Promise<{ verified: boolean }> {
    const cmsRequest: UserVerifyCmsRequest = {
      task: 'userverify',
      dbname,
      dbuser,
      dbpasswd,
    };

    const response = await this.executeCmsRequest<
      UserVerifyCmsRequest,
      UserVerifyCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status !== 'success') {
      throw DatabaseError.UserVerifyFailed({ response, dbname, dbuser });
    }

    return { verified: true };
  }
}
