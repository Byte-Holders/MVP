import { ApiProperty } from "@nestjs/swagger";

export class CreateUserResponseDto {
  @ApiProperty({
    description: "ID dell'utente",
  })
  _id!: string;
  @ApiProperty({
    description: "ID dell'utente",
  })
  sub!: string;
  @ApiProperty({
    description: "Username dell'utente",
  })
  username!: string;
  @ApiProperty({
    description: "Email dell'utente",
  })
  email!: string;
}
