import { ObjectId } from 'mongodb';
// import { ISODate } from 'mongodb/src/bson';
import { Employee } from './Employee';
import { Model, MongoDoc } from './MongoDoc';

export interface Vacation extends Model {
  start: Date;
  length: number;
  employee: Employee;
}

export interface VacationMongo extends MongoDoc {
  start: Date;
  length: number;
  employee: ObjectId;
}
