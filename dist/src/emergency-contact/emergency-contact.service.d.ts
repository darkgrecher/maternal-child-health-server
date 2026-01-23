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
        userId: string;
        address: string | null;
        notes: string | null;
        role: string;
        phone: string;
        isPrimary: boolean;
        isDefault: boolean;
    }[]>;
    getContact(userId: string, contactId: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        address: string | null;
        notes: string | null;
        role: string;
        phone: string;
        isPrimary: boolean;
        isDefault: boolean;
    }>;
    createContact(userId: string, dto: CreateEmergencyContactDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        address: string | null;
        notes: string | null;
        role: string;
        phone: string;
        isPrimary: boolean;
        isDefault: boolean;
    }>;
    updateContact(userId: string, contactId: string, dto: UpdateEmergencyContactDto): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        address: string | null;
        notes: string | null;
        role: string;
        phone: string;
        isPrimary: boolean;
        isDefault: boolean;
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
        userId: string;
        address: string | null;
        notes: string | null;
        role: string;
        phone: string;
        isPrimary: boolean;
        isDefault: boolean;
    }>;
}
