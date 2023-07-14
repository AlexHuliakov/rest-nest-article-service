import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ArticleEntity } from '@app/article/article.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({ default: '' })
  bio: string;

  @Column({ nullable: true })
  image: string;

  @Column({ select: false })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => ArticleEntity, (article: ArticleEntity) => article.author)
  articles: ArticleEntity[];

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];
  
  @ManyToMany(() => UserEntity)
  @JoinTable()
  followers: UserEntity[];
  
  @ManyToMany(() => UserEntity)
  @JoinTable()
  follows: UserEntity[];
}
