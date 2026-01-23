import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmergencyContactService } from './emergency-contact.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('emergency-contacts')
@UseGuards(JwtAuthGuard)
export class EmergencyContactController {
  constructor(private readonly emergencyContactService: EmergencyContactService) {}

  /**
   * Get all emergency contacts for the authenticated user
   */
  @Get()
  async getUserContacts(@Request() req) {
    const contacts = await this.emergencyContactService.getUserContacts(req.user.sub);
    return {
      success: true,
      data: contacts,
    };
  }

  /**
   * Get a single emergency contact
   */
  @Get(':id')
  async getContact(@Request() req, @Param('id') id: string) {
    const contact = await this.emergencyContactService.getContact(req.user.sub, id);
    return {
      success: true,
      data: contact,
    };
  }

  /**
   * Create a new emergency contact
   */
  @Post()
  async createContact(@Request() req, @Body() dto: CreateEmergencyContactDto) {
    const contact = await this.emergencyContactService.createContact(req.user.sub, dto);
    return {
      success: true,
      data: contact,
    };
  }

  /**
   * Update an emergency contact
   */
  @Put(':id')
  async updateContact(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyContactDto,
  ) {
    const contact = await this.emergencyContactService.updateContact(req.user.sub, id, dto);
    return {
      success: true,
      data: contact,
    };
  }

  /**
   * Delete an emergency contact
   */
  @Delete(':id')
  async deleteContact(@Request() req, @Param('id') id: string) {
    const result = await this.emergencyContactService.deleteContact(req.user.sub, id);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Set a contact as primary
   */
  @Put(':id/primary')
  async setPrimaryContact(@Request() req, @Param('id') id: string) {
    const contact = await this.emergencyContactService.setPrimaryContact(req.user.sub, id);
    return {
      success: true,
      data: contact,
    };
  }
}
