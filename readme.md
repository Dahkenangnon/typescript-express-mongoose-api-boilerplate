# typescript-express-mongoose-api-boilerplate

>
>
> Express + TypeScript + Mongoose to build a production ready RESTful API.
>
>


<p align="center">
  <a href="http://commitizen.github.io/cz-cli/">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly" />
  </a>
  <a href="https://travis-ci.com/Dahkenangnon/typescript-express-mongoose-api-boilerplate">
    <img src="https://travis-ci.com/Dahkenangnon/typescript-express-mongoose-api-boilerplate.svg?branch=master" alt="Build Status" />
  </a>
  <a href="https://coveralls.io/github/Dahkenangnon/typescript-express-mongoose-api-boilerplate?branch=main">
    <img src="https://coveralls.io/repos/github/Dahkenangnon/typescript-express-mongoose-api-boilerplate/badge.svg?branch=master" alt="Coverage Status" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
</p>
<hr>

## Table of Contents

- [typescript-express-mongoose-api-boilerplate](#typescript-express-mongoose-api-boilerplate)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Features](#features)
  - [Git Hooks and Commits](#git-hooks-and-commits)
  - [Eslint and Prettier](#eslint-and-prettier)
  - [Environment Variables](#environment-variables)
  - [API Documentation](#api-documentation)
    - [API Endpoints](#api-endpoints)
  - [Error Handling](#error-handling)
  - [Validation](#validation)
  - [Authentication](#authentication)
  - [Authorization](#authorization)
  - [Logging](#logging)
  - [paginate](#paginate)
  - [Contributing](#contributing)
  - [License](#license)


## Getting Started

1. Clone the repo:

```bash

# clone the repo
git clone --depth 1 https://github.com/Dahkenangnon/typescript-express-mongoose-api-boilerplate.git

# move to the project folder
cd typescript-express-mongoose-api-boilerplate

# remove current origin repository
npx rimraf ./.git
```

2. Install the dependencies:

```bash
yarn install
```

3. Set the environment variables:

```bash
cp .env.example .env.development.local
cp .env.test.example .env.test.local


# open .env.test.local and .env.development.local and modify the environment variables to fit your needs
```

5. Run the server:

```bash
# Run the server
yarn dev

# Run the server in production mode
yarn deploy
```


## Features

- **TypeScript**: written in TypeScript
- **Express.js**: with [express](https://expressjs.com)
- **NoSQL database**: [MongoDB](https://www.mongodb.org) object data modeling using [Mongoose](https://mongoosejs.com/#/)
- **Authentication and authorization**: using [passport](http://www.passportjs.org)
- **Validation**: request data validation using [Joi](https://github.com/hapijs/joi)
- **Logging**: using [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)
- **Testing**: unit, integration and e2e tests using [Jest](https://jestjs.io) and [Supertest](https://www.npmjs.com/package/supertest) and [ts-jest](https://kulshekhar.github.io/ts-jest/)
- **Error handling**: centralized error handling mechanism
- **API documentation**: with [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) and [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) - `In progress`
- **Process management**: advanced production process management using [PM2](https://pm2.keymetrics.io)
- **Dependency management**: with [NPM](https://www.npmjs.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
- **Santizing**: sanitize request data against xss and query injection
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Compression**: gzip compression with [compression](https://github.com/expressjs/compression)
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
- **Editor config**: consistent editor configuration using [EditorConfig](https://editorconfig.org)
- **Beautiful cron job**. Group your crons job in class, identified by annotion `@Schedule` they will be automatically runned by the app.
- **Use aliases**. Do  `import from '@/utils/...` instead of `import from '../../../utils/...'`
- **Clean and simple yet powerful architecture**: Controller, Routes, Validations, Crons, Services, Entities, etc... organized by class and inheritance.
- **Less TypeError-prone**: Built with Typescript with strict mode, you will have less error at runtime. No ts-ignore comment allowed
- **Proper App Start**: All environment variables are checked and the app will not start if something is missing.
- **CRUD**: CRUD operation are handle only in base controller, focus on building real feature in your controller.
- **Commitizen friendly**: Use `yarn cm` to commit your changes. It will add your changes in the git index and guide you to write a good commit message.
- **Testing**: Jest is used for testing. You can run `yarn test` to run all tests.
- **CI/CD**: Github actions is used for CI/CD. You can find the workflow in `.github/workflows` folder.


## Git Hooks and Commits
We use http://commitizen.github.io/cz-cli/ along with Husky to force ourself to adopt standard commit and run test and prettier before any commit.

So, We encourage to run this:

```bash
# This force you to run prettier, test and enforce standard commit message
yarn cm # Same as: git add . && git commit ...
```

Instead of

```bash
# You're free to do whatever you want but not recommended
git add . && git commit ...  # Same as: git add . && git commit ...
```


## Eslint and Prettier

Linting is done using [ESLint](https://eslint.org/) and [Prettier](https://prettier.io).

To modify the ESLint configuration, update the `.eslintrc.json` file. To modify the Prettier configuration, update the `.prettierrc.json` file.

To prevent a certain file or directory from being linted, add it to `.eslintignore` and `.prettierignore`.

To maintain a consistent coding style across different IDEs, the project contains `.editorconfig`

```bash
# run ESLint
yarn lint

# fix ESLint errors
yarn lint:fix

# run prettier
yarn prettier:write

# prettier check
yarn prettier:check

```

## Environment Variables

The environment variables can be found and modified in the `.env.example` file.
Just copy it to `.env.development.local` and `.env.production.local` and modify the values.

## API Documentation
When running in development mode, a Swagger API documentation is available at the `/api-docs` endpoint.
To customize the API documentation edit the `src/features/*/docs/index.yaml` file.

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/refresh-tokens` - refresh auth tokens\
`POST /v1/auth/forgot-password` - send reset password email\
`POST /v1/auth/reset-password` - reset password\
`POST /v1/auth/send-verification-email` - send verification email\
`POST /v1/auth/verify-email` - verify email

**User routes**:\
`POST /v1/users` - create a user\
`GET /v1/users` - get all users\
`GET /v1/users/:id` - get user\
`PATCH /v1/users/:id` - update user\
`DELETE /v1/users/:id` - delete user

**Message routes**:\
`POST /v1/messages` - create a message\
`GET /v1/messages` - get all messages\
`GET /v1/messages/:id` - get message\
`PATCH /v1/messages/:id` - update message\
`DELETE /v1/messages/:id` - delete message

## Error Handling

The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```typescript
import catchAsync from '@/utils/catchAsync';

// Instead of writing this with try/catch:
export class UserController extends BaseController<
  IUser,
  IUserMethods,
  UserModel
>{

// other methods

 public login = catchAsync(async (req: Request, res: Response): Promise<void> => {
        try {
            // Do something
        } catch (error) {
            next(error);
        }
  });

// other methods
}


// You can write this simply as:
export class  UserController extends BaseController<
  IUser,
  IUserMethods,
  UserModel
> {

  // other methods

public login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // Do something
  });

  // other methods
}
```

The error handling middleware sends an error response, which has the following format:

```json
{
  "code": 404,
  "message": "Not found"
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```typescript

export class UserService extends BaseService<
  IUser,
  IUserMethods,
  UserModel
> {
  constructor() {
    super(User);
  }
// Other methods

public async findUnder18(id: number): Promise<User> {
    const data: User = await this.service.findOne({ age: { $gt: 18 } });

    if (!data) throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist");
    return data;
}

  // Other methods
}
```

## Validation

Request data is validated using [Joi](https://joi.dev/). Check the [documentation](https://joi.dev/api/) for more details on how to write Joi validation schemas.

The validation schemas are defined in the `src/**/validations` directory and are used in the each routes by providing them as parameters to the `validate` middleware.

```typescript

export class UserRoute extends BaseRoute<UserController>  {
  constructor(app: express.Application) {
    // Other routes
    this.router.get('/:id', auth(), validate(UserValidation.readOne), this.controller.readOne);
  }
}

```

Note that validation for each feature are grouped into a class. Above is `UserValidation` class. This is to make easier maintenance.

## Authentication

To require authentication for certain routes, you can use the `auth` middleware.

```typescript
this.router.get('/:id', auth(), validate(UserValidation.readOne), this.controller.readOne);
```

These routes require a valid JWT access token in the Authorization request header using the Bearer schema. If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

**Generating Access Tokens**:

An access token can be generated by making a successful call to the register (`POST /v1/auth/register`) or login (`POST /v1/auth/login`) endpoints. The response of these endpoints also contains refresh tokens (explained below).

An access token is valid for 30 minutes. You can modify this expiration time by changing the `JWT_ACCESS_EXPIRATION_MINUTES` environment variable in the .env.{env}.local file.

**Refreshing Access Tokens**:

After the access token expires, a new access token can be generated, by making a call to the refresh token endpoint (`POST /v1/auth/refresh-tokens`) and sending along a valid refresh token in the request body. This call returns a new access token and a new refresh token.

A refresh token is valid for 30 days. You can modify this expiration time by changing the `JWT_REFRESH_EXPIRATION_DAYS` environment variable in the .env.{env}.local file.

## Authorization

The `auth` middleware can also be used to require certain rights/permissions to access a route.

```typescript
this.router.get('', auth('manageUsers'), validate(UserValidation.readManyPaginated), this.controller.readManyPaginated);
```

In the example above, an authenticated user can access this route only if that user has the `manageUsers` permission.

The permissions are role-based. You can view the permissions/rights of each role in the `src/config/roles.ts` file.

If the user making the request does not have the required permissions to access this route, a Forbidden (403) error is thrown.

## Logging

Import the logger from `src/utils/logger.ts`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```typescript
import { logger } from '@/utils/logger';

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\
It is up to the server (or process manager) to actually read them from the console and store them in log files.\
This app uses pm2 in production mode, which is already configured to store the logs in log files.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).

## paginate

All request to get a list of documents (e.g., GET /v1/users) can be paginated by simply including the pagination parameters (page and limit) in the query string.

Pagination is forced by default. This means that if the client does not specify the pagination parameters in the query string, the response will contain the first page of results (limit = 10 by default).

```typescript
export abstract class BaseController<
  IModelType extends IBaseModel,
  IModelMethods,
  MongooseModel extends Model<IModelType, {}, IModelMethods>,
> {
    // Other methods

    public readManyPaginated = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, this.filterFields as string[]);
    const options = pick(req.query, this.optionsFields);
    const data = await this.service.readManyPaginated(filter, options);
    res.status(httpStatus.OK).send(data);
  });

  // Other methods
}
```

The `filter` param is an object to be used in a WHERE clause (e.g., { name: 'John Doe' }).\

The `options` param can have the following (optional) fields:

```javascript
const options = {
  sortBy: 'name:desc', // sort order.
  limit: 5, // maximum results per page
  page: 2, // page number
};
```

The options features also supports sorting by multiple criteria (separated by a comma): `sortBy: name:desc,role:asc`

The `paginate` method returns a Promise, which fulfills with an object having the following properties:

```json
{
  "datas": [],
  "page": 2,
  "limit": 5,
  "totalPages": 10,
  "totalResults": 48
}
```
## Contributing

Contributions are more than welcome!

## License
This project is brought to you by [Justin Dah-kenangnon](https://dah-kenangnon.com/) and licensed with the [MIT](LICENSE)
