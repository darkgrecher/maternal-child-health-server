import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
export declare class ActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    getChildActivities(childId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        childId: string;
        description: string | null;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        date: Date;
        icon: string | null;
    }[]>;
    getActivity(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        childId: string;
        description: string | null;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        date: Date;
        icon: string | null;
    }>;
    createActivity(childId: string, dto: CreateActivityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        childId: string;
        description: string | null;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        date: Date;
        icon: string | null;
    }>;
    updateActivity(id: string, dto: UpdateActivityDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        childId: string;
        description: string | null;
        type: import("@prisma/client").$Enums.ActivityType;
        title: string;
        date: Date;
        icon: string | null;
    }>;
    deleteActivity(id: string): Promise<{
        message: string;
    }>;
}
