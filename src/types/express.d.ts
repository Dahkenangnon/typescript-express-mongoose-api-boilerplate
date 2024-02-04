import { IUser } from '@features/user/entities/user.entity';
declare module 'express' {
  export interface Request {
    /** Authenticated user object
     * It's automatically added by the auth middleware
     */
    user: IUser;
  }
}
