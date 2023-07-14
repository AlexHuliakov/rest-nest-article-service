import { User } from '@app/decorators/user.decorator';
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResponseInerface } from './types/profileResponse.inerface';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async findOne(
    @Param('id') id: string,
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseInerface> {
    const profile = await this.profileService.findOne(
      +id,
      currentUserId,
      username,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  async follow(
    @Param('username') username: string,
    @User('id') currentUserId: number,
  ): Promise<ProfileResponseInerface> {
    const profile = await this.profileService.follow(username, currentUserId);
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  async unfollow(
    @Param('username') username: string,
    @User('id') currentUserId: number,
  ): Promise<ProfileResponseInerface> {
    const profile = await this.profileService.unfollow(username, currentUserId);
    return this.profileService.buildProfileResponse(profile);
  }
}
