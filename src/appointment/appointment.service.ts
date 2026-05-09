import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentStatus } from './dto';

type ActorContext = {
  id: string;
  actorType: 'user' | 'midwife';
};

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  private async assertChildAccess(actor: ActorContext, childId: string) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    if (actor.actorType === 'midwife') {
      if (child.midwifeId !== actor.id) {
        throw new ForbiddenException('Access denied');
      }
    } else if (child.userId !== actor.id) {
      throw new ForbiddenException('Access denied');
    }

    return child;
  }

  private async assertAppointmentAccess(actor: ActorContext, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { child: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (actor.actorType === 'midwife') {
      if (appointment.child.midwifeId !== actor.id) {
        throw new ForbiddenException('Access denied');
      }
    } else if (appointment.child.userId !== actor.id) {
      throw new ForbiddenException('Access denied');
    }

    return appointment;
  }

  /**
   * Get all appointments for the current actor
   */
  async getActorAppointments(actor: ActorContext) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        child: actor.actorType === 'midwife'
          ? { midwifeId: actor.id }
          : { userId: actor.id },
      },
      include: {
        child: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { dateTime: 'desc' },
    });

    return appointments;
  }

  /**
   * Get all appointments for a child
   */
  async getChildAppointments(actor: ActorContext, childId: string) {
    const child = await this.assertChildAccess(actor, childId);

    const appointments = await this.prisma.appointment.findMany({
      where: { childId },
      orderBy: { dateTime: 'desc' },
    });

    // Separate upcoming and past appointments
    const now = new Date();
    const upcoming = appointments.filter(
      (apt) => new Date(apt.dateTime) >= now && apt.status === 'scheduled',
    );
    const past = appointments.filter(
      (apt) => new Date(apt.dateTime) < now || apt.status !== 'scheduled',
    );

    return {
      childId,
      childName: `${child.firstName} ${child.lastName}`,
      appointments,
      upcoming: upcoming.sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      ),
      past: past.sort(
        (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
      ),
      summary: {
        totalAppointments: appointments.length,
        upcomingCount: upcoming.length,
        completedCount: appointments.filter((a) => a.status === 'completed').length,
        cancelledCount: appointments.filter((a) => a.status === 'cancelled').length,
        nextAppointment: upcoming.length > 0 ? upcoming[0] : null,
      },
    };
  }

  /**
   * Get a single appointment by ID
   */
  async getAppointment(actor: ActorContext, appointmentId: string) {
    return this.assertAppointmentAccess(actor, appointmentId);
  }

  /**
   * Create a new appointment
   */
  async createAppointment(actor: ActorContext, childId: string, dto: CreateAppointmentDto) {
    await this.assertChildAccess(actor, childId);

    const appointment = await this.prisma.appointment.create({
      data: {
        childId,
        title: dto.title,
        type: dto.type,
        dateTime: new Date(dto.dateTime),
        duration: dto.duration,
        location: dto.location,
        address: dto.address,
        providerName: dto.providerName,
        providerRole: dto.providerRole,
        providerPhone: dto.providerPhone,
        notes: dto.notes,
        status: 'scheduled',
      },
    });

    return appointment;
  }

  /**
   * Update an appointment
   */
  async updateAppointment(actor: ActorContext, appointmentId: string, dto: UpdateAppointmentDto) {
    await this.assertAppointmentAccess(actor, appointmentId);

    const appointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.type && { type: dto.type }),
        ...(dto.dateTime && { dateTime: new Date(dto.dateTime) }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.location && { location: dto.location }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.providerName !== undefined && { providerName: dto.providerName }),
        ...(dto.providerRole !== undefined && { providerRole: dto.providerRole }),
        ...(dto.providerPhone !== undefined && { providerPhone: dto.providerPhone }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.reminderSent !== undefined && { reminderSent: dto.reminderSent }),
      },
    });

    return appointment;
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(actor: ActorContext, appointmentId: string) {
    await this.assertAppointmentAccess(actor, appointmentId);

    const appointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'cancelled' },
    });

    return appointment;
  }

  /**
   * Complete an appointment
   */
  async completeAppointment(actor: ActorContext, appointmentId: string) {
    await this.assertAppointmentAccess(actor, appointmentId);

    const appointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'completed' },
    });

    return appointment;
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(actor: ActorContext, appointmentId: string) {
    await this.assertAppointmentAccess(actor, appointmentId);

    await this.prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return { success: true, message: 'Appointment deleted successfully' };
  }

  /**
   * Get upcoming appointments for all children of a user
   */
  async getUpcomingAppointments(actor: ActorContext) {
    const now = new Date();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        child: actor.actorType === 'midwife'
          ? { midwifeId: actor.id }
          : { userId: actor.id },
        dateTime: { gte: now },
        status: 'scheduled',
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { dateTime: 'asc' },
      take: 10,
    });

    return appointments;
  }
}
