// src/auth/clerk-auth.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerkClient;

  constructor() {
    this.clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const host = request.headers['host'] as string;
      const fullUrl = new URL(request.url, `http://${host}`);

      const authRequest = {
        method: request.method,
        headers: request.headers,
        url: fullUrl.toString(),
      } as Request;

      const { isSignedIn } =
        await this.clerkClient.authenticateRequest(authRequest);

      if (!isSignedIn) {
        throw new UnauthorizedException('User is not signed in');
      }
      // console.log('isSignedIn', isSignedIn);
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
