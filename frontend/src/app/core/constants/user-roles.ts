/**
 * User Roles Constants
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  PLAYER: 'PLAYER',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

