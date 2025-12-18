import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
export declare class ActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    getChildActivities(childId: string): Promise<{
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        id: string;
        childId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getActivity(id: string): Promise<{
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        id: string;
        childId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createActivity(childId: string, dto: CreateActivityDto): Promise<{
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        id: string;
        childId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateActivity(id: string, dto: UpdateActivityDto): Promise<{
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        description: string | null;
        date: Date;
        icon: string | null;
        id: string;
        childId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteActivity(id: string): Promise<{
        message: string;
    }>;
}
