import { Test, TestingModule } from '@nestjs/testing';
import { CmsUserController } from './cms-user.controller';
import { CmsUserService } from './cms-user.service';

describe('CmsUserController', () => {
  let controller: CmsUserController;
  let service: jest.Mocked<CmsUserService>;

  const mockReq = { user: { sub: 'user-123' } };

  beforeEach(async () => {
    const mockCmsUserService = {
      addDbmtUser: jest.fn(),
      getDbmtUserInfo: jest.fn(),
      updateDbmtUser: jest.fn(),
      deleteDbmtUser: jest.fn(),
      setDbmtPasswd: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsUserController],
      providers: [{ provide: CmsUserService, useValue: mockCmsUserService }],
    }).compile();

    controller = module.get(CmsUserController);
    service = module.get(CmsUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addDbmtUser', () => {
    it('should call service.addDbmtUser and return dblist and userlist', async () => {
      const body = {
        targetid: 'create_test',
        password: '1234',
        casauth: 'none',
        dbcreate: 'none',
        statusmonitorauth: 'none',
      };
      const mockResponse = { dblist: [], userlist: [] };
      service.addDbmtUser.mockResolvedValue(mockResponse);

      const result = await controller.addDbmtUser(mockReq, 'host-uid-1', body);

      expect(service.addDbmtUser).toHaveBeenCalledWith('user-123', 'host-uid-1', body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDbmtUserInfo', () => {
    it('should call service.getDbmtUserInfo and return dblist and userlist', async () => {
      const mockResponse = { dblist: [], userlist: [] };
      service.getDbmtUserInfo.mockResolvedValue(mockResponse);

      const result = await controller.getDbmtUserInfo(mockReq, 'host-uid-1');

      expect(service.getDbmtUserInfo).toHaveBeenCalledWith('user-123', 'host-uid-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateDbmtUser', () => {
    it('should call service.updateDbmtUser with body', async () => {
      const body = {
        targetid: 'test_target',
        dbauth: [],
        casauth: 'none',
        dbcreate: 'none',
        statusmonitorauth: 'none',
      };
      const mockResponse = { dblist: [], userlist: [] };
      service.updateDbmtUser.mockResolvedValue(mockResponse);

      const result = await controller.updateDbmtUser(mockReq, 'host-uid-1', body);

      expect(service.updateDbmtUser).toHaveBeenCalledWith('user-123', 'host-uid-1', body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteDbmtUser', () => {
    it('should call service.deleteDbmtUser with targetid', async () => {
      const mockResponse = { dblist: [], userlist: [] };
      service.deleteDbmtUser.mockResolvedValue(mockResponse);

      const result = await controller.deleteDbmtUser(
        mockReq,
        'host-uid-1',
        'test_user_2'
      );

      expect(service.deleteDbmtUser).toHaveBeenCalledWith(
        'user-123',
        'host-uid-1',
        'test_user_2'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('setDbmtPasswd', () => {
    it('should call service.setDbmtPasswd with body', async () => {
      const body = { targetid: 'yifan', newpassword: '1111' };
      service.setDbmtPasswd.mockResolvedValue({ success: true });

      const result = await controller.setDbmtPasswd(mockReq, 'host-uid-1', body);

      expect(service.setDbmtPasswd).toHaveBeenCalledWith(
        'user-123',
        'host-uid-1',
        'yifan',
        '1111'
      );
      expect(result).toEqual({ success: true });
    });
  });
});
