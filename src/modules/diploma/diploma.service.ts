import {
  DiplomaRepo,
  diplomaRepo,
} from '../../common/repositories/diploma.repo';
import { createDiplomaDTO } from '../../common/schemas/diploma.schema';
import { DiplomaData } from '../../common/types/diploma.types';

type DiplomaRecord = {
  _id: unknown;
  diplomaName: string;
  diplomaDescription: string;
  photo?: string;
};

export class DiplomaService {
  constructor(private readonly diplomaRepo: DiplomaRepo) {}

  private toDiplomaData(diploma: DiplomaRecord): DiplomaData {
    return {
      diplomaId: String(diploma._id),
      diplomaName: diploma.diplomaName,
      diplomaDescription: diploma.diplomaDescription,
      photo: diploma.photo
        ? `/uploads/diploma-photos/${encodeURIComponent(diploma.photo)}`
        : null,
    };
  }

  async createDiploma(
    dto: createDiplomaDTO,
    photo?: Express.Multer.File,
  ): Promise<DiplomaData> {
    const diploma = await this.diplomaRepo.create({
      data: {
        ...dto,
        ...(photo && { photo: photo.filename }),
      },
    });

    return this.toDiplomaData(diploma);
  }

  async getDiplomas(): Promise<DiplomaData[]> {
    const diplomas = await this.diplomaRepo.find({
      filter: {},
      projection: {
        diplomaName: 1,
        diplomaDescription: 1,
        photo: 1,
      },
      options: { lean: true },
    });

    return (diplomas ?? []).map((diploma) =>
      this.toDiplomaData(diploma as DiplomaRecord),
    );
  }
}

export const diplomaService = new DiplomaService(diplomaRepo);
