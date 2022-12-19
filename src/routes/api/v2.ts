import { Request, Response, Router } from 'express';
import { EmployeeController } from '../../controllers/EmployeeController';
import { JobTitleController } from '../../controllers/JobTitleController';
import { VacationController } from '../../controllers/VacationController';
const v2Router = Router();

const vacationController = new VacationController();
const employeeController = new EmployeeController();
const jobTitleController = new JobTitleController();

v2Router.use((req: Request, res: Response, next: () => void) => {
  console.log(
    `${req.ip} - ${req.method} - ${req.url} - ${req.res?.statusCode}`,
  );
  next();
});
v2Router.use('/employee', employeeController.apiRouter);
v2Router.get('/employee/:employee/vacation', (req: Request, res: Response) => {
  vacationController.employeeIndex(req, res);
});
v2Router.use('/job_title', jobTitleController.apiRouter);
v2Router.use('/vacation', vacationController.apiRouter);
v2Router.get('/', ({ res }) => {
  res?.send({ version: 'v2' });
});

export { v2Router };
