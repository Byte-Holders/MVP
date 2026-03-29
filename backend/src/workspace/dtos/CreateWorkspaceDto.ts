import { IsAlphanumeric, IsNotEmpty } from 'class-validator';

export class CreateWorkspaceDto {
    @IsNotEmpty()
    @IsAlphanumeric()
    name: string;
}