export enum method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface RequestOptions {
  method: method;
  endpoint: string;
  bodyParams?: any;
  queryParams?: Record<string, any>;
  isPublic: boolean;
}
