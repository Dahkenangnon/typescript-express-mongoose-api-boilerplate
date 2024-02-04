import { Request, Response } from 'express';
import httpStatus from 'http-status';
import AuthService from '@/features/auth/services';
import UserService from '@/features/user/services';
import emailService from '@/utils/email';
import Container from 'typedi';
import { IUser } from '@/features/user/entities/user.entity';
import { BaseController } from '@/abstracts/controller.base';
import catchAsync from '@/utils/error/catchAsync';
import { IToken, ITokenMethods, TokenModel } from '../entities/token.entity';

export default class AuthController extends BaseController<
  IToken,
  ITokenMethods,
  TokenModel
> {
  public userService = Container.get(UserService);

  constructor() {
    const filterFields = [] as (keyof IToken)[];
    const populateFields = [] as (keyof IToken)[];
    const optionsFields = [] as (keyof IToken)[];
    const updateManyFilterFields = [] as (keyof IToken)[];
    const deleteManyFilterFields = [] as (keyof IToken)[];
    const service = Container.get(AuthService);
    super(
      service,
      filterFields,
      optionsFields,
      populateFields,
      updateManyFilterFields,
      deleteManyFilterFields
    );
  }

  public register = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.createOne(req.body);
    const tokens = await (this.service as AuthService).generateAuthTokens(user);
    const verifyEmailToken = await (
      this.service as AuthService
    ).generateVerifyEmailToken(user as unknown as IUser);
    await emailService.sendVerificationEmail(
      user.email as string,
      verifyEmailToken
    );

    res.status(httpStatus.CREATED).send({ user, tokens });
  });

  public login = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;
      const user = await (this.service as AuthService).login(email, password);
      const tokens = await (this.service as AuthService).generateAuthTokens(
        user
      );
      res.send({ user, tokens });
    }
  );

  public logout = catchAsync(async (req: Request, res: Response) => {
    await (this.service as AuthService).logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
  });

  public refreshTokens = catchAsync(async (req: Request, res: Response) => {
    const tokens = await (this.service as AuthService).refreshAuth(
      req.body.refreshToken
    );
    res.send({ ...tokens });
  });

  public forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const resetPasswordToken = await (
      this.service as AuthService
    ).generateResetPasswordToken(req.body.email);
    await emailService.sendResetPasswordEmail(
      req.body.email,
      resetPasswordToken
    );
    res.status(httpStatus.NO_CONTENT).send();
  });

  public resetPassword = catchAsync(async (req: Request, res: Response) => {
    await (this.service as AuthService).resetPassword(
      req.query.token as string,
      req.body.password
    );
    res.status(httpStatus.NO_CONTENT).send();
  });

  public sendVerificationEmail = catchAsync(
    async (req: Request, res: Response) => {
      const verifyEmailToken = await (
        this.service as AuthService
      ).generateVerifyEmailToken(req.user as IUser);
      await emailService.sendVerificationEmail(
        (req.user as IUser).email as string,
        verifyEmailToken
      );
      res.status(httpStatus.NO_CONTENT).send();
    }
  );

  public verifyEmail = catchAsync(async (req: Request, res: Response) => {
    await (this.service as AuthService).verifyEmail(req.query.token as string);
    res.status(httpStatus.NO_CONTENT).send();
  });

  public blacklistToken = catchAsync(async (req: Request, res: Response) => {
    await (this.service as AuthService).blacklistToken(
      req.body.token as string
    );
    res.status(httpStatus.NO_CONTENT).send();
  });
}
