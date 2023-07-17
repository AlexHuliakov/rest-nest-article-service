import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { ArticleModule } from '@app/article/article.module';
import { ArticleEntity } from '@app/article/article.entity';
import { ProfileModule } from '@app/profile/profile.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [
    TypeOrmModule.forFeature([CommentEntity, ArticleEntity]),
    ArticleModule,
    ProfileModule,
  ],
})
export class CommentModule {}
