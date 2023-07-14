import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import config from './ormconfig';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ArticleModule } from './article/article.module';
@Module({
  imports: [
    TagModule,
    TypeOrmModule.forRoot(config),
    UserModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
