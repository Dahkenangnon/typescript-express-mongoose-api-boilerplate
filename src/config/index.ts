import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';
import { logger } from '@/utils/logger';

/** Load the environment variables from the .env file depending on the NODE_ENV value.  Use production default to avoid leaving sensible infos */
dotenv.config({
  path: path.join(
    __dirname,
    `../../.env.${process.env.NODE_ENV || 'production'}.local`
  ),
});

/**
 * Main configuration class.
 * @example // How to use the config class
 *
 * import config from '@/config';
 *
 * console.log(config.port); // 3000
 */
export class Config {
  /** Singleton instance */
  private static instance: Config;

  /** Environment variables */
  public env: string;
  /** Whether the application is in production or not */
  public isProduction: boolean;
  /** Whether the application is in development or not */
  public port: number;
  /** Http Keep alive timeout */
  public keepAliveTimeout: number;
  /** Http Domaine name */
  public domaineName: string;
  /** Http Parameter limit */
  public parameterLimit: number;
  /** Http Request body size */
  public maximumRequestBodySize: number;

  /** The frontend app url (Used for password reset) */
  public frontendUrl: string;
  /** Project code name */
  public projectName: string;
  /** Project display name */
  public projectDisplayName: string;
  /** Project description */
  public projectDescription: string;

  /** Where to store log file */
  public logDir: string;
  /** Log format */
  public logFormat: string;

  /** CORS origin */
  public origin: string;
  /** CORS credentials */
  public credentials: boolean;

  /** General secret used for general purpose */
  public secretKey: string;
  /** JWT access token expiration in minutes */
  public jwt: {
    secret: string;
    accessExpirationMinutes: number;
    refreshExpirationDays: number;
    resetPasswordExpirationMinutes: number;
    verifyEmailExpirationMinutes: number;
  };

  /** Database configuration vars */
  public db: {
    uri: string;
    options: {
      useNewUrlParser: boolean;
      useUnifiedTopology: boolean;
    };
  };

  /** Upload file type */
  public upload: {
    allowedFileTypes: string[];
    filesTypes: {
      audio: {
        allowed: string[];
        disallowed: string[];
      };
      image?: {
        allowed: string[];
        disallowed: string[];
      };
      video?: {
        allowed: string[];
        disallowed: string[];
      };
      document: {
        allowed: string[];
        disallowed: string[];
      };
    };
  };

