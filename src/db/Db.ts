import { EmployeeMongo } from './../models/Employee';
import { MongoClient, Collection } from 'mongodb';
import { JobTitleMongo } from '../models/JobTitle';
import { VacationMongo } from '../models/Vacation';
import { MongoDoc } from '../models/MongoDoc';
// import { connect as mgsconn, model } from 'mongoose';

type connectReturnType = {
  employees: Collection<EmployeeMongo>;
  vacations: Collection<VacationMongo>;
  jobtitles: Collection<JobTitleMongo>;
};

type AvailableCollections = 'employees' | 'job_titles' | 'vacations';

const uri =
  'mongodb://10.109.0.11:27017/?readPreference=primary&directConnection=true&ssl=false';
// Create a new MongoClient
const client = new MongoClient(uri);
async function connect(): Promise<connectReturnType> {
  await client.connect();
  const db = client.db('vcl');
  const employeeCollection = db.collection<EmployeeMongo>('employees');
  const jobTitleCollection = db.collection<JobTitleMongo>('job_titles');
  const vacationCollection = db.collection<VacationMongo>('vacations');

  return {
    employees: employeeCollection,
    vacations: vacationCollection,
    jobtitles: jobTitleCollection,
  };
}

function getColletcion<TDoc extends MongoDoc>(
  collection: AvailableCollections,
): Collection<TDoc> {
  client.connect();
  const db = client.db('vcl');
  return db.collection<TDoc>(collection);
}
// async function connectMongoose() {
//   mgsconn(
//     'mongodb://10.109.0.11:27017/?readPreference=primary&directConnection=true&ssl=false',
//   );
//   const EmployeeModel = model('employees', {
//     name: String;
//   color: String;
//   title: ObjectId;
//   vacations: ObjectId[];
//   });
// }

export { connect, getColletcion };
