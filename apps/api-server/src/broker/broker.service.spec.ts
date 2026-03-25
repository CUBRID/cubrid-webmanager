import { Test, TestingModule } from '@nestjs/testing';
import { BrokerService } from './broker.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BrokerError } from '@error/broker/broker-error';
import * as common from '@common';

jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('BrokerService', () => {
  let service: BrokerService;
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
        BrokerService,
        { provide: HostService, useValue: mockHostService },
        { provide: CmsHttpsClientService, useValue: mockCmsClient },
      ],
    }).compile();

    service = module.get(BrokerService);
    hostService = module.get(HostService);
    cmsClient = module.get(CmsHttpsClientService);

    hostService.findHostInternal.mockResolvedValue(mockHost);
    (common.checkCmsTokenError as jest.Mock).mockImplementation(() => {});
    (common.checkCmsStatusError as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startAllBrokers', () => {
    it('should send startbroker task and return { success: true }', async () => {
      const mockResponse = {
        __EXEC_TIME: '72 ms',
        note: 'none',
        status: 'success',
        task: 'startbroker',
      };
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.startAllBrokers(mockUserId, mockHostUid);

      expect(hostService.findHostInternal).toHaveBeenCalledWith(
        mockUserId,
        mockHostUid
      );
      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        expect.objectContaining({
          task: 'startbroker',
          token: mockHost.token,
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw BrokerError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'startbroker',
      });

      await expect(
        service.startAllBrokers(mockUserId, mockHostUid)
      ).rejects.toThrow(BrokerError);
    });
  });

  describe('stopAllBrokers', () => {
    it('should send stopbroker task and return { success: true }', async () => {
      const mockResponse = {
        __EXEC_TIME: '72 ms',
        note: 'none',
        status: 'success',
        task: 'stopbroker',
      };
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.stopAllBrokers(mockUserId, mockHostUid);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'stopbroker',
          token: mockHost.token,
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw BrokerError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'stopbroker',
      });

      await expect(
        service.stopAllBrokers(mockUserId, mockHostUid)
      ).rejects.toThrow(BrokerError);
    });
  });

  describe('addDbmtUser', () => {
    const mockRequest = {
      targetid: 'test_user_2',
      password: '1234',
      casauth: 'none',
      dbcreate: 'none',
      statusmonitorauth: 'none',
    };

    it('should send adddbmtuser task and return dblist and userlist', async () => {
      const mockResponse = {
        __EXEC_TIME: '1 ms',
        note: 'none',
        status: 'success',
        task: 'adddbmtuser',
        dblist: [{ dbs: [{ dbname: 'test' }] }],
        userlist: [{ user: [{ '@id': 'test_user_2' }] }],
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
      expect(result).toEqual({
        dblist: mockResponse.dblist,
        userlist: mockResponse.userlist,
      });
    });

    it('should throw BrokerError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'adddbmtuser',
      });

      await expect(
        service.addDbmtUser(mockUserId, mockHostUid, mockRequest)
      ).rejects.toThrow(BrokerError);
    });
  });

  describe('updateDbmtUser', () => {
    const mockRequest = {
      targetid: 'test_user_2',
      dbauth: [] as unknown[],
      casauth: 'none',
      dbcreate: 'none',
      statusmonitorauth: 'none',
    };

    it('should send updatedbmtuser task and return dblist and userlist', async () => {
      const mockResponse = {
        __EXEC_TIME: '0 ms',
        note: 'none',
        status: 'success',
        task: 'updatedbmtuser',
        dblist: [{ dbs: [{ dbname: 'test' }] }],
        userlist: [{ user: [{ '@id': 'test_user_2' }] }],
      };
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.updateDbmtUser(mockUserId, mockHostUid, mockRequest);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'updatedbmtuser',
          targetid: mockRequest.targetid,
          dbauth: mockRequest.dbauth,
          casauth: mockRequest.casauth,
          dbcreate: mockRequest.dbcreate,
          statusmonitorauth: mockRequest.statusmonitorauth,
        })
      );
      expect(result).toEqual({
        dblist: mockResponse.dblist,
        userlist: mockResponse.userlist,
      });
    });

    it('should throw BrokerError when CMS status is not success', async () => {
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'failed',
        status: 'fail',
        task: 'updatedbmtuser',
      });

      await expect(
        service.updateDbmtUser(mockUserId, mockHostUid, mockRequest)
      ).rejects.toThrow(BrokerError);
    });
  });
});
