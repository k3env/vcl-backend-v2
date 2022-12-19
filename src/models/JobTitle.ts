import { Model, MongoDoc } from './MongoDoc';
export interface JobTitle extends Model {
  title: string;
}

export interface JobTitleMongo extends MongoDoc {
  title: string;
}
