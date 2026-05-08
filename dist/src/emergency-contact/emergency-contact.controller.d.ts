import { EmergencyContactService } from './emergency-contact.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto';
export declare class EmergencyContactController {
    private readonly emergencyContactService;
    constructor(emergencyContactService: EmergencyContactService);
    getUserContacts(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            phone: string;
            userId: string;
            isPrimary: boolean;
            isDefault: boolean;
            address: string | null;
            notes: string | null;
        }[];
    }>;
    getContact(req: any, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            phone: string;
            userId: string;
            isPrimary: boolean;
            isDefault: boolean;
            address: string | null;
            notes: string | null;
        };
    }>;
    createContact(req: any, dto: CreateEmergencyContactDto): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            phone: string;
            userId: string;
            isPrimary: boolean;
            isDefault: boolean;
            address: string | null;
            notes: string | null;
        };
    }>;
    updateContact(req: any, id: string, dto: UpdateEmergencyContactDto): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            phone: string;
            userId: string;
            isPrimary: boolean;
            isDefault: boolean;
            address: string | null;
            notes: string | null;
        };
    }>;
    deleteContact(req: any, id: string): Promise<{
        message: string;
        success: boolean;
    }>;
    setPrimaryContact(req: any, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            phone: string;
            userId: string;
            isPrimary: boolean;
            isDefault: boolean;
            address: string | null;
            notes: string | null;
        };
    }>;
}
