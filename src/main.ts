import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const ca = `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUJbdj8b6EayiPq5mvEfwPY3/BjHUwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvYmExYmM0ZjUtZjI2Mi00OTBlLTkzNTgtZDgyOTM1MzNm
ZGI2IFByb2plY3QgQ0EwHhcNMjMwOTIzMDgwMjUyWhcNMzMwOTIwMDgwMjUyWjA6
MTgwNgYDVQQDDC9iYTFiYzRmNS1mMjYyLTQ5MGUtOTM1OC1kODI5MzUzM2ZkYjYg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMalFPZp
HMHjbcrR2GtfoJYMrqoKSsT0vcnf01L9QYEVrt3PWFszvUFiShvSlaCUOKYInN+Y
hT1Wr05w2w+syb4ae1cWUBMIfwVvXjcsJs62RX8sEfEkirQ3mLHa/6Xv5b3MN269
SbR8BfWphKmi6f+j28jS+9JXTOuOSnc1YRRr4tMFMoHvJC2+ZKSJtPUcuF9v/qxf
cLwEL/QLc2Ibu6FCWX29+bqQA+Ko+/nzq8Ckc9OJuOg8tYzhWCwn1FAVtmxDZKoX
wZUVaZP1XzFPv/j81J+VcdqBztQf2yN+75K2ToxOGDaoru6okMv+jUflc1VYiqsy
EorOyzWcrdBdc1ySs8BQnKffvHYcX7/xN4Kp1nYX8FY0B3E0+VNj1FAVm2G5UXl4
kP0mfkVGKGw5m8RAzemtbUgf0ZmfSpM+pAh//kczNCfSRoQWPUwWZIAu7H1kZyNw
klx9PTa0/duRpRfYZyfiRBuu7xE0+mSl3wcsV2BBHVh/aXOrrORfhmXVZQIDAQAB
oz8wPTAdBgNVHQ4EFgQUYNR1wq/tsfZvL7vLClikImOteMUwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAIl2Ifhz4+P/GGPN
puED8V+jCbn4U1qzXiRqqihBN6QX5MU8TYOFkxbqK9Qj/eijDhYjegQ1w9P81zPU
uxSeLzuIo9HCD02BDMs8ZAVntCOoCQBBiYRZmmfdUv17RUvIRABoVJ+yJ2/bMI8P
JZNWJJZmuVfbR6Fo/LbwRoCDJUVlwGvDIvVgrqBtC6FsWh/QPWQysdQQtL5KczJH
3A+V4QW1RrDljiL3dA1IUq0CqFMbX1KtGEj3WxTm6RXG45fuTx5FsP3GI3SlP7mD
jdlDKhC+Px5B/v1MXy3Pcp4yHg5t4InhrI/ms6W7xvApcvADbCd3QyH3qaVKNbti
WJhVUqLjHelX0p2AjfXSGBm8ZbSUrQGQTaEj+Yy4LCEVjxybK5t8Es3Mj4pIQ+3c
jYVTVzv+lYV0j/JJZlih9bXOx/4twhPIiNsi0uVOcD3Jly/QXkuhlIjrgwJAbPSI
sPb/Q7ojyYZMcwgEq6m7RoI1hhx4t0A9xMRJVw9RQlMQ3/sUaA==
-----END CERTIFICATE-----`;

  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      ca: Buffer.from(ca),
    },
    cors: true,
    bodyParser: false,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );
  const rawBodyBuffer = (req, res, buffer, encoding) => {
    if (!req.headers['stripe-signature']) {
      return;
    }

    if (buffer && buffer.length) {
      req.rawBody = buffer.toString(encoding || 'utf8');
    }
  };

  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));

  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('TradeJourney.ai API')
    .setDescription('The TradeJourney.ai API')
    .setVersion('1.0')
    // .addTag('PilotWizard.ai')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(8001);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`
  );
}
bootstrap();
