import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
export declare class ActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    getChildActivities(childId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        title: string;
        description: string | null;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        icon: string | null;
    }[]>;
    getActivity(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        title: string;
        description: string | null;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        icon: string | null;
    }>;
    createActivity(childId: string, dto: CreateActivityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        title: string;
        description: string | null;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        icon: string | null;
    }>;
    updateActivity(id: string, dto: UpdateActivityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        title: string;
        description: string | null;
        childId: string;
        type: import("@prisma/client").$Enums.ActivityType;
        icon: string | null;
    }>;
    deleteActivity(id: string): Promise<{
        message: string;
    }>;
}
