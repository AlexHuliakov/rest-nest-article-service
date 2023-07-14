import { AuthGuard } from '@app/guards/auth.guard';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post()
  @UseGuards(AuthGuard)
  async create() {
    return this.articleService.createArticle();
  }
}
