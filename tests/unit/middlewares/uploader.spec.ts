import path from 'path';
import mockFs from 'mock-fs';
import fileUploader, {
  FileUploadService,
} from '../../../src/middlewares/uploader';
import { Request } from 'express';

beforeEach(() => {
  // Simulate a file system with a /public/uploads directory
  const mockFileSystem: any = {};
  mockFileSystem[`${path.join(__dirname, '../../../public/uploads')}`] = {};
  mockFs(mockFileSystem);
});

afterEach(() => {
  // Restore the real file system after each test
  mockFs.restore();
});

describe('FileUploadService', () => {
  describe('getInstance', () => {
    it('should always return the same instance', () => {
      const instance1 = FileUploadService.getInstance();
      const instance2 = FileUploadService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getStorage', () => {
    it('should return a multer storage object', () => {
      const storage = fileUploader.getStorage('fake_dir');
      expect(storage).toHaveProperty('_removeFile');
      expect(storage).toHaveProperty('_handleFile');
    });
  });

  describe('formatFileSize', () => {
    it('should format file size correctly', () => {
      const size = fileUploader.formatFileSize(1024);
      expect(size).toBe('1 KB');
    });
  });

  describe('fileFilter', () => {
    it('should accept files with correct mime type', () => {
      const req = {} as Request; // Mock request object
      const callback = jest.fn();
      jest.mock('../../../src/config', () => ({
        upload: {
          filesTypes: {
            image: {
              allowed: ['image/jpeg', 'image/png'],
              disallowed: [],
            },
            video: {
              allowed: ['video/mp4'],
              disallowed: [],
            },
          },
        },
      }));

      // Test with allowed mimetype
      const allowedFile = {
        mimetype: 'image/jpeg',
        originalname: 'test_image.jpeg',
      } as Express.Multer.File; // Mock file object
      fileUploader.fileFilter(req, allowedFile, callback);
      expect(callback).toHaveBeenCalledWith(null, true);

      // Test with disallowed mimetype
      const disallowedFile = {
        mimetype: 'application/pdf',
        originalname: 'document.pdf',
      } as Express.Multer.File; // Mock file object
      callback.mockReset(); // Reset the mock callback
      fileUploader.fileFilter(req, disallowedFile, callback);
      expect(callback).toHaveBeenCalledWith(null, false);
    });
  });

  describe('uploader', () => {
    it('should return a multer object', () => {
      const uploader = fileUploader.uploader('fake_dir');
      expect(uploader).toHaveProperty('single');
      expect(uploader).toHaveProperty('array');
      expect(uploader).toHaveProperty('fields');
    });
  });

  describe('fileMetadata', () => {
    it('should return correct file metadata', () => {
      const metadata = fileUploader.fileMetadata({
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File);
      expect(metadata).toHaveProperty('originalname', 'test.pdf');
      expect(metadata).toHaveProperty('size', '1 KB');
      expect(metadata).toHaveProperty('mimetype', 'application/pdf');
    });
  });

  describe('updateSingleFileField', () => {
    it('should update request body with file information', () => {
      const req = {
        body: {},
        headers: {},
        file: {
          originalname: 'test.jpeg',
          size: 1024,
          filename: 'test.jpeg',
          mimetype: 'image/jpeg',
          fieldname: 'avatar',
          encoding: '7bit',
          buffer: Buffer.from('Hello World'),
        } as Express.Multer.File,
      } as Request;

      const next = jest.fn();

      // Before the call to the middleware, req.body.avatar should be undefined or {} or null
      // it should be different to a string, even an empty string
      expect(req.body).not.toHaveProperty('avatar', undefined);
      expect(req).toHaveProperty('file');

      // Run the upload middleware (Fake upload in memory)
      fileUploader.uploader('fake_dir').single('avatar')(
        req,
        null as any,
        next
      );

      // Run the middleware
      fileUploader.updateSingleFileField('avatar', 'fake_dir')(
        req as Request,
        null as any,
        next
      );

      // After the call to next(), req.body should be updated
      expect(next).toHaveBeenCalled();
      expect(req.body).toHaveProperty('avatar', '/uploads/fake_dir/test.jpeg');
      expect(req.body).toHaveProperty('avatar_metadata', expect.any(Object));
      const avatar_metadata = req.body.avatar_metadata;
      expect(avatar_metadata).toHaveProperty('originalname', 'test.jpeg');
      expect(avatar_metadata).toHaveProperty('size', '1 KB');
      expect(avatar_metadata).toHaveProperty('mimetype', 'image/jpeg');
      expect(avatar_metadata).toHaveProperty('extension', 'jpeg');
    });
  });
});
