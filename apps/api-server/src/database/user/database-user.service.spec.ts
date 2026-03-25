import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseUserService } from './database-user.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { UserRepositoryService } from '@repository';
import { DatabaseError } from '@error/database/database-error';
import * as common from '@common';

jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('DatabaseUserService', () => {
  let service: DatabaseUserService;
  let hostService: jest.Mocked<HostService>;
  let cmsClient: jest.Mocked<CmsHttpsClientService>;

  const mockHost = {
    uid: 'host-uid-1',
    id: 'host-1',
    address: 'localhost',
    port: 8001,
    password: 'host-password',
    token: 'test-token',
    dbProfiles: {},
  };

  const mockUserId = 'user-123';
  const mockHostUid = 'host-uid-1';

  beforeEach(async () => {
    const mockHostService = { findHostInternal: jest.fn() };
    const mockCmsClient = { postAuthenticated: jest.fn() };
    const mockRepository = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseUserService,
        { provide: HostService, useValue: mockHostService },
        { provide: CmsHttpsClientService, useValue: mockCmsClient },
        { provide: UserRepositoryService, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(DatabaseUserService);
    hostService = module.get(HostService);
    cmsClient = module.get(CmsHttpsClientService);

    hostService.findHostInternal.mockResolvedValue(mockHost as any);
    (common.checkCmsTokenError as jest.Mock).mockImplementation(() => {});
    (common.checkCmsStatusError as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDatabaseUsers', () => {
    it('should return empty array', async () => {
      const result = await service.getDatabaseUsers(mockUserId);
      expect(result).toEqual([]);
    });
  });

  describe('getUserInfo', () => {
    it('should send userinfo task and return dbname and user list', async () => {
      const mockResponse = {
        __EXEC_TIME: '359 ms',
        dbname: 'demodb',
        note: 'none',
        status: 'success',
        task: 'userinfo',
        user: [{ '@id': '163810704', '@name': 'PUBLIC' }],
      };
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.getUserInfo(mockUserId, mockHostUid, 'demodb');

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ task: 'userinfo', dbname: 'demodb' })
      );
      expect(result).toEqual({
        dbname: 'demodb',
        user: mockResponse.user,
      });
    });

    it('should throw DatabaseError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'userinfo',
      });

      await expect(
        service.getUserInfo(mockUserId, mockHostUid, 'demodb')
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('createUser', () => {
    const createParams = {
      dbname: 'demodb',
      username: 'yifan',
      userpass: '1111',
      groups: { group: ['public'] as string[] },
      authorization: [] as unknown[],
    };

    it('should send createuser task and return empty object', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '647 ms',
        note: 'none',
        status: 'success',
        task: 'createuser',
      });

      const result = await service.createUser(
        mockUserId,
        mockHostUid,
        createParams.dbname,
        createParams.username,
        createParams.userpass,
        createParams.groups,
        createParams.authorization
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'createuser',
          dbname: 'demodb',
          username: 'yifan',
          userpass: '1111',
          groups: { group: ['public'] },
          authorization: [],
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw DatabaseError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'createuser',
      });

      await expect(
        service.createUser(
          mockUserId,
          mockHostUid,
          createParams.dbname,
          createParams.username,
          createParams.userpass,
          createParams.groups,
          createParams.authorization
        )
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteUser', () => {
    it('should send deleteuser task and return empty object', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '148 ms',
        note: 'none',
        status: 'success',
        task: 'deleteuser',
      });

      const result = await service.deleteUser(
        mockUserId,
        mockHostUid,
        'demodb',
        'yifan'
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'deleteuser',
          dbname: 'demodb',
          username: 'yifan',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw DatabaseError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'deleteuser',
      });

      await expect(
        service.deleteUser(mockUserId, mockHostUid, 'demodb', 'yifan')
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('updateUser', () => {
    const updateParams = {
      userpass: '1111',
      groups: { group: ['public'] as string[] },
      authorization: [] as string[],
    };

    it('should send updateuser task and return empty object', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '148 ms',
        note: 'none',
        status: 'success',
        task: 'updateuser',
      });

      const result = await service.updateUser(
        mockUserId,
        mockHostUid,
        'demodb',
        'yifan',
        updateParams.userpass,
        updateParams.groups,
        updateParams.authorization
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'updateuser',
          dbname: 'demodb',
          username: 'yifan',
          userpass: '1111',
          groups: { group: ['public'] },
          authorization: [],
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw DatabaseError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'updateuser',
      });

      await expect(
        service.updateUser(
          mockUserId,
          mockHostUid,
          'demodb',
          'yifan',
          updateParams.userpass,
          updateParams.groups,
          updateParams.authorization
        )
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('userVerify', () => {
    it('should send userverify task and return { verified: true }', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '72 ms',
        note: 'none',
        status: 'success',
        task: 'userverify',
      });

      const result = await service.userVerify(
        mockUserId,
        mockHostUid,
        'demodb',
        'dba',
        ''
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'userverify',
          dbname: 'demodb',
          dbuser: 'dba',
          dbpasswd: '',
        })
      );
      expect(result).toEqual({ verified: true });
    });

    it('should throw DatabaseError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'userverify',
      });

      await expect(
        service.userVerify(mockUserId, mockHostUid, 'demodb', 'dba', '')
      ).rejects.toThrow(DatabaseError);
    });
  });
});
