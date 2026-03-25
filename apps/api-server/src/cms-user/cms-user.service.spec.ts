import { Test, TestingModule } from '@nestjs/testing';
import { CmsUserService } from './cms-user.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { CmsUserError } from '@error/cms-user/cms-user-error';
import * as common from '@common';

jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('CmsUserService', () => {
  let service: CmsUserService;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsUserService,
        { provide: HostService, useValue: mockHostService },
        { provide: CmsHttpsClientService, useValue: mockCmsClient },
      ],
    }).compile();

    service = module.get(CmsUserService);
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

  describe('addDbmtUser', () => {
    const mockRequest = {
      targetid: 'create_test',
      password: '1234',
      casauth: 'none',
      dbcreate: 'none',
      statusmonitorauth: 'none',
    };

    it('should send adddbmtuser and return dblist and userlist', async () => {
      const mockResponse = {
        __EXEC_TIME: '2 ms',
        note: 'none',
        status: 'success',
        task: 'adddbmtuser',
        dblist: [
          { dbs: [{ dbname: 'test2' }, { dbname: 'test' }, { dbname: 'demodb' }] },
          { dbs: [{ dbname: 'test2' }, { dbname: 'test' }, { dbname: 'demodb' }] },
        ],
        userlist: [
          { user: [{ '@id': 'create_test', casauth: 'none', dbauth: null, dbcreate: 'none', statusmonitorauth: 'none' }] },
          { user: [{ '@id': 'create_test', casauth: 'none', dbauth: null, dbcreate: 'none', statusmonitorauth: 'none' }] },
        ],
      };
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.addDbmtUser(mockUserId, mockHostUid, mockRequest);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'adddbmtuser',
          targetid: mockRequest.targetid,
          password: mockRequest.password,
          casauth: mockRequest.casauth,
          dbcreate: mockRequest.dbcreate,
          statusmonitorauth: mockRequest.statusmonitorauth,
        })
      );
      expect(result).toEqual({ dblist: mockResponse.dblist, userlist: mockResponse.userlist });
    });

    it('should throw CmsUserError when status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'fail',
        status: 'fail',
        task: 'adddbmtuser',
      });

      await expect(
        service.addDbmtUser(mockUserId, mockHostUid, mockRequest)
      ).rejects.toThrow(CmsUserError);
    });
  });

  describe('getDbmtUserInfo', () => {
    it('should send getdbmtuserinfo and return dblist and userlist', async () => {
      const mockResponse = {
        __EXEC_TIME: '0 ms',
        note: 'none',
        status: 'success',
        task: 'getdbmtuserinfo',
        dblist: [{ dbs: [{ dbname: 'demodb' }] }],
        userlist: [{ user: [{ '@id': 'admin' }] }],
      };
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.getDbmtUserInfo(mockUserId, mockHostUid);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ task: 'getdbmtuserinfo' })
      );
      expect(result).toEqual({ dblist: mockResponse.dblist, userlist: mockResponse.userlist });
    });

    it('should throw CmsUserError when status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'fail',
        status: 'fail',
        task: 'getdbmtuserinfo',
      });

      await expect(service.getDbmtUserInfo(mockUserId, mockHostUid)).rejects.toThrow(
        CmsUserError
      );
    });
  });

  describe('updateDbmtUser', () => {
    const request = {
      targetid: 'test_target',
      dbauth: [] as unknown[],
      casauth: 'none',
      dbcreate: 'none',
      statusmonitorauth: 'none',
    };

    it('should send updatedbmtuser and return dblist and userlist', async () => {
      const mockResponse = {
        __EXEC_TIME: '0 ms',
        note: 'none',
        status: 'success',
        task: 'updatedbmtuser',
        dblist: [{ dbs: [] }],
        userlist: [{ user: [] }],
      };
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.updateDbmtUser(mockUserId, mockHostUid, request);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'updatedbmtuser',
          targetid: 'test_target',
          dbauth: [],
          casauth: 'none',
          dbcreate: 'none',
          statusmonitorauth: 'none',
        })
      );
      expect(result).toEqual({ dblist: mockResponse.dblist, userlist: mockResponse.userlist });
    });

    it('should throw CmsUserError when status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'fail',
        status: 'fail',
        task: 'updatedbmtuser',
      });

      await expect(
        service.updateDbmtUser(mockUserId, mockHostUid, request)
      ).rejects.toThrow(CmsUserError);
    });
  });

  describe('deleteDbmtUser', () => {
    it('should send deletedbmtuser and return dblist and userlist', async () => {
      const mockResponse = {
        __EXEC_TIME: '1 ms',
        note: 'none',
        status: 'success',
        task: 'deletedbmtuser',
        dblist: [{ dbs: [] }],
        userlist: [{ user: [] }],
      };
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.deleteDbmtUser(mockUserId, mockHostUid, 'test_user_2');

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ task: 'deletedbmtuser', targetid: 'test_user_2' })
      );
      expect(result).toEqual({ dblist: mockResponse.dblist, userlist: mockResponse.userlist });
    });

    it('should throw CmsUserError when status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'fail',
        status: 'fail',
        task: 'deletedbmtuser',
      });

      await expect(
        service.deleteDbmtUser(mockUserId, mockHostUid, 'test_user_2')
      ).rejects.toThrow(CmsUserError);
    });
  });

  describe('setDbmtPasswd', () => {
    it('should send setdbmtpasswd and return { success: true }', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '72 ms',
        note: 'none',
        status: 'success',
        task: 'setdbmtpasswd',
      });

      const result = await service.setDbmtPasswd(
        mockUserId,
        mockHostUid,
        'yifan',
        '1111'
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'setdbmtpasswd',
          targetid: 'yifan',
          newpassword: '1111',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw CmsUserError when status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'fail',
        status: 'fail',
        task: 'setdbmtpasswd',
      });

      await expect(
        service.setDbmtPasswd(mockUserId, mockHostUid, 'yifan', '1111')
      ).rejects.toThrow(CmsUserError);
    });
  });
});
