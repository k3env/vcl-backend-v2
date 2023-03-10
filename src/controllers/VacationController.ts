import { ObjectId, WithId, WithoutId } from 'mongodb';
import { VacationMongo, Vacation } from '../models/Vacation';
import { BaseController } from './BaseController';
import { Request, Response } from 'express';
import { ManyResponse } from '../models/Responses';
import { getColletcion } from '../db/Db';

export class VacationController extends BaseController<VacationMongo, Vacation> {
  private static validator(_m: unknown): boolean {
    if (_m) {
      const m = _m as VacationMongo;
      return (!!m.start && !!m.length && !!m.employee) === true;
    } else {
      return false;
    }
  }
  private static resolver(_m: unknown): VacationMongo {
    const m: VacationMongo = _m as VacationMongo;
    m.employee = new ObjectId(m.employee);
    m.start = new Date(m.start);
    return m;
  }
  private static merger(a: WithId<VacationMongo>, b: Partial<VacationMongo>): WithoutId<VacationMongo> {
    const c = { ...a, ...b } as VacationMongo;
    delete c._id;
    return c;
  }
  constructor() {
    const pipe = [
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee',
        },
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    super(
      getColletcion<VacationMongo>('vacations'),
      VacationController.validator,
      VacationController.resolver,
      VacationController.merger,
      pipe,
    );
  }
  async employeeIndex(req: Request, res: Response): Promise<void> {
    const { expand } = req.query;
    const { employee } = req.params;
    const employeeMatch = {
      $match: {
        employee: new ObjectId(employee),
      },
    };
    const list = await this.collection
      .aggregate<Vacation>(
        expand !== undefined
          ? [employeeMatch, ...this.queryPipeline, ...this.pipeline]
          : [employeeMatch, ...this.queryPipeline],
      )
      .toArray();

    const body = new ManyResponse<Vacation>(200, BaseController.strings('').OK, list);
    res.send(body);
  }
}
