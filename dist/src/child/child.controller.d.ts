import { ChildService } from './child.service';
import { CreateChildDto, UpdateChildDto } from './dto';
export declare class ChildController {
    private readonly childService;
    constructor(childService: ChildService);
    create(req: any, dto: CreateChildDto): Promise<{
        success: boolean;
        data: {
            id: any;
            chdrNumber: any;
            firstName: any;
            lastName: any;
            dateOfBirth: any;
            gender: any;
            photoUri: any;
            birthWeight: any;
            birthHeight: any;
            birthHeadCircumference: any;
            bloodType: string;
            placeOfBirth: any;
            deliveryType: any;
            allergies: any;
            specialConditions: any;
            motherName: any;
            fatherName: any;
            emergencyContact: any;
            address: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    findAll(req: any): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    findOne(req: any, id: string): Promise<{
        success: boolean;
        data: {
            id: any;
            chdrNumber: any;
            firstName: any;
            lastName: any;
            dateOfBirth: any;
            gender: any;
            photoUri: any;
            birthWeight: any;
            birthHeight: any;
            birthHeadCircumference: any;
            bloodType: string;
            placeOfBirth: any;
            deliveryType: any;
            allergies: any;
            specialConditions: any;
            motherName: any;
            fatherName: any;
            emergencyContact: any;
            address: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    update(req: any, id: string, dto: UpdateChildDto): Promise<{
        success: boolean;
        data: {
            id: any;
            chdrNumber: any;
            firstName: any;
            lastName: any;
            dateOfBirth: any;
            gender: any;
            photoUri: any;
            birthWeight: any;
            birthHeight: any;
            birthHeadCircumference: any;
            bloodType: string;
            placeOfBirth: any;
            deliveryType: any;
            allergies: any;
            specialConditions: any;
            motherName: any;
            fatherName: any;
            emergencyContact: any;
            address: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    partialUpdate(req: any, id: string, dto: UpdateChildDto): Promise<{
        success: boolean;
        data: {
            id: any;
            chdrNumber: any;
            firstName: any;
            lastName: any;
            dateOfBirth: any;
            gender: any;
            photoUri: any;
            birthWeight: any;
            birthHeight: any;
            birthHeadCircumference: any;
            bloodType: string;
            placeOfBirth: any;
            deliveryType: any;
            allergies: any;
            specialConditions: any;
            motherName: any;
            fatherName: any;
            emergencyContact: any;
            address: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    remove(req: any, id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
