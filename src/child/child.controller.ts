/**
 * Child Controller
 * 
 * REST API endpoints for child profile management.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChildDto, UpdateChildDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('children')
@UseGuards(JwtAuthGuard)
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  private getActor(req: any): { id: string; actorType: 'user' | 'midwife' } {
    return { id: req.user.sub, actorType: req.user.actorType || 'user' };
  }

  /**
   * Create a new child profile
   * POST /children
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() dto: CreateChildDto) {
    const child = await this.childService.create(this.getActor(req), dto);
    return {
      success: true,
      data: child,
    };
  }

  /**
   * Get all children for the current user
   * GET /children
   */
  @Get()
  async findAll(@Request() req) {
    const children = await this.childService.findAll(this.getActor(req));
    return {
      success: true,
      data: children,
    };
  }

  /**
   * Get a specific child by ID
   * GET /children/:id
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const child = await this.childService.findOne(this.getActor(req), id);
    return {
      success: true,
      data: child,
    };
  }

  /**
   * Update a child profile
   * PUT /children/:id
   */
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateChildDto,
  ) {
    const child = await this.childService.update(this.getActor(req), id, dto);
    return {
      success: true,
      data: child,
    };
  }

  /**
   * Partial update a child profile
   * PATCH /children/:id
   */
  @Patch(':id')
  async partialUpdate(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateChildDto,
  ) {
    const child = await this.childService.update(this.getActor(req), id, dto);
    return {
      success: true,
      data: child,
    };
  }

  /**
   * Delete a child profile
   * DELETE /children/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req, @Param('id') id: string) {
    const result = await this.childService.remove(this.getActor(req), id);
    return {
      success: true,
      ...result,
    };
  }
}
