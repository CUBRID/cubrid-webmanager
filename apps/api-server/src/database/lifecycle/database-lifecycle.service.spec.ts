import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseLifecycleService } from './database-lifecycle.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { UserRepositoryService } from '@repository';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { FileService } from '@file/file.service';
import { DatabaseInfoService } from '../info/database-info.service';
import { DatabaseUserService } from '../user/database-user.service';
import { DatabaseConfigService } from '../config/database-config.service';
import { DatabaseError } from '@error/database/database-error';
import { HostError } from '@error/index';
import { CmsError } from '@error/cms/cms-error';
import { CreateDatabaseClientResponse, DeleteDatabaseRequest } from '@api-interfaces';
import { DeleteDatabaseCmsResponse } from '@type/cms-response';
import * as common from '@common';

// Mock the checkCmsTokenError and checkCmsStatusError functions
jest.mock('@common', () => ({
  ...jest.requireActual('@common'),
  checkCmsTokenError: jest.fn(),
  checkCmsStatusError: jest.fn(),
}));

describe('DatabaseLifecycleService', () => {
  let service: DatabaseLifecycleService;
  let hostService: jest.Mocked<HostService>;
  let cmsClient: jest.Mocked<CmsHttpsClientService>;
  let repository: jest.Mocked<UserRepositoryService>;
  let cmsConfigService: jest.Mocked<CmsConfigService>;
  let fileService: jest.Mocked<FileService>;
  let databaseUserService: jest.Mocked<DatabaseUserService>;
  let databaseConfigService: jest.Mocked<DatabaseConfigService>;
  let databaseInfoService: DatabaseInfoService;

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

    const mockRepository = {};

    const mockCmsConfigService = {};

    const mockFileService = {};

    const mockDatabaseUserService = {
      updateUser: jest.fn(),
    };

    const mockDatabaseConfigService = {
      setAutoAddVol: jest.fn(),
      setAutoStart: jest.fn(),
      removeAutoStart: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseLifecycleService,
        DatabaseInfoService,
        {
          provide: HostService,
          useValue: mockHostService,
        },
        {
          provide: CmsHttpsClientService,
          useValue: mockCmsClient,
        },
        {
          provide: UserRepositoryService,
          useValue: mockRepository,
        },
        {
          provide: CmsConfigService,
          useValue: mockCmsConfigService,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
        {
          provide: DatabaseUserService,
          useValue: mockDatabaseUserService,
        },
        {
          provide: DatabaseConfigService,
          useValue: mockDatabaseConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseLifecycleService>(DatabaseLifecycleService);
    hostService = module.get(HostService);
    cmsClient = module.get(CmsHttpsClientService);
    repository = module.get(UserRepositoryService);
    cmsConfigService = module.get(CmsConfigService);
    fileService = module.get(FileService);
    databaseUserService = module.get(DatabaseUserService);
    databaseConfigService = module.get(DatabaseConfigService);
    databaseInfoService = module.get(DatabaseInfoService);

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

  describe('startInfo', () => {
    const mockStartInfoCmsResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'startinfo',
      dblist: [
        {
          dbs: [
            {
              dbname: 'testdb',
              dbdir: '/path/to/testdb',
            },
          ],
        },
      ],
      activelist: [
        {
          active: [{ dbname: 'testdb' }],
        },
      ],
    };

    const mockStartInfoClientResponse = {
      activelist: { active: [{ dbname: 'testdb' }] },
      dblist: {
        dbs: [
          {
            dbname: 'testdb',
            dbdir: '/path/to/testdb',
            isProfileExists: false,
          },
        ],
      },
    };

    it('should return start info with profile existence', async () => {
      const hostWithProfile = {
        ...mockHost,
        dbProfiles: { testdb: { dbname: 'testdb', id: 'dba', password: 'pass' } },
      };
      hostService.findHostInternal.mockResolvedValue(hostWithProfile);
      cmsClient.postAuthenticated.mockResolvedValue(mockStartInfoCmsResponse);

      const result = await service.startInfo(mockUserId, mockHostUid);

      expect(result).toEqual({
        activelist: { active: [{ dbname: 'testdb' }] },
        dblist: {
          dbs: [
            {
              dbname: 'testdb',
              dbdir: '/path/to/testdb',
              isProfileExists: true,
            },
          ],
        },
      });
    });

    it('should return start info without profile', async () => {
      hostService.findHostInternal.mockResolvedValue(mockHost);
      cmsClient.postAuthenticated.mockResolvedValue(mockStartInfoCmsResponse);

      const result = await service.startInfo(mockUserId, mockHostUid);

      expect(result).toEqual(mockStartInfoClientResponse);
    });

    it('should throw DatabaseError when CMS status is fail', async () => {
      const failedResponse = {
        __EXEC_TIME: '0 ms',
        note: 'Failed',
        status: 'fail',
        task: 'startinfo',
      };
      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);

      await expect(service.startInfo(mockUserId, mockHostUid)).rejects.toThrow(DatabaseError);
    });
  });

  describe('startDatabase', () => {
    const mockBaseResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'startdb',
    };

    const mockStartInfoResponse = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    beforeEach(() => {
      jest.spyOn(databaseInfoService, 'startInfo').mockResolvedValue(mockStartInfoResponse as any);
    });

    it('should successfully start database', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockBaseResponse);

      const result = await service.startDatabase(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        expect.objectContaining({
          task: 'startdb',
          token: mockHost.token,
          dbname: mockDbname,
        })
      );
      expect(common.checkCmsTokenError).toHaveBeenCalled();
      expect(result).toEqual(mockStartInfoResponse);
    });

    it('should throw DatabaseError when CMS status is fail', async () => {
      const failedResponse = {
        ...mockBaseResponse,
        status: 'fail',
        note: 'Database start failed',
      };
      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);

      await expect(service.startDatabase(mockUserId, mockHostUid, mockDbname)).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe('stopDatabase', () => {
    const mockBaseResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'stopdb',
    };

    const mockStartInfoResponse = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    beforeEach(() => {
      jest.spyOn(databaseInfoService, 'startInfo').mockResolvedValue(mockStartInfoResponse as any);
    });

    it('should successfully stop database', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockBaseResponse);

      const result = await service.stopDatabase(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        expect.objectContaining({
          task: 'stopdb',
          token: mockHost.token,
          dbname: mockDbname,
        })
      );
      expect(result).toEqual(mockStartInfoResponse);
    });

    it('should throw DatabaseError when CMS status is fail', async () => {
      const failedResponse = {
        ...mockBaseResponse,
        status: 'fail',
        note: 'Database stop failed',
      };
      cmsClient.postAuthenticated.mockResolvedValue(failedResponse);

      await expect(service.stopDatabase(mockUserId, mockHostUid, mockDbname)).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe('restartDatabase', () => {
    const mockBaseResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'stopdb',
    };

    const mockStartResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'startdb',
    };

    const mockStartInfoResponse = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    beforeEach(() => {
      jest.spyOn(databaseInfoService, 'startInfo').mockResolvedValue(mockStartInfoResponse as any);
    });

    it('should successfully restart database', async () => {
      cmsClient.postAuthenticated
        .mockResolvedValueOnce(mockBaseResponse) // stop
        .mockResolvedValueOnce(mockStartResponse); // start

      const result = await service.restartDatabase(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockStartInfoResponse);
    });

    it('should throw DatabaseError when stop fails', async () => {
      const failedResponse = {
        ...mockBaseResponse,
        status: 'fail',
        note: 'Stop failed',
      };
      cmsClient.postAuthenticated.mockResolvedValueOnce(failedResponse);

      await expect(service.restartDatabase(mockUserId, mockHostUid, mockDbname)).rejects.toThrow(
        DatabaseError
      );
    });

    it('should throw DatabaseError when start fails', async () => {
      const failedResponse = {
        ...mockStartResponse,
        status: 'fail',
        note: 'Start failed',
      };
      cmsClient.postAuthenticated
        .mockResolvedValueOnce(mockBaseResponse) // stop succeeds
        .mockResolvedValueOnce(failedResponse); // start fails

      await expect(service.restartDatabase(mockUserId, mockHostUid, mockDbname)).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe('saveDatabaseProfile', () => {
    const mockStartInfoResponse = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    beforeEach(() => {
      jest.spyOn(databaseInfoService, 'startInfo').mockResolvedValue(mockStartInfoResponse as any);
    });

    it('should successfully save database profile', async () => {
      const mockUser = {
        id: mockUserId,
        host_list: {
          [mockHostUid]: mockHost,
        },
      };

      repository.atomicUpdateUser.mockImplementation(async (userId, callback) => {
        return await callback(mockUser as any);
      });

      const result = await service.saveDatabaseProfile(
        mockUserId,
        mockHostUid,
        mockDbname,
        'dba',
        'password'
      );

      expect(repository.atomicUpdateUser).toHaveBeenCalled();
      expect(result).toEqual(mockStartInfoResponse);
    });

    it('should throw ValidationError when credentials are missing', async () => {
      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, '', 'dba', 'password')
      ).rejects.toThrow();

      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, mockDbname, '', 'password')
      ).rejects.toThrow();

      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, mockDbname, 'dba', '')
      ).rejects.toThrow();
    });

    it('should throw DatabaseError when profile already exists', async () => {
      const hostWithProfile = {
        ...mockHost,
        dbProfiles: { [mockDbname]: { dbname: mockDbname, id: 'dba', password: 'pass' } },
      };
      const mockUser = {
        id: mockUserId,
        host_list: {
          [mockHostUid]: hostWithProfile,
        },
      };

      repository.atomicUpdateUser.mockImplementation(async (userId, callback) => {
        return await callback(mockUser as any);
      });

      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, mockDbname, 'dba', 'password')
      ).rejects.toThrow(DatabaseError);
    });

    it('should throw HostError when host is not found', async () => {
      const mockUser = {
        id: mockUserId,
        host_list: {},
      };

      repository.atomicUpdateUser.mockImplementation(async (userId, callback) => {
        return await callback(mockUser as any);
      });

      await expect(
        service.saveDatabaseProfile(mockUserId, mockHostUid, mockDbname, 'dba', 'password')
      ).rejects.toThrow(HostError);
    });
  });

  describe('getDBSpaceInfo', () => {
    const mockDbSpaceInfoResponse = {
      __EXEC_TIME: '10 ms',
      note: 'none',
      status: 'success',
      task: 'dbspaceinfo',
      dbname: 'testdb',
      pagesize: '16384',
      logpagesize: '16384',
      freespace: '1048576',
    };

    it('should successfully get database space info', async () => {
      const mockStartInfoResponse = {
        __EXEC_TIME: '10 ms',
        note: 'none',
        status: 'success',
        task: 'startinfo',
        dblist: [
          {
            dbs: [{ dbname: mockDbname }],
          },
        ],
        activelist: [{ active: [] }],
      };

      cmsClient.postAuthenticated
        .mockResolvedValueOnce(mockStartInfoResponse) // startinfo check
        .mockResolvedValueOnce(mockDbSpaceInfoResponse); // dbspaceinfo

      const result = await service.getDBSpaceInfo(mockUserId, mockHostUid, mockDbname);

      expect(cmsClient.postAuthenticated).toHaveBeenCalledTimes(2);
      expect(common.checkCmsTokenError).toHaveBeenCalled();
      expect(result).toEqual({
        dbname: 'testdb',
        pagesize: '16384',
        logpagesize: '16384',
        freespace: '1048576',
      });
    });
  });

  describe('createDatabase', () => {
    const mockCreateDbRequest = {
      dbname: 'testdb',
      numpage: '1000',
      pagesize: '16384',
      logsize: '100',
      logpagesize: '16384',
      genvolpath: '/path/to/testdb',
      logvolpath: '/path/to/testdb',
      charset: 'ko_KR.utf8',
      overwrite_config_file: 'YES' as const,
    };

    const mockCreateDatabaseResponse: CreateDatabaseClientResponse = {
      success: true,
    };

    const mockStartInfoForCreate = { activelist: { active: [] }, dblist: { dbs: [] } };

    beforeEach(() => {
      jest.spyOn(service, 'createDatabaseInternal').mockResolvedValue(mockCreateDatabaseResponse);
      jest.spyOn(databaseInfoService, 'startInfo').mockResolvedValue(mockStartInfoForCreate as any);
      cmsClient.postAuthenticated.mockResolvedValue({
        __EXEC_TIME: '0 ms',
        note: 'none',
        status: 'success',
        task: 'startdb',
      });
      databaseUserService.updateUser.mockResolvedValue({ success: true });
      databaseConfigService.setAutoAddVol.mockResolvedValue({ success: true });
      databaseConfigService.setAutoStart.mockResolvedValue({ success: true });
    });

    it('should successfully create database without optional configuration', async () => {
      const request = {
        ...mockCreateDbRequest,
      };

      const result = await service.createDatabase(mockUserId, mockHostUid, request);

      expect(service.createDatabaseInternal).toHaveBeenCalledWith(
        mockUserId,
        mockHostUid,
        mockCreateDbRequest
      );
      expect(result).toEqual({
        createDatabase: {
          success: true,
          data: mockCreateDatabaseResponse,
        },
      });
      expect(databaseUserService.updateUser).not.toHaveBeenCalled();
      expect(databaseConfigService.setAutoAddVol).not.toHaveBeenCalled();
      expect(databaseConfigService.setAutoStart).not.toHaveBeenCalled();
    });

    it('should successfully create database with all optional configurations', async () => {
      const request = {
        ...mockCreateDbRequest,
        username: 'dba',
        updateUser: {
          userpass: 'newpassword',
        },
        setAutoAddVol: {
          data: 'ON',
          data_warn_outofspace: '0.15',
          data_ext_page: '32768',
          index: 'ON',
          index_warn_outofspace: '0.15',
          index_ext_page: '32768',
        },
        setAutoStart: true,
      };

      const result = await service.createDatabase(mockUserId, mockHostUid, request);

      expect(service.createDatabaseInternal).toHaveBeenCalledWith(
        mockUserId,
        mockHostUid,
        mockCreateDbRequest
      );
      expect(databaseUserService.updateUser).toHaveBeenCalledWith(
        mockUserId,
        mockHostUid,
        'testdb',
        'dba',
        'newpassword',
        { group: [] },
        []
      );
      expect(databaseConfigService.setAutoAddVol).toHaveBeenCalledWith(
        mockUserId,
        mockHostUid,
        'testdb',
        request.setAutoAddVol
      );
      expect(databaseConfigService.setAutoStart).toHaveBeenCalledWith(mockUserId, mockHostUid, {
        confname: 'cubridconf',
        dbname: 'testdb',
      });
      expect(result).toEqual({
        createDatabase: {
          success: true,
          data: mockCreateDatabaseResponse,
        },
        updateUser: {
          success: true,
          data: {},
        },
        setAutoAddVol: {
          success: true,
          data: {},
        },
        setAutoStart: {
          success: true,
          data: {},
        },
      });
    });

    it('should use default username "dba" when username is not provided', async () => {
      const request = {
        ...mockCreateDbRequest,
        updateUser: {
          userpass: 'newpassword',
        },
      };

      await service.createDatabase(mockUserId, mockHostUid, request);

      expect(databaseUserService.updateUser).toHaveBeenCalledWith(
        mockUserId,
        mockHostUid,
        'testdb',
        'dba',
        'newpassword',
        { group: [] },
        []
      );
    });

    it('should handle createDatabase failure and continue with other operations', async () => {
      const createError = new DatabaseError('Create failed', 'CREATE_FAILED');
      jest.spyOn(service, 'createDatabaseInternal').mockRejectedValue(createError);

      const request = {
        ...mockCreateDbRequest,
        updateUser: {
          userpass: 'newpassword',
        },
        setAutoStart: true,
      };

      const result = await service.createDatabase(mockUserId, mockHostUid, request);

      expect(result.createDatabase).toEqual({
        success: false,
        error: {
          message: 'Create failed',
          code: 'CREATE_FAILED',
          details: undefined,
        },
      });
      // Other operations should still be attempted
      expect(databaseUserService.updateUser).toHaveBeenCalled();
      expect(databaseConfigService.setAutoStart).toHaveBeenCalled();
    });

    it('should handle updateUser failure but continue with other operations', async () => {
      const updateError = new DatabaseError('Update user failed', 'UPDATE_USER_FAILED');
      databaseUserService.updateUser.mockRejectedValue(updateError);

      const request = {
        ...mockCreateDbRequest,
        username: 'dba',
        updateUser: {
          userpass: 'newpassword',
        },
        setAutoAddVol: {
          data: 'ON',
          data_warn_outofspace: '0.15',
          data_ext_page: '32768',
          index: 'ON',
          index_warn_outofspace: '0.15',
          index_ext_page: '32768',
        },
        setAutoStart: true,
      };

      const result = await service.createDatabase(mockUserId, mockHostUid, request);

      expect(result.createDatabase.success).toBe(true);
      expect(result.updateUser).toEqual({
        success: false,
        error: {
          message: 'Update user failed',
          code: 'UPDATE_USER_FAILED',
          details: undefined,
        },
      });
      // Other operations should still succeed
      expect(result.setAutoAddVol?.success).toBe(true);
      expect(result.setAutoStart?.success).toBe(true);
    });

    it('should handle setAutoAddVol failure but continue with other operations', async () => {
      const autoAddVolError = new DatabaseError('Set auto-add vol failed', 'SET_AUTO_ADD_VOL_FAILED');
      databaseConfigService.setAutoAddVol.mockRejectedValue(autoAddVolError);

      const request = {
        ...mockCreateDbRequest,
        updateUser: {
          userpass: 'newpassword',
        },
        setAutoAddVol: {
          data: 'ON',
          data_warn_outofspace: '0.15',
          data_ext_page: '32768',
          index: 'ON',
          index_warn_outofspace: '0.15',
          index_ext_page: '32768',
        },
        setAutoStart: true,
      };

      const result = await service.createDatabase(mockUserId, mockHostUid, request);

      expect(result.createDatabase.success).toBe(true);
      expect(result.updateUser?.success).toBe(true);
      expect(result.setAutoAddVol).toEqual({
        success: false,
        error: {
          message: 'Set auto-add vol failed',
          code: 'SET_AUTO_ADD_VOL_FAILED',
          details: undefined,
        },
      });
      expect(result.setAutoStart?.success).toBe(true);
    });

    it('should handle setAutoStart failure but other operations succeed', async () => {
      const autoStartError = new DatabaseError('Set auto-start failed', 'SET_AUTO_START_FAILED');
      databaseConfigService.setAutoStart.mockRejectedValue(autoStartError);

      const request = {
        ...mockCreateDbRequest,
        updateUser: {
          userpass: 'newpassword',
        },
        setAutoStart: true,
      };

      const result = await service.createDatabase(mockUserId, mockHostUid, request);

      expect(result.createDatabase.success).toBe(true);
      expect(result.updateUser?.success).toBe(true);
      expect(result.setAutoStart).toEqual({
        success: false,
        error: {
          message: 'Set auto-start failed',
          code: 'SET_AUTO_START_FAILED',
          details: undefined,
        },
      });
    });

    it('should handle multiple failures and return all error statuses', async () => {
      const createError = new DatabaseError('Create failed', 'CREATE_FAILED');
      const updateError = new DatabaseError('Update failed', 'UPDATE_FAILED');
      const autoStartError = new DatabaseError('Auto-start failed', 'AUTO_START_FAILED');

      jest.spyOn(service, 'createDatabaseInternal').mockRejectedValue(createError);
      databaseUserService.updateUser.mockRejectedValue(updateError);
      databaseConfigService.setAutoStart.mockRejectedValue(autoStartError);

      const request = {
        ...mockCreateDbRequest,
        updateUser: {
          userpass: 'newpassword',
        },
        setAutoStart: true,
      };

      const result = await service.createDatabase(mockUserId, mockHostUid, request);

      expect(result.createDatabase.success).toBe(false);
      expect(result.updateUser?.success).toBe(false);
      expect(result.setAutoStart?.success).toBe(false);
      expect(result.createDatabase.error?.message).toBe('Create failed');
      expect(result.updateUser?.error?.message).toBe('Update failed');
      expect(result.setAutoStart?.error?.message).toBe('Auto-start failed');
    });
  });

  describe('deleteDatabase', () => {
    const mockSuccessResponse: DeleteDatabaseCmsResponse = {
      __EXEC_TIME: '848 ms',
      note: 'none',
      status: 'success',
      task: 'deletedb',
    };

    const mockStartInfoAfterDelete = {
      activelist: { active: [] },
      dblist: { dbs: [] },
    };

    it('should successfully delete database with delbackup "y" and return start-info', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);
      jest.spyOn(databaseInfoService, 'startInfo').mockResolvedValue(mockStartInfoAfterDelete as any);
      const request: DeleteDatabaseRequest = {
        delbackup: 'y',
      };

      const result = await service.deleteDatabase(
        mockUserId,
        mockHostUid,
        mockDbname,
        request
      );

      expect(hostService.findHostInternal).toHaveBeenCalledWith(mockUserId, mockHostUid);
      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        `https://${mockHost.address}:${mockHost.port}/cm_api`,
        {
          task: 'deletedb',
          token: mockHost.token,
          dbname: mockDbname,
          delbackup: 'y',
        }
      );
      expect(result).toEqual(mockStartInfoAfterDelete);
    });

    it('should successfully delete database with delbackup "n" and return start-info', async () => {
      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);
      jest.spyOn(databaseInfoService, 'startInfo').mockResolvedValue(mockStartInfoAfterDelete as any);
      const request: DeleteDatabaseRequest = {
        delbackup: 'n',
      };

      const result = await service.deleteDatabase(
        mockUserId,
        mockHostUid,
        mockDbname,
        request
      );

      expect(cmsClient.postAuthenticated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          task: 'deletedb',
          delbackup: 'n',
        })
      );
      expect(result).toEqual(mockStartInfoAfterDelete);
    });

    it('should throw HostError if host is not found', async () => {
      hostService.findHostInternal.mockRejectedValue(
        HostError.NoSuchHost({ hostUid: mockHostUid })
      );
      const request: DeleteDatabaseRequest = {
        delbackup: 'y',
      };

      await expect(
        service.deleteDatabase(mockUserId, mockHostUid, mockDbname, request)
      ).rejects.toThrow(HostError);
    });

    it('should throw CmsError if CMS request fails', async () => {
      cmsClient.postAuthenticated.mockRejectedValue(
        CmsError.RequestFailed({ message: 'CMS request failed' })
      );
      const request: DeleteDatabaseRequest = {
        delbackup: 'y',
      };

      await expect(
        service.deleteDatabase(mockUserId, mockHostUid, mockDbname, request)
      ).rejects.toThrow(CmsError);
    });

    it('should throw DatabaseError if CMS token error occurs', async () => {
      (common.checkCmsTokenError as jest.Mock).mockImplementation(() => {
        throw DatabaseError.InvalidParameter('Invalid CMS token');
      });
      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);
      const request: DeleteDatabaseRequest = {
        delbackup: 'y',
      };

      await expect(
        service.deleteDatabase(mockUserId, mockHostUid, mockDbname, request)
      ).rejects.toThrow(DatabaseError);
    });

    it('should throw DatabaseError if CMS status is fail', async () => {
      (common.checkCmsStatusError as jest.Mock).mockImplementation(() => {
        throw DatabaseError.InvalidParameter('CMS status failed');
      });
      cmsClient.postAuthenticated.mockResolvedValue(mockSuccessResponse);
      const request: DeleteDatabaseRequest = {
        delbackup: 'y',
      };

      await expect(
        service.deleteDatabase(mockUserId, mockHostUid, mockDbname, request)
      ).rejects.toThrow(DatabaseError);
    });
  });
});
