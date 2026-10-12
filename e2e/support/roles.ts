import { join } from 'node:path';

/** Users of backend `db/seeds/dev_baseline.rb`; they all share one password */
export const PASSWORD = 'Password1!';

export const ROLES = {
  owner: 'owner@example.com',
  manager: 'manifest@example.com',
  pilot: 'pilot@example.com',
  jumper: 'jumper1@example.com',
  jumper2: 'jumper2@example.com',
  student: 'student@example.com',
} as const;

export type Role = keyof typeof ROLES;

export const API_URL = process.env.UI_API_URL ?? 'http://local.openmanifest.org:5000/graphql';

export const authFile = (role: Role) => join(__dirname, '..', '.auth', `${role}.json`);
