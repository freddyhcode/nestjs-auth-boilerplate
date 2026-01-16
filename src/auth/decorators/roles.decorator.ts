import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/enums/user-role.enum';
import { ROLES_KEY } from '../constants/roles.constant';

export const Roles = (...roles: UserRole[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