  /** Email sending configurations */
  public email: {
    smtp: {
      host: string;
      port: number;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
  };

  // Data validation constraints
  public validation: {
    password: {
      min: number;
      max: number;
    };
    username: {
      min: number;
      max: number;
    };
    userFullname: {
      max: number;
    };
    email: {
      min: number;
      max: number;
    };
  };

  public isEnvSetAndValid = false;
  public envVarsSchema: Joi.ObjectSchema<any> | undefined;

  private constructor() {
    /** Joi Schema to validate the env vars */
    this.envVarsSchema = Joi.object()
      .keys({
        // PROJECT
        PROJECT_NAME: Joi.string()
          .required()
          .description('Project code name (no spacial chars, no spaces)'),
        PROJECT_DISPLAY_NAME: Joi.string()
          .required()

          .description('Project display name'),
        PROJECT_DESCRIPTION: Joi.string()

          .required()
          .description('Project description'),
        FRONTEND_URL: Joi.string()

          .required()
          .description('Frontend app url, used for password reset'),

        // Data Validation Constraints
        MIN_PASSWORD_LENGTH: Joi.number()
          .default(8)
          .description('Minimum password length'),
        MAX_PASSWORD_LENGTH: Joi.number()
          .default(255)
          .description('Maximum password length'),
        MIN_USERNAME_LENGTH: Joi.number()
          .default(1)
          .description('Minimum username length'),
        MAX_USERNAME_LENGTH: Joi.number()
          .default(50)
          .description('Maximum username length'),
        MAX_USER_FULLNAME_LENGTH: Joi.number()
          .default(70)
          .description('Maximum user fullname length'),
        MIN_EMAIL_LENGTH: Joi.number()
          .default(3)
          .description('Minimum email length'),
        MAX_EMAIL_LENGTH: Joi.number()
          .default(255)
          .description('Maximum email length'),

        // NODE
        NODE_ENV: Joi.string()
          .valid('production', 'development', 'test')
          .required(),
        SECRET_KEY: Joi.string()

          .required()
          .description('General purpose secret key. Not widely used.'),
        LOG_FORMAT: Joi.string()

          .required()
          .description('Log format'),
        LOG_DIR: Joi.string()

          .required()
          .description('Log directory'),
        PORT: Joi.number()
          .default(3000)
          .description('Port number to run the server on'),

        // HTTP
        KEEP_ALIVE_TIMEOUT: Joi.number()
          .required()
          .description('Http keep alive timeout'),
        PARAMETER_LIMIT: Joi.number()
          .required()
          .description('Http parameter limit'),
        MAXIMUM_REQUEST_BODY_SIZE: Joi.string()
          .required()

          .description('Http request body size'),
        DOMAIN_NAME: Joi.string()
          .required()

          .description('Application full domaine name'),

        // DB
        DB_URL: Joi.string()

          .required()
          .description('DB URL is required'),

        // CORS
        ORIGIN: Joi.string().required().description('CORS origin'),
        CREDENTIALS: Joi.boolean()
          .default(false)
          .description('CORS credentials'),

        // JWT
        JWT_SECRET: Joi.string().required().description('JWT secret key'),
        JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
          .default(30)
          .description('Minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
          .default(30)
          .description('Days after which refresh tokens expire'),
        JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
          .default(10)
          .description('Minutes after which reset password token expires'),
        JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
          .default(10)
          .description('Minutes after which verify email token expires'),

        // EMAIL
        SMTP_HOST: Joi.string().description('Server that will send the emails'),
        SMTP_PORT: Joi.number().description(
          'Port to connect to the email server'
        ),
        SMTP_USERNAME: Joi.string().description('Username for email server'),
        SMTP_PASSWORD: Joi.string().description('Password for email server'),
        EMAIL_FROM: Joi.string()
          .required()
          .description('The from field in the emails sent by the app'),
        // twilio
        TWILIO_ACCOUNT_SID: Joi.string().description('Twilio account SID'),
        TWILIO_AUTH_TOKEN: Joi.string().description('Twilio auth token'),
        TWILIO_PHONE_NUMBER: Joi.string().description('Twilio phone number'),

        // UPLOAD
        UPLOAD_ALLOWED_FILE_TYPES: Joi.string().description(
          'Upload allowed file types'
        ),
        UPLOAD_AUDIO_ALLOWED_FILE_TYPES: Joi.string().description(
          'Upload allowed audio file types'
        ),
        UPLOAD_AUDIO_DISALLOWED_FILE_TYPES: Joi.string()
          .description('Upload disallowed audio file types')
          .optional(),
        UPLOAD_IMAGE_ALLOWED_FILE_TYPES: Joi.string().description(
          'Upload allowed image file types'
        ),
        UPLOAD_IMAGE_DISALLOWED_FILE_TYPES: Joi.string().description(
          'Upload disallowed image file types'
        ),
        UPLOAD_VIDEO_ALLOWED_FILE_TYPES: Joi.string().description(
          'Upload allowed video file types'
        ),
        UPLOAD_VIDEO_DISALLOWED_FILE_TYPES: Joi.string().description(
          'Upload disallowed video file types'
        ),
        UPLOAD_DOCUMENT_ALLOWED_FILE_TYPES: Joi.string().description(
          'Upload allowed document file types'
        ),
        UPLOAD_DOCUMENT_DISALLOWED_FILE_TYPES: Joi.string().description(
          'Upload disallowed document file types'
        ),
      })
      .unknown();

    // Validate env vars
    const { value: envVars, error } = this.envVarsSchema
      .prefs({ errors: { label: 'key' }, abortEarly: true })
      .validate(process.env);

    // Throw error if env vars are not valid
    if (error) {
      logger.error(error);
      throw new Error(
        `Sorry! Cannot continue without environnement setup ? ${error.message}`
      );
    }

    this.isEnvSetAndValid = true;

    // If we are here, then the env vars are valid
    this.env = envVars.NODE_ENV;
    this.isProduction = envVars.NODE_ENV === 'production';
    this.port = envVars.PORT;
    this.keepAliveTimeout = envVars.KEEP_ALIVE_TIMEOUT;
    this.domaineName = envVars.DOMAIN_NAME;
    this.maximumRequestBodySize = envVars.MAXIMUM_REQUEST_BODY_SIZE;
    this.parameterLimit = envVars.PARAMETER_LIMIT;
    this.db = {
      uri: envVars.DB_URL,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    };
    this.secretKey = envVars.SECRET_KEY;
    this.logDir = envVars.LOG_DIR;
    this.logFormat = envVars.LOG_FORMAT;
    this.origin = envVars.ORIGIN;
    this.credentials = envVars.CREDENTIALS === 'true';
    this.frontendUrl = envVars.FRONTEND_URL;
    this.projectName = envVars.PROJECT_NAME;
    this.projectDisplayName = envVars.PROJECT_DISPLAY_NAME;
    this.projectDescription = envVars.PROJECT_DESCRIPTION;
    this.jwt = {
      secret: envVars.JWT_SECRET,
      accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
      refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
      resetPasswordExpirationMinutes:
        envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
      verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    };
    this.email = {
      smtp: {
        host: envVars.SMTP_HOST,
        port: envVars.SMTP_PORT,
        auth: {
          user: envVars.SMTP_USERNAME,
          pass: envVars.SMTP_PASSWORD,
        },
      },
      from: envVars.EMAIL_FROM,
    };

    this.validation = {
      password: {
        min: envVars.MIN_PASSWORD_LENGTH,
        max: envVars.MAX_PASSWORD_LENGTH,
      },
      username: {
        min: envVars.MIN_USERNAME_LENGTH,
        max: envVars.MAX_USERNAME_LENGTH,
      },
      userFullname: {
        max: envVars.MAX_USER_FULLNAME_LENGTH,
      },
      email: {
        min: envVars.MIN_EMAIL_LENGTH,
        max: envVars.MAX_EMAIL_LENGTH,
      },
    };

    this.upload = {
      allowedFileTypes: envVars.UPLOAD_ALLOWED_FILE_TYPES?.split(','),
      filesTypes: {
        audio: {
          allowed: envVars.UPLOAD_AUDIO_ALLOWED_FILE_TYPES?.split(','),
          disallowed: envVars.UPLOAD_AUDIO_DISALLOWED_FILE_TYPES?.split(','),
        },
        image: {
          allowed: envVars.UPLOAD_IMAGE_ALLOWED_FILE_TYPES?.split(','),
          disallowed: envVars.UPLOAD_IMAGE_DISALLOWED_FILE_TYPES?.split(','),
        },
        video: {
          allowed: envVars.UPLOAD_VIDEO_ALLOWED_FILE_TYPES?.split(','),
          disallowed: envVars.UPLOAD_VIDEO_DISALLOWED_FILE_TYPES?.split(','),
        },
        document: {
          allowed: envVars.UPLOAD_DOCUMENT_ALLOWED_FILE_TYPES?.split(','),
          disallowed: envVars.UPLOAD_DOCUMENT_DISALLOWED_FILE_TYPES?.split(','),
        },
      },
    };
  }

  /**
   * Get the singleton instance of the Config class
   * @returns {Config} The singleton instance
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}

export default Config.getInstance();
