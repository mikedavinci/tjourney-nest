/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsJSONOrString', async: false })
export class IsJSONOrString implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value === 'string') {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return true; // it's still a string even if not JSON
      }
    }
    if (typeof value === 'object' && value !== null) {
      return true; // it's a non-null object
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'alertData must be a json object or a string';
  }
}
