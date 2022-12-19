import { ObjectId, Document } from 'mongodb';
export interface MongoDoc extends Document {
  _id?: ObjectId;
}

export interface Model {
  _id: ObjectId;
}
