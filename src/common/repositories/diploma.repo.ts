import { DatabaseRepo } from './db.repo.js';
import { IDiploma } from '../types/diploma.types.js';
import { Diploma } from '../../models/diploma.model.js';
export class DiplomaRepo extends DatabaseRepo<IDiploma> {
  constructor() {
    super(Diploma);
  }
}

export const diplomaRepo = new DiplomaRepo();
