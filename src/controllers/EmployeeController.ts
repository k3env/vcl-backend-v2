import { ObjectId, WithId, WithoutId } from 'mongodb';
import { getColletcion } from '../db/Db';
import { Employee, EmployeeMongo } from '../models/Employee';
import { BaseController } from './BaseController';

export class EmployeeController extends BaseController<
  EmployeeMongo,
  Employee
> {
  private static validator(_m: unknown): boolean {
    if (_m) {
      const m = _m as EmployeeMongo;
      return (!!m.name && !!m.color && !!m.title) === true;
    } else {
      return false;
    }
  }
  private static resolver(_m: unknown): EmployeeMongo {
    const m: EmployeeMongo = _m as EmployeeMongo;
    m.title = new ObjectId((_m as EmployeeMongo).title);
    return m;
  }
  private static merger(
    a: WithId<EmployeeMongo>,
    b: Partial<EmployeeMongo>,
  ): WithoutId<EmployeeMongo> {
    const c = { ...a, ...b } as EmployeeMongo;
    delete c._id;
    return c;
  }
  constructor() {
    const pipe = [
      {
        $lookup: {
          from: 'job_titles',
          localField: 'title',
          foreignField: '_id',
          as: 'title',
        },
      },
      {
        $lookup: {
          from: 'vacations',
          localField: 'vacations',
          foreignField: '_id',
          as: 'vacations',
        },
      },
      {
        $unwind: {
          path: '$title',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    const query = [
      {
        $lookup: {
          from: 'vacations',
          localField: '_id',
          foreignField: 'employee',
          as: 'vacations',
        },
      },
      {
        $addFields: {
          vacations: {
            $map: {
              input: '$vacations',
              as: 'v',
              in: '$$v._id',
            },
          },
          onVacation: {
            $sum: '$vacations.length',
          },
        },
      },
    ];
    super(
      getColletcion<EmployeeMongo>('employees'),
      EmployeeController.validator,
      EmployeeController.resolver,
      EmployeeController.merger,
      pipe,
      query,
    );
  }
}
