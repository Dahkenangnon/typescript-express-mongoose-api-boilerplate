import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  NextFunction,
  Response,
  Request,
  RequestHandler,
  ErrorRequestHandler,
} from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import compression from 'compression';
import config from '@config';
import { connectDB } from '@database';
import { logger, stream } from '@/utils/logger';
import Features from '@features';
import http from 'http';
import passport from 'passport';
import { jwtStrategy } from '@config/passport';
import { errorConverter, errorHandler } from '@middlewares/error';
import httpStatus from 'http-status';
import ApiError from './utils/error/ApiError';
import path from 'path';
import bodyParser from 'body-parser';
import i18n from 'i18n';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import packageJson from '../package.json';
import { EmailUtils } from './utils/email';
export default class App {
  /** Express Application */
  public app: express.Application;
  /** Environment */
  public env: string;
  /** Is Production */
  public isProduction: boolean;
  /** Port */
  public port: string | number;
  /** Features (Business Logics and functionalities) */
  public features: Features;
  /** Server */
  public server: http.Server;

  constructor() {
    this.app = express();
    this.env = config.env || 'production'; // Defaulting to production to avoid accidental leak of sensitive data
    this.port = config.port || 3000;
    this.isProduction = config.isProduction;
    this.server = http.createServer(this.app);
    this.server.keepAliveTimeout = config.keepAliveTimeout;
    this.features = new Features(this.app, this.server);
  }

  public listen() {
    this.preMiddleware();

    if (!this.isProduction) {
      this.swaggerDoc();
    }
    this.features.init();

    this.postMiddleware();

    // We listen  on the http server to allow easy socket.io integration
    this.server.listen(this.port, () => {
      logger.info(`🚀 App Started 🚀 `);
    });
  }

  public async bootstrap() {
    const isConnectedToEmailServer =
      await EmailUtils.getInstance().connectToEmailServer(['test']);

    if (!isConnectedToEmailServer) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        this.env !== 'production'
          ? 'Unable to connect to email server. Make sure you have configured the SMTP options in .env. If you are in dev env, please pass the `skipEnvs` option to the `connectToEmailServer` method.'
          : 'App bootstrap failed. Please contact the administrator'
      );
    }

    await connectDB();
  }

  private preMiddleware() {
    this.app.set('trust proxy', 1);
    this.app.use(morgan(config.logFormat, { stream }));
    this.app.use(
      cors({ origin: config.origin, credentials: config.credentials })
    );
    this.app.use(passport.initialize());
    passport.use('jwt', jwtStrategy);
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(
      bodyParser.urlencoded({
        limit: config.maximumRequestBodySize,
        parameterLimit: config.parameterLimit,
        extended: true,
      })
    );
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(`${__dirname}/../public`)));
    i18n.configure({
      locales: ['en', 'fr'],
      directory: path.join(__dirname, 'locales', 'emails'),
      defaultLocale: 'en',
      objectNotation: true,
    });
    this.app.use(i18n.init);
    this.app.use(((req: Request, res: Response, next: NextFunction) => {
      res.locals.__ = req.__;
      next();
    }) as RequestHandler);
  }

  private swaggerDoc() {
    const options = {
      swaggerDefinition: {
        info: {
          title: config.projectName ?? packageJson.name,
          version: packageJson.version,
          description: config.projectDescription,
          license: {
            name: packageJson.license ?? 'MIT',
            url: 'https://choosealicense.com/licenses/mit/',
          },
        },
      },
      // Maybe, you can change it to use json instead of yaml
      apis: ['src/features/**/docs/*.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private postMiddleware() {
    const notFoundHandler = (
      _req: Request,
      _res: Response,
      next: NextFunction
    ) => {
      next(new ApiError(httpStatus.NOT_FOUND, 'URL Not Found'));
    };
    this.app.use(notFoundHandler as RequestHandler);
    this.app.use(errorConverter as ErrorRequestHandler);
    this.app.use(errorHandler as ErrorRequestHandler);
  }
}
