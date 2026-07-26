import { IUser } from '../types/user.types';
import { User } from '../../models/user.model';
import { DatabaseRepo } from './db.repo';
export class UserRepo extends DatabaseRepo<IUser> {
  constructor() {
    super(User);
  }
}

export const userRepo = new UserRepo();
