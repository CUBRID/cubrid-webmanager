import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConfigService } from './database-config.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { DatabaseError } from '@error/database/database-error';
import { HostError } from '@error/index';
import { CmsError } from '@error/cms/cms-error';
import * as common from '@common';

// Mock the checkCmsTokenError and checkCmsStatusError functions
jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('DatabaseConfigService', () => {
  let service: DatabaseConfigService;
  let hostService: jest.Mocked<HostService>;
  let cmsClient: jest.Mocked<CmsHttpsClientService>;
  let cmsConfigService: jest.Mocked<CmsConfigService>;

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
  const mockDbname = 'testdb';

  beforeEach(async () => {
    const mockHostService = {
      findHostInternal: jest.fn(),
    };

    const mockCmsClient = {
      postAuthenticated: jest.fn(),
    };

    const mockCmsConfigService = {
      getAllSystemParam: jest.fn(),
      setSystemParam: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseConfigService,
        {
          provide: HostService,
          useValue: mockHostService,
        },
        {
          provide: CmsHttpsClientService,
          useValue: mockCmsClient,
        },
        {
          provide: CmsConfigService,
          useValue: mockCmsConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseConfigService>(DatabaseConfigService);
    hostService = module.get(HostService);
    cmsClient = module.get(CmsHttpsClientService);
    cmsConfigService = module.get(CmsConfigService);

    // Setup default mocks
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

  describe('setAutoExecQuery', () => {
    const mockRequest = {
      dbname: mockDbname,
      planlist: [
        {
          queryplan: [],
        },
      ],
    };

    const mockResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'setautoexecquery',
    };

    it('should successfully set auto exec query', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.setAutoExecQuery(
        mockUserId,
        mockHostUid,
        mockDbname,
        mockRequest
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'setautoexecquery',
          dbname: mockDbname,
          planlist: mockRequest.planlist,
        })
      );
      expect(result).toEqual({});
    });
  });

  describe('getAutoExecQuery', () => {
    const mockResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'getautoexecquery',
      planlist: [],
    };

    it('should successfully get auto exec query', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.getAutoExecQuery(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'getautoexecquery',
          dbname: mockDbname,
        })
      );
      expect(result).toEqual({ planlist: [] });
    });
  });

  describe('getClassInfo', () => {
    const mockRequest = {
      dbstatus: 'off' as const,
    };

    const mockResponse = {
      __EXEC_TIME: '2510 ms',
      dbname: 'empty',
      note: 'none',
      status: 'success',
      task: 'classinfo',
      systemclass: [
        {
          class: [
            {
              classname: 'db_root',
              owner: 'DBA',
              virtual: 'normal',
            },
            {
              classname: 'db_user',
              owner: 'DBA',
              virtual: 'normal',
            },
          ],
        },
      ],
      userclass: [
        {
          class: [
            {
              classname: 'dba.test',
              owner: 'DBA',
              virtual: 'normal',
            },
            {
              classname: 'dba.test2',
              owner: 'DBA',
              virtual: 'normal',
            },
          ],
        },
      ],
    };

    it('should successfully get class info', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.getClassInfo(
        mockUserId,
        mockHostUid,
        mockDbname,
        mockRequest
      );

      expect(hostService.findHostInternal).toHaveBeenCalledWith(mockUserId, mockHostUid);
      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        expect.objectContaining({
          task: 'classinfo',
          token: mockHost.token,
          dbname: mockDbname,
          dbstatus: 'off',
        })
      );
      expect(common.checkCmsTokenError).toHaveBeenCalledWith(mockResponse);
      expect(common.checkCmsStatusError).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual({
        dbname: 'empty',
        systemclass: mockResponse.systemclass,
        userclass: mockResponse.userclass,
      });
    });

    it('should successfully get class info with dbstatus on', async () => {
      const requestWithOn = {
        dbstatus: 'on' as const,
      };

      cmsClient.postAuthenticated.mockResolvedValue(mockResponse);

      const result = await service.getClassInfo(
        mockUserId,
        mockHostUid,
        mockDbname,
        requestWithOn
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'classinfo',
          dbname: mockDbname,
          dbstatus: 'on',
        })
      );
      expect(result).toEqual({
        dbname: 'empty',
        systemclass: mockResponse.systemclass,
        userclass: mockResponse.userclass,
      });
    });

    it('should throw HostError when host is not found', async () => {
      hostService.findHostInternal.mockRejectedValue(
        HostError.NoSuchHost({ hostUid: mockHostUid })
      );

      await expect(
        service.getClassInfo(mockUserId, mockHostUid, mockDbname, mockRequest)
      ).rejects.toThrow(HostError);

      expect(cmsClient.postAuthenticated).not.toHaveBeenCalled();
    });

    it('should throw CmsError when CMS request fails', async () => {
      const cmsError = CmsError.RequestFailed({
        status: 500,
        data: { message: 'Internal server error' },
      });

      cmsClient.postAuthenticated.mockRejectedValue(cmsError);

      await expect(
        service.getClassInfo(mockUserId, mockHostUid, mockDbname, mockRequest)
      ).rejects.toThrow(CmsError);
    });

    it('should throw DatabaseError when CMS token error is detected', async () => {
      const invalidTokenResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Invalid token',
        status: 'failed',
        task: 'classinfo',
      };

      cmsClient.postAuthenticated.mockResolvedValue(invalidTokenResponse);
      (common.checkCmsTokenError as jest.Mock).mockImplementation(() => {
        throw DatabaseError.InvalidParameter('Invalid CMS token');
      });

      await expect(
        service.getClassInfo(mockUserId, mockHostUid, mockDbname, mockRequest)
      ).rejects.toThrow(DatabaseError);
    });

    it('should throw DatabaseError when CMS status error is detected', async () => {
      const failedResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Class info failed',
        status: 'failed',
        task: 'classinfo',
      };

      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);
      (common.checkCmsStatusError as jest.Mock).mockImplementation(() => {
        throw DatabaseError.InvalidParameter('CMS status failed');
      });

      await expect(
        service.getClassInfo(mockUserId, mockHostUid, mockDbname, mockRequest)
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAutoExecQueryErrLog', () => {
    const mockRequest = {};

    it('should successfully get auto exec query error log with errors', async () => {
      const mockSuccessResponse = {
        __EXEC_TIME: '0 ms',
        note: 'none',
        status: 'success',
        task: 'getautoexecqueryerrlog',
        error: [
          {
            '@username': 'admin',
            dbname: 'demodb',
            error_code: '0',
            error_desc: 'start',
            error_time: '2026/01/24 15:10:00',
            query_id: 'test_query',
          },
          {
            '@username': 'admin',
            dbname: 'demodb',
            error_code: '0',
            error_desc: 'success',
            error_time: '2026/01/24 15:10:00',
            query_id: 'test_query',
          },
        ],
      };

      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);

      const result = await service.getAutoExecQueryErrLog(
        mockUserId,
        mockHostUid,
        mockRequest
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'getautoexecqueryerrlog',
          token: mockHost.token,
        })
      );
      expect(result).toEqual({
        error: [
          {
            '@username': 'admin',
            dbname: 'demodb',
            error_code: '0',
            error_desc: 'start',
            error_time: '2026/01/24 15:10:00',
            query_id: 'test_query',
          },
          {
            '@username': 'admin',
            dbname: 'demodb',
            error_code: '0',
            error_desc: 'success',
            error_time: '2026/01/24 15:10:00',
            query_id: 'test_query',
          },
        ],
      });
    });

    it('should successfully get auto exec query error log with null error', async () => {
      const mockSuccessResponse = {
        __EXEC_TIME: '0 ms',
        note: 'none',
        status: 'success',
        task: 'getautoexecqueryerrlog',
        error: null,
      };

      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);

      const result = await service.getAutoExecQueryErrLog(
        mockUserId,
        mockHostUid,
        mockRequest
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'getautoexecqueryerrlog',
          token: mockHost.token,
        })
      );
      expect(result).toEqual({
        error: null,
      });
    });

    it('should throw HostError if host is not found', async () => {
      hostService.findHostInternal.mockRejectedValue(
        HostError.NoSuchHost({ hostUid: mockHostUid })
      );

      await expect(
        service.getAutoExecQueryErrLog(mockUserId, mockHostUid, mockRequest)
      ).rejects.toThrow(HostError);
    });

    it('should throw DatabaseError if CMS token error', async () => {
      const tokenErrorResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Invalid token',
        status: 'error',
        task: 'getautoexecqueryerrlog',
      };

      cmsClient.postAuthenticated.mockResolvedValue(tokenErrorResponse);
      (common.checkCmsTokenError as jest.Mock).mockImplementation(() => {
        throw DatabaseError.InvalidParameter('Invalid CMS token');
      });

      await expect(
        service.getAutoExecQueryErrLog(mockUserId, mockHostUid, mockRequest)
      ).rejects.toThrow(DatabaseError);
    });

    it('should throw DatabaseError if CMS status is fail', async () => {
      const failedResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Error log retrieval failed',
        status: 'failed',
        task: 'getautoexecqueryerrlog',
      };

      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);
      (common.checkCmsStatusError as jest.Mock).mockImplementation(() => {
        throw DatabaseError.InvalidParameter('CMS status failed');
      });

      await expect(
        service.getAutoExecQueryErrLog(mockUserId, mockHostUid, mockRequest)
      ).rejects.toThrow(DatabaseError);
    });
  });
});
