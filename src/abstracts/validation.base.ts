import config from '@config';
import jwt from 'jsonwebtoken';

/**
 * Base validation class
 */
export abstract class BaseValidation {
  /**
   * Custom validation for password
   *
   * @param value Request value
   * @param helpers Helpers from Joi
   * @returns The validated value or throws an error
   */
  public static password = (value: any, helpers: any) => {
    if (value.length < config.validation.password.min) {
      return helpers.message(
        `password must be at least ${config.validation.password.min} characters`
      );
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
      return helpers.message(
        'password must contain at least 1 letter and 1 number'
      );
    }
    return value;
  };

  /**
   * Validate if a string (value) is a Json Web Token string
   *
   * @param value The value to validate
   * @param helpers Helpers from Joi
   * @returns The validated value or throws an error
   */
  public static jwt = (value: any, helpers: any) => {
    if (!value) {
      return helpers.message({ message: 'No token provided.' });
    }

    try {
      const decoded = jwt.decode(value);
      if (!decoded) {
        return helpers.message({ message: 'Invalid token.' });
      }
    } catch (err) {
      return helpers.message({ message: 'Invalid token.' });
    }

    return value;
  };

  /**
   * Custom validation for mongo object id
   *
   * @param value The value to validate
   * @param helpers Helpers from Joi
   * @returns The validated value or throws an error
   */
  public static rowId = (value: any, helpers: any) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
      return helpers.message('Invalid object id');
    }
    return value;
  };

  /**
   * Ensure that a string is a valid name length based on the config constraint
   *
   * @param value The value to validate
   * @param helpers Helpers from Joi
   * @returns The validated value or throws an error
   */
  public static nameConstraint = (value: any, helpers: any) => {
    if (
      value.length < config.validation.username.min ||
      value.length > config.validation.username.max
    ) {
      return helpers.message(
        `A name must be at least ${config.validation.password.min} characters`
      );
    }
    return value;
  };

  /**
   * Ensure that a string is a valid full username length based on the config constraint
   *
   * @param value The value to validate
   * @param helpers Helpers from Joi
   * @returns The validated value or throws an error
   */
  public static fullNameConstraint = (value: any, helpers: any) => {
    if (value.length < 1 || value.length > config.validation.userFullname.max) {
      return helpers.message(
        `A full name must be at least ${config.validation.password.min} characters`
      );
    }
    return value;
  };

  /**
   * Ensure that a string has a valid email length based on the config constraint
   *
   * @param value The value to validate
   * @param helpers Helpers from Joi
   * @returns The validated value or throws an error
   */
  public static emailConstraint = (value: any, helpers: any) => {
    if (
      value.length < config.validation.email.min ||
      value.length > config.validation.email.max
    ) {
      return helpers.message(
        `An email must be at least ${config.validation.password.min} characters`
      );
    }
    return value;
  };
}
