import {
  Model,
  AnyKeys,
  CreateOptions,
  HydratedDocument,
  QueryFilter,
  ProjectionType,
  QueryOptions,
  FlattenMaps,
  UpdateQuery,
  UpdateWriteOpResult,
  MongooseUpdateQueryOptions,
  mongo,
} from 'mongoose';

export abstract class DatabaseRepo<RawDoc> {
  constructor(protected readonly model: Model<RawDoc>) {
    this.model = model;
  }

  async create({
    data,
    options,
  }: {
    data: AnyKeys<RawDoc>;
    options?: CreateOptions;
  }): Promise<HydratedDocument<RawDoc>>;

  async create({
    data,
    options,
  }: {
    data: AnyKeys<RawDoc>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<RawDoc>[]>;

  public async create({
    data,
    options,
  }: {
    data: AnyKeys<RawDoc> | AnyKeys<RawDoc>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<RawDoc>[] | HydratedDocument<RawDoc>> {
    const payload = await this.model.create(
      Array.isArray(data) ? data : [data],
      options,
    );
    return Array.isArray(data) ? payload : payload[0]!;
  }

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: (QueryOptions<RawDoc> & { lean: false }) | null | undefined;
  }): Promise<HydratedDocument<RawDoc> | null>;

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: (QueryOptions<RawDoc> & { lean: true }) | null | undefined;
  }): Promise<FlattenMaps<RawDoc> | null>;

  public async findOne({
    filter,
    options,
    projection,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: QueryOptions<RawDoc> | null | undefined;
  }): Promise<HydratedDocument<RawDoc> | FlattenMaps<RawDoc> | null> {
    const payload = await this.model.findOne(filter, projection, options);
    return payload;
  }
  async find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: QueryOptions<RawDoc> & { lean: false };
  }): Promise<HydratedDocument<RawDoc>[] | null>;

  async find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: QueryOptions<RawDoc> & { lean: true };
  }): Promise<FlattenMaps<RawDoc>[] | null>;

  public async find({
    filter,
    options,
    projection,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: QueryOptions<RawDoc>;
  }): Promise<HydratedDocument<RawDoc>[] | FlattenMaps<RawDoc>[] | null> {
    const payload = await this.model.find(filter, projection, options);
    return payload;
  }

  public async paginate({
    filter,
    options,
    projection,
    page,
    size,
  }: {
    filter: QueryFilter<RawDoc>;
    projection?: ProjectionType<RawDoc> | undefined;
    options: QueryOptions<RawDoc>;
    page: number | string | undefined;
    size: number | string | undefined;
  }) {
    let count = 0;
    if (Number(page) > 0) {
      const pageNumber = Number(page as string);
      const parsedSize = Number(size as string);
      options.skip = (pageNumber - 1) * parsedSize;
      options.limit = parsedSize;
      count = await this.model.countDocuments(filter);
    }

    const docs = await this.find({
      filter: filter || {},
      projection,
      options: options as QueryOptions<RawDoc> & { lean: false },
    });

    return {
      docs,
      meta: {
        ...(Number(page) > 0
          ? {
              count,
              page,
              size,
              pages: Math.ceil(count / Number(size)),
            }
          : {}),
      },
    };
  }

  public async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<RawDoc>;
    update: UpdateQuery<RawDoc>;
    options?: mongo.UpdateOptions & MongooseUpdateQueryOptions<RawDoc>;
  }): Promise<UpdateWriteOpResult>;

  public async updateOne({
    filter,
    update,
  }: {
    filter: QueryFilter<RawDoc>;
    update: UpdateQuery<RawDoc>;
  }): Promise<UpdateWriteOpResult>;

  public async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<RawDoc>;
    update: UpdateQuery<RawDoc>;
    options?: mongo.UpdateOptions & MongooseUpdateQueryOptions<RawDoc>;
  }): Promise<UpdateWriteOpResult> {
    return this.model.updateOne(filter, update, options);
  }

  public async deleteOne({
    filter,
  }: {
    filter: QueryFilter<RawDoc>;
  }): Promise<mongo.DeleteResult> {
    return this.model.deleteOne(filter);
  }
}
