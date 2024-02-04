import path from 'path';
import fs from 'fs';

export class FileSystemUtils {
  private static instance: FileSystemUtils;

  public static getInstance(): FileSystemUtils {
    if (!FileSystemUtils.instance) {
      FileSystemUtils.instance = new FileSystemUtils();
    }
    return FileSystemUtils.instance;
  }

  /**
   * Get the path to the project root directory.
   * @returns string - The path to the project root directory
   */
  public getProjectDir(): string {
    return path.resolve(__dirname, '../../');
  }

  public rootDir(): string {
    return path.resolve(__dirname, '../../../');
  }

  public getLogDir(): string {
    return path.resolve(this.rootDir(), 'logs');
  }

  /**
   * Remove a file from the filesystem
   *
   * @param filePath The path to the file to remove
   * @returns {Promise<boolean>}
   */
  public removeFile(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /**
   * Remove a directory from the filesystem
   *
   * @param filePath The path to the file to remove
   * @params {boolean} recursive Remove the directory recursively
   * @returns {Promise<boolean>}
   */
  public removeDir(dirPath: string, recursive = false): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.rmdir(dirPath, { recursive }, (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  /**
   * Check if a file exists
   *
   * @param filePath The path to the file to check
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  /**
   * Write data to a file
   *
   * @param filePath The path to the file to write
   * @param data The data to write to the file
   * @returns {Promise<boolean>}
   */
  async saveFile(filePath: string, data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }
}

export default FileSystemUtils.getInstance();
