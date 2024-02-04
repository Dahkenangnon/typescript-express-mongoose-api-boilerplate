import multer, { FileFilterCallback, Multer, StorageEngine } from 'multer';
import fs from 'fs';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import config from '../config';
import path from 'path';

interface IUploadRules {
  allowed: string[];
  disallowed: string[];
}

export class FileUploadService {
  private static instance: FileUploadService;
  private constructor() {
    // Private constructor, singleton
  }

  public static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  public getStorage(destination: string): StorageEngine {
    if (!fs.existsSync(`public/uploads/${destination}`)) {
      fs.mkdirSync(`public/uploads/${destination}`, { recursive: true });
    }

    return multer.diskStorage({
      destination: (_req, _file, cb) =>
        cb(null, `public/uploads/${destination}`),
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);

        //@TODO: Dangerous trick. Client can send dangerous file extension.
        // When client are not trustworthy, don't use it. Or use filter
        /** @see https://github.com/expressjs/multer/issues/170#issuecomment-123402678 */
        const ext = path.extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;

        cb(null, filename);
      },
    });
  }

  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const k = 1024;
    const decimals = 2;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
    return size + ' ' + units[i];
  }

  /**
   * Multer filter function
   *
   * @param req The request object
   * @param file The file to check against
   * @param cb  The callback function
   * @returns any
   */
  public fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void {
    // Get the MIME type of the uploaded file
    const fileType = file.mimetype.split('/')[0];

    // Check if the fileType is in the allowedFileTypes array
    if (!(config.upload.allowedFileTypes as string[])?.includes(fileType)) {
      return cb(null, false); // Reject the file
    }

    const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();

    // Determine the category (audio, image, video, document) based on fileType
    let category = 'unknown';
    if (
      fileType === 'audio' &&
      (config.upload?.filesTypes?.audio?.allowed as string[])?.includes(
        fileExtension as string
      )
    ) {
      category = 'audio';
    } else if (
      fileType === 'image' &&
      (config.upload?.filesTypes?.image?.allowed as string[])?.includes(
        fileExtension as string
      )
    ) {
      category = 'image';
    } else if (
      fileType === 'video' &&
      (config.upload?.filesTypes?.video?.allowed as string[])?.includes(
        fileExtension as string
      )
    ) {
      category = 'video';
    } else if (
      (fileType === 'document' || fileType === 'application') &&
      (config.upload?.filesTypes?.document?.allowed as string[]).includes(
        fileExtension as string
      )
    ) {
      category = 'document';
    }

    // If the category is not found, reject the file
    if (category == 'unknown') {
      return cb(null, false);
    }

    // Check if the file extension is disallowed for this category
    if (
      (
        (config.upload?.filesTypes as Record<string, unknown>)[
          category
        ] as IUploadRules
      )?.disallowed?.includes(fileExtension as string)
    ) {
      return cb(null, false); // Reject the file
    }

    // File passed all checks, accept it
    cb(null, true);
  }

  public uploader(
    destination: string,
    limits: Record<string, number> = { fieldSize: 1e8, fileSize: 1e7, files: 1 }
  ): Multer {
    return multer({
      storage: this.getStorage(destination),
      fileFilter: this.fileFilter,
      limits,
    });
  }

  // Get the file metadata from file object
  public fileMetadata(file: Express.Multer.File): Record<string, unknown> {
    return {
      mimetype: file.mimetype,
      size: this.formatFileSize(file.size),
      originalname: file.originalname,
    };
  }

  public updateSingleFileField(
    fieldName: string,
    destination: string
  ): RequestHandler {
    return ((req: Request, _res: Response, next: NextFunction) => {
      if (req.file) {
        req.body[fieldName] = `/uploads/${destination}/${req.file.filename}`;
        req.body[`${fieldName}_metadata`] = this.fileMetadata(req.file);
        req.body[`${fieldName}_metadata`].extension = req.body[fieldName]
          .split('.')
          .pop();
      }
      next();
    }) as RequestHandler;
  }
}

export default FileUploadService.getInstance();
