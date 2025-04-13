import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express'; // <--- Import express body parsers

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true })); 
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true
  }));
  // app.enableCors({
  //   origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', // Your frontend URL
  //   credentials: true,
  // });
  app.enableCors({
    origin: '*',
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
