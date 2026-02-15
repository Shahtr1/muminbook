import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { configSuhufHandler } from '../suhuf.controller.js';
import SuhufModel from '../../models/suhuf.model.js';
import * as getUserIdUtil from '../../utils/getUserId.js';
import { OK } from '../../constants/http.js';
import FileType from '../../constants/types/fileType.js';
import Direction from '../../constants/types/direction.js';

vi.mock('../../models/suhuf.model');
vi.mock('../../utils/getUserId');

describe('configSuhufHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;
  let mockUserId: mongoose.Types.ObjectId;
  let mockSuhufId: mongoose.Types.ObjectId;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserId = new mongoose.Types.ObjectId();
    mockSuhufId = new mongoose.Types.ObjectId();

    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();

    vi.mocked(getUserIdUtil.getUserId).mockResolvedValue(mockUserId);
  });

  it('should update suhuf layout configuration (dot notation)', async () => {
    mockRequest.params = { id: mockSuhufId.toString() };

    mockRequest.body = {
      layout: {
        leftTab: 'notes',
        isLeftTabOpen: true,
        splitRatio: [60, 40],
      },
    };

    const updatedSuhuf = {
      _id: mockSuhufId,
      userId: mockUserId,
      config: {
        layout: mockRequest.body.layout,
        panels: [],
      },
    };

    vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(
      updatedSuhuf as any
    );

    await configSuhufHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockSuhufId.toString(), userId: mockUserId },
      {
        $set: {
          'config.layout.leftTab': 'notes',
          'config.layout.isLeftTabOpen': true,
          'config.layout.splitRatio': [60, 40],
        },
      },
      { new: true }
    );

    expect(mockResponse.status).toHaveBeenCalledWith(OK);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedSuhuf);
  });

  it('should update panels configuration', async () => {
    mockRequest.params = { id: mockSuhufId.toString() };

    mockRequest.body = {
      panels: [
        {
          fileType: FileType.Reading,
          active: true,
          direction: Direction.Right,
        },
      ],
    };

    const updatedSuhuf = {
      _id: mockSuhufId,
      userId: mockUserId,
      config: {
        panels: mockRequest.body.panels,
        layout: {},
      },
    };

    vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(
      updatedSuhuf as any
    );

    await configSuhufHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockSuhufId.toString(), userId: mockUserId },
      {
        $set: {
          'config.panels': mockRequest.body.panels,
        },
      },
      { new: true }
    );

    expect(mockResponse.status).toHaveBeenCalledWith(OK);
  });

  it('should update both layout and panels', async () => {
    mockRequest.params = { id: mockSuhufId.toString() };

    mockRequest.body = {
      layout: {
        isSplit: true,
      },
      panels: [
        {
          fileType: FileType.Reading,
          active: true,
          direction: Direction.Right,
        },
      ],
    };

    const updatedSuhuf = {
      _id: mockSuhufId,
      userId: mockUserId,
      config: mockRequest.body,
    };

    vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(
      updatedSuhuf as any
    );

    await configSuhufHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockSuhufId.toString(), userId: mockUserId },
      {
        $set: {
          'config.layout.isSplit': true,
          'config.panels': mockRequest.body.panels,
        },
      },
      { new: true }
    );

    expect(mockResponse.status).toHaveBeenCalledWith(OK);
  });

  it('should not update anything if body empty', async () => {
    mockRequest.params = { id: mockSuhufId.toString() };
    mockRequest.body = {};

    vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue({
      _id: mockSuhufId,
    } as any);

    await configSuhufHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(SuhufModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockSuhufId.toString(), userId: mockUserId },
      { $set: {} },
      { new: true }
    );

    expect(mockResponse.status).toHaveBeenCalledWith(OK);
  });

  it('should call next if suhuf not found', async () => {
    mockRequest.params = { id: mockSuhufId.toString() };
    mockRequest.body = { layout: { isSplit: true } };

    vi.mocked(SuhufModel.findOneAndUpdate).mockResolvedValue(null);

    await configSuhufHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
  });

  it('should validate invalid layout (splitRatio invalid)', async () => {
    mockRequest.params = { id: mockSuhufId.toString() };

    mockRequest.body = {
      layout: {
        splitRatio: [150, 50],
      },
    };

    await configSuhufHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(SuhufModel.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
