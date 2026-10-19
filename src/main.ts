import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe , ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module.js'
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // پیشوند گلوبال: روت‌ها میشن مثلاً /api/auth/register
  app.setGlobalPrefix('api');

  app.use(cookieParser());

  // ولیدیشن گلوبال روی تمام ورودی‌ها با DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );


    app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.setGlobalPrefix('api');

    // ۱. تنظیمات مستندات Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Commerce Shop API')
    .setDescription('مستندات و داکیومنت API فروشگاه اینترنتی با NestJS و MySQL')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'توکن JWT را اینجا وارد کنید',
        in: 'header',
      },
      'JWT-auth', // شناسه برای استفاده در کنترلرها
    )
    .build();

  // ۲. ایجاد سند Swagger
  const document = SwaggerModule.createDocument(app, config);

  // ۳. راه‌اندازی مسیر رابط کاربری مستندات
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // ذخیره توکن در رفرش مرورگر
    },
  });


  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
}
bootstrap();
