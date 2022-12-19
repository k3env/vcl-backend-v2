import { ObjectId } from 'mongodb';
import { JobTitle } from './JobTitle';
import { Model, MongoDoc } from './MongoDoc';
import { Vacation } from './Vacation';

export interface Employee extends Model {
  name: string;
  color: string;
  title: JobTitle;
  vacations: Vacation[];
  maxDays: number;
  onVacation: number;
}

export interface EmployeeMongo extends MongoDoc {
  name: string;
  color: string;
  title: ObjectId;
  vacations: ObjectId[];
  maxDays: number;
  onVacation: number;
}
