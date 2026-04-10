import { Controller, Get } from '@nestjs/common';
import { PublicOwnerApiService } from '../services/public-owner-api.service';
import { PublicOwnerDto } from '../../dto/owner/public-owner.dto';
import { WorkingHoursDto } from '../../dto/working-hours/working-hours.dto';
import { WorkingHoursService } from '../../prisma/models/working-hours.service';

@Controller('api')
export class PublicOwnerController {
  private readonly ownerId = 'owner';

  constructor(
    private publicOwnerApiService: PublicOwnerApiService,
    private workingHoursService: WorkingHoursService,
  ) {}

  @Get('owner')
  async getPublicOwner(): Promise<PublicOwnerDto> {
    return this.publicOwnerApiService.getPublicOwner();
  }

  @Get('owner/working-hours')
  async getPublicWorkingHours(): Promise<WorkingHoursDto[]> {
    const records = await this.workingHoursService.findByOwnerId(this.ownerId);
    return records.map((r) => ({
      id: r.id,
      weekday: r.weekday as WorkingHoursDto['weekday'],
      startTime: r.startTime,
      endTime: r.endTime,
    }));
  }
}
