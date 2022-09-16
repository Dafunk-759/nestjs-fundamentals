import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  let app = await NestFactory.create(AppModule);
  app = AppModule.configApp(app);

  const options = new DocumentBuilder()
    .setTitle('Coffee')
    .setDescription('Coffee app')
    .setVersion('1.0')
    .build();
  const doc = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, doc);

  await app.listen(3000);
}
bootstrap();
