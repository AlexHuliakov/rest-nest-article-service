import { User } from '@app/decorators/user.decorator';
import { AuthGuard } from '@app/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('articles/:slug/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
    @User() user: UserEntity,
  ) {
    const comment = await this.commentService.create(
      slug,
      createCommentDto,
      user,
    );
    return this.commentService.buildResponce(comment);
  }

  @Get()
  findByArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ) {
    return this.commentService.findAll(slug, currentUserId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
