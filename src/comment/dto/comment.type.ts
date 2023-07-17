import { ProfileType } from '@app/profile/types/profile.type';
import { CommentEntity } from '../comment.entity';

export type CommentType = Omit<CommentEntity, 'updateTimestamp' | 'author'> & {
  author: ProfileType;
};
