import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileType } from './types/profile.type';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(
    id: number,
    currentUserId: number,
    username: string,
  ): Promise<ProfileType> {
    const profile = await this.userRepository.findOne({
      where: { username },
      relations: ['followers'],
    });
    if (!profile) {
      throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
    }

    const following =
      profile.followers.findIndex(
        (follower) => follower.id === currentUserId,
      ) !== -1;

    return { ...profile, following };
  }

  buildProfileResponse(profile: ProfileType) {
    delete profile.email;
    delete profile.followers;
    delete profile.follows;

    return { profile };
  }

  async follow(username: string, currentUserId: number): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['followers'],
    });
    if (!user) {
      throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
    }

    if (user.id === currentUserId) {
      throw new HttpException(
        'Can not follow yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isFollow =
      user.followers.findIndex((follower) => follower.id === currentUserId) !==
      -1;

    if (!isFollow) {
      user.followers.push(
        await this.userRepository.findOne({ where: { id: currentUserId } }),
      );
      
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['follows'],
      });
      
      currentUser.follows.push(
        await this.userRepository.findOne({ where: { id: user.id } }),
      );
      
      await this.userRepository.save(user);
      await this.userRepository.save(currentUser);
    }

    return { ...user, following: true };
  }

  async unfollow(
    username: string,
    currentUserId: number,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['followers'],
    });
    if (!user) {
      throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
    }

    if (user.id === currentUserId) {
      throw new HttpException(
        'Can not unfollow yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isFollow =
      user.followers.findIndex((follower) => follower.id === currentUserId) !==
      -1;

    if (isFollow) {
      user.followers = user.followers.filter(
        (follower) => follower.id !== currentUserId,
      );
      
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['follows'],
      });
      
      currentUser.follows = currentUser.follows.filter(
        (follow) => follow.id !== user.id,
      );
      
      await this.userRepository.save(user);
      await this.userRepository.save(currentUser);
    }

    return { ...user, following: false };
  }
}
