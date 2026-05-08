import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    getChildActivities(childId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        }[];
    }>;
    getActivity(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        };
    }>;
    createActivity(childId: string, dto: CreateActivityDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        };
    }>;
    updateActivity(id: string, dto: UpdateActivityDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        };
    }>;
    deleteActivity(id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
