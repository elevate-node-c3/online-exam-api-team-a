import { IUser } from '../types/user.types.js';
import { User } from '../../models/user.model.js';
import { DatabaseRepo } from './db.repo.js';
export class UserRepo extends DatabaseRepo<IUser> {
  constructor() {
    super(User);
  }
}

export const userRepo = new UserRepo();
