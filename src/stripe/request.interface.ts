// src/common/interfaces/request.interface.ts
import { Request as ExpressRequest } from 'express';
import { User } from 'src/users/entities/user.entity';

export interface RequestUser extends ExpressRequest {
  user?: User;
}
