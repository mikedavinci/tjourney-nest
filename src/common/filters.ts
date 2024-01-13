import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = exceptionResponse['message'] || exceptionResponse;
    } else {
      // Log the unexpected error details in development for debugging purposes
      this.logger.error(exception);
    }

    // Hide the detailed error stack in production mode
    if (
      process.env.NODE_ENV === 'production' &&
      !(exception instanceof HttpException)
    ) {
      message = 'An unexpected error occurred. Please try again later.';
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      ...(process.env.NODE_ENV !== 'production' && { error: exception }), // Include the error details in non-production environments
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
