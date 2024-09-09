import { Injectable } from '@nestjs/common';
import { clerkClient, ClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService {

  // User methods
  async getUsers() {
    return clerkClient.users.getUserList();
  }

  // async getToken() {
  //   return clerkClient.();
  // }

  // async getUserList(params?: Parameters<ClerkClient['users']['getUserList']>[0]) {
  //   return this.clerk.users.getUserList(params);
  // }

  // async getUser(userId: string) {
  //   return this.clerk.users.getUser(userId);
  // }

  // async createUser(params: Parameters<ClerkClient['users']['createUser']>[0]) {
  //   return this.clerk.users.createUser(params);
  // }

  // async updateUser(userId: string, params: Parameters<ClerkClient['users']['updateUser']>[1]) {
  //   return this.clerk.users.updateUser(userId, params);
  // }

  // async deleteUser(userId: string) {
  //   return this.clerk.users.deleteUser(userId);
  // }

  // // Session methods
  // async getSession(sessionId: string) {
  //   return this.clerk.sessions.getSession(sessionId);
  // }

  // async revokeSession(sessionId: string) {
  //   return this.clerk.sessions.revokeSession(sessionId);
  // }

  // // Organization methods
  // async getOrganizationList(params?: Parameters<ClerkClient['organizations']['getOrganizationList']>[0]) {
  //   return this.clerk.organizations.getOrganizationList(params);
  // }

  // async createOrganization(params: Parameters<ClerkClient['organizations']['createOrganization']>[0]) {
  //   return this.clerk.organizations.createOrganization(params);
  // }

  // async getOrganization(organizationId: Parameters<ClerkClient['organizations']['getOrganization']>[0]) {
  //   return this.clerk.organizations.getOrganization(organizationId);
  // }

  // async updateOrganization(
  //   organizationId: Parameters<ClerkClient['organizations']['updateOrganization']>[0],
  //   params: Parameters<ClerkClient['organizations']['updateOrganization']>[1]
  // ) {
  //   return this.clerk.organizations.updateOrganization(organizationId, params);
  // }

  // // JWT verification (if using jwtKey)
  // async verifyToken(sessionId: string, sessionToken: string) {
  //   try {
  //     // Verify the session token
  //     const session = await this.clerk.sessions.verifySession(sessionId, sessionToken);
      
  //     if (session) {
  //       return { verified: true, session };
  //     } else {
  //       return { verified: false };
  //     }
  //   } catch (error) {
  //     console.error('Token verification failed:', error);
  //     return { verified: false, error: error.message };
  //   }
  // }
}