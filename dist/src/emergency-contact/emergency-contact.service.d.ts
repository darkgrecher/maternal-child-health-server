import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto';
export declare class EmergencyContactService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserContacts(userId: string): Promise<{
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
    }[]>;
    getContact(userId: string, contactId: string): Promise<{
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
    }>;
    createContact(userId: string, dto: CreateEmergencyContactDto): Promise<{
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
    }>;
    updateContact(userId: string, contactId: string, dto: UpdateEmergencyContactDto): Promise<{
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
    }>;
    deleteContact(userId: string, contactId: string): Promise<{
        message: string;
    }>;
    setPrimaryContact(userId: string, contactId: string): Promise<{
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
    }>;
}
