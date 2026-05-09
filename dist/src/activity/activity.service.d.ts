import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
type ActorContext = {
    id: string;
    actorType: 'user' | 'midwife';
};
export declare class ActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertChildAccess;
    private assertActivityAccess;
    getActorActivities(actor: ActorContext): Promise<({
        child: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getChildActivities(actor: ActorContext, childId: string): Promise<({
        child: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getActivity(actor: ActorContext, id: string): Promise<{
        child: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            chdrNumber: string | null;
            firstName: string;
            lastName: string;
            dateOfBirth: Date;
            gender: import("@prisma/client").$Enums.Gender;
            photoUri: string | null;
            birthWeight: number | null;
            birthHeight: number | null;
            birthHeadCircumference: number | null;
            bloodType: import("@prisma/client").$Enums.BloodType | null;
            placeOfBirth: string | null;
            deliveryType: import("@prisma/client").$Enums.DeliveryType | null;
            allergies: string[];
            specialConditions: string[];
            motherName: string | null;
            fatherName: string | null;
            emergencyContact: string | null;
            address: string | null;
            userId: string;
            midwifeId: string | null;
        };
    } & {
        id: string;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createActivity(actor: ActorContext, childId: string, dto: CreateActivityDto): Promise<{
        id: string;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateActivity(actor: ActorContext, id: string, dto: UpdateActivityDto): Promise<{
        id: string;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteActivity(actor: ActorContext, id: string): Promise<{
        message: string;
    }>;
}
export {};
