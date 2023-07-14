import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponce.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/articlesResponce.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(
    userId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    } else {
      queryBuilder.limit(20);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });

      const ids = author.favorites.map((el) => el.id);
      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    let favoriteIds: number[] = [];
    if (userId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favorites'],
      });

      favoriteIds = currentUser.favorites.map((el) => el.id);
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articles = await queryBuilder.getMany();
    const articlesWithFavorites = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorites, articlesCount };
  }

  async getFeed(
    userId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['follows'],
    });

    if (follows.follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const ids = follows.follows.map((el) => el.id);

    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids });

    const articlesCount = await queryBuilder.getCount();
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    return { articles, articlesCount };
  }

  createArticle(
    user: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(createArticleDto.title);
    article.author = user;
    return this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      Math.random().toString(36).substring(4)
    );
  }

  findBySlug(slug: string): Promise<ArticleEntity> {
    return this.articleRepository.findOne({ where: { slug } });
  }

  async deleteBySlug(
    slug: string,
    currentUser: UserEntity,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (article && article.author.id === currentUser.id) {
      this.articleRepository.remove(article);
    } else {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async updateBySlug(
    slug: string,
    currentUser: UserEntity,
    updateArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!(article && article.author.id === currentUser.id)) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(article, updateArticleDto);
    return this.articleRepository.save(article);
  }

  async addArticleToFavorites(userId: number, slug: string) {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async removeArticleFromFavorites(userId: number, slug: string) {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    const isFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) !== -1;

    if (isFavorited) {
      user.favorites = user.favorites.filter(
        (articleInFavorites) => articleInFavorites.id !== article.id,
      );
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }
}
