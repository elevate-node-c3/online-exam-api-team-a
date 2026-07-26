import { DatabaseRepo } from './db.repo';
import { IDiploma } from '../types/diploma.types';
import { Diploma } from '../../models/diploma.model';
export class DiplomaRepo extends DatabaseRepo<IDiploma> {
  constructor() {
    super(Diploma);
  }
}

export const diplomaRepo = new DiplomaRepo();
