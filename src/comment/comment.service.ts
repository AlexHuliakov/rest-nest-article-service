import { ArticleEntity } from '@app/article/article.entity';
import { ProfileService } from '@app/profile/profile.service';
import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { CommentType } from './dto/comment.type';
import { CommentResponseInterface } from './dto/commentResponse.interface';
import { CommentsResponseInterface } from './dto/commentsResponse.interface';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly profileService: ProfileService,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}
  async create(
    slug: string,
    createCommentDto: CreateCommentDto,
    author: UserEntity,
  ): Promise<CommentType> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['comments'],
    });
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const comment = new CommentEntity();
    Object.assign(comment, createCommentDto);
    comment.article = article;
    comment.author = author;
    article.comments.push(comment);

    await this.commentRepository.save(comment);
    await this.articleRepository.save(article);

    const authorProfile = await this.profileService.findOne(
      author.id,
      author.username,
    );
    const authorProfileResponse =
      this.profileService.buildProfileResponse(authorProfile);

    return { ...comment, author: authorProfileResponse.profile };
  }

  buildResponce(comment: CommentType): CommentResponseInterface {
    delete comment.article;

    return { comment };
  }

  async findAll(
    slug: string,
    currentUserId: number,
  ): Promise<CommentsResponseInterface> {
    // CommentsResponseInterface
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['comments', 'comments.author'],
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const comments = await Promise.all(
      article.comments.map(async (comment) => {
        const authorProfile = await this.profileService.findOne(
          currentUserId,
          comment.author.username,
        );

        const authorProfileResponse =
          this.profileService.buildProfileResponse(authorProfile);

        return { ...comment, author: authorProfileResponse.profile };
      }),
    );

    return { comments };
  }

  async remove(id: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['article'],
    });

    if (!comment) {
      throw new HttpException('Comment not found!', HttpStatus.NOT_FOUND);
    }

    const article = await this.articleRepository.findOne({
      where: { id: comment.article.id },
      relations: ['comments'],
    });

    article.comments = article.comments.filter((comment) => comment.id !== id);

    await this.articleRepository.save(article);
    await this.commentRepository.remove(comment);

    return comment;
  }
}
