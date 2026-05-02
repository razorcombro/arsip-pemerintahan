export class CreateUserDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  unitId?: string;
  roleCode?: string;
}
