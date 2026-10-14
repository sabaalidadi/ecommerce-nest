import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe , ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module.js'
import cookieParser from 'cookie-parser';

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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
}
bootstrap();
