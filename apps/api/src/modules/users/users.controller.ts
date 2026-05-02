import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UsersService } from "./users.service";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { CreateUserDto } from "./dto/create-user.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles("SUPER_ADMIN")
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles("SUPER_ADMIN")
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Roles("SUPER_ADMIN")
  @Post(":userId/assign-role")
  assignRole(
    @Param("userId") userId: string,
    @Body() dto: AssignRoleDto
  ) {
    return this.usersService.assignRole(userId, dto.roleCode);
  }
}
