import { ApiProperty } from "@nestjs/swagger";

export class GetUsersOfWorkspaceResponseDto {
  @ApiProperty({
    description: 'ID dell\'utente'
  })
  userId!: string;
  @ApiProperty({
    description: 'Username dell\'utente'
  })
  username!: string;
  @ApiProperty({
    description: 'Ruolo dell\'utente nel workspace'
  })
  role!: string;
}
