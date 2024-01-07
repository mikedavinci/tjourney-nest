import { IsNotEmpty, Validate } from 'class-validator';
import { IsJSONOrString } from './custom.validators';

export class CreateAlertDto {
  @IsNotEmpty()
  @Validate(IsJSONOrString)
  alertData?: Record<string, any> | string;
}
