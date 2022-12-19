import { WithId, WithoutId } from 'mongodb';
import { getColletcion } from '../db/Db';
import { JobTitleMongo, JobTitle } from '../models/JobTitle';
import { BaseController } from './BaseController';

export class JobTitleController extends BaseController<
  JobTitleMongo,
  JobTitle
> {
  private static validator(_m: unknown): boolean {
    if (_m) {
      const m = _m as JobTitleMongo;
      return !!m.title === true;
    } else {
      return false;
    }
  }
  private static resolver(_m: unknown): JobTitleMongo {
    const m: JobTitleMongo = _m as JobTitleMongo;
    return m;
  }
  private static merger(
    a: WithId<JobTitleMongo>,
    b: Partial<JobTitleMongo>,
  ): WithoutId<JobTitleMongo> {
    const c = { ...a, ...b } as JobTitleMongo;
    delete c._id;
    return c;
  }
  constructor() {
    super(
      getColletcion<JobTitleMongo>('job_titles'),
      JobTitleController.validator,
      JobTitleController.resolver,
      JobTitleController.merger,
    );
  }
}
