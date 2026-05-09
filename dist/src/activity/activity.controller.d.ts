import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    private getActor;
    getActivities(req: any): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    getChildActivities(req: any, childId: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    getActivity(req: any, id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    createActivity(req: any, childId: string, dto: CreateActivityDto): Promise<{
        success: boolean;
        data: {
            id: string;
            childId: string;
            type: import("@prisma/client").$Enums.ActivityType;
            title: string;
            description: string | null;
            date: Date;
            icon: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateActivity(req: any, id: string, dto: UpdateActivityDto): Promise<{
        success: boolean;
        data: {
            id: string;
            childId: string;
            type: import("@prisma/client").$Enums.ActivityType;
            title: string;
            description: string | null;
            date: Date;
            icon: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    deleteActivity(req: any, id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
