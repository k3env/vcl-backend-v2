import { Collection, WithId, ObjectId, Filter, OptionalUnlessRequiredId, WithoutId, Document } from 'mongodb';
import { Request, Response, Router, json, urlencoded } from 'express';
import { ManyResponse, SingleResponse, DeleteResponse, ErrorResponse, BaseResponse } from '../models/Responses';
import { Model, MongoDoc } from '../models/MongoDoc';

type HookType = 'index' | 'get' | 'store' | 'remove';
type OutType<T> = T | T[] | { id: string };
type OutFuncType<T> = (data: OutType<T>) => OutType<T>;

export class BaseController<TDoc extends MongoDoc, TModel extends Model> {
  protected static strings(id: string): Record<string, string> {
    return {
      NOT_FOUND: `${id} not found`,
      MISSING_BODY: 'Undefined body',
      ADDED: 'Added',
      OK: 'Ok',
      UPDATED: 'Updated',
      DELETED: 'Deleted',
      EXCEPTION: 'Undefined error',
    };
  }

  private hooks: Record<HookType, OutFuncType<TDoc> | null>;
  protected pipeline: Document[];
  protected queryPipeline: Document[];

  private validate: (_m: unknown | undefined) => boolean;
  private resolve: (_m: unknown) => TDoc;
  private merge: (a: WithId<TDoc>, b: Partial<TDoc>) => WithoutId<TDoc>;

  protected collection: Collection<TDoc>;
  private router: Router;
  constructor(
    collection: Collection<TDoc>,
    validator: (m: unknown | undefined) => boolean,
    resolver: (m: unknown) => TDoc,
    merger: (a: WithId<TDoc>, b: Partial<TDoc>) => WithoutId<TDoc>,
    pipeline?: Document[],
    query?: Document[],
    hooks?: Record<HookType, OutFuncType<TDoc> | null>,
  ) {
    this.hooks = hooks ?? {
      get: null,
      index: null,
      remove: null,
      store: null,
    };
    this.collection = collection;
    this.validate = validator;
    this.resolve = resolver;
    this.merge = merger;

    this.pipeline = pipeline ?? [];
    this.queryPipeline = query ?? [];

    this.router = Router({ mergeParams: true })
      .use(json())
      .use(urlencoded({ extended: true }))
      .get('/', (req: Request, res: Response) => {
        this.index(req, res);
      })
      .get('/:id', (req: Request, res: Response) => {
        this.get(req, res);
      })
      .post('/', (req: Request, res: Response) => {
        this.store(req, res);
      })
      .put('/:id', (req: Request, res: Response) => {
        this.store(req, res);
      })
      .patch('/:id', (req: Request, res: Response) => {
        this.store(req, res);
      })
      .delete('/:id', (req: Request, res: Response) => {
        this.remove(req, res);
      });
  }

  async index(req: Request, res: Response): Promise<void> {
    const { expand } = req.query;
    const fnAggregate = expand !== undefined ? [...this.queryPipeline, ...this.pipeline] : this.queryPipeline;
    const list = await this.collection.aggregate<TModel>(fnAggregate).toArray();

    const body = new ManyResponse<TModel>(200, BaseController.strings('').OK, list);
    this._send(res, body);
  }
  async get(req: Request, res: Response): Promise<void> {
    const { expand } = req.query;
    const { id } = req.params;

    try {
      const idMatch = { $match: { _id: new ObjectId(id) } };
      const _pipeline = expand ? [...this.queryPipeline, ...this.pipeline, idMatch] : [...this.queryPipeline, idMatch];
      const e = await this.collection.aggregate<TModel>(_pipeline).next();
      const body = e
        ? new SingleResponse<TModel>(200, BaseController.strings(id).OK, e)
        : new ErrorResponse(404, BaseController.strings(id).NOT_FOUND);
      this._send(res, body);
    } catch (error) {
      this._send(res, { status: 500, message: (error as Error).message });
    }
  }
  async store(req: Request, res: Response): Promise<void> {
    const data = req.body as TDoc;
    if (!this.validate(data)) {
      this._send(res, new ErrorResponse(400, BaseController.strings('').MISSING_BODY));
      return;
    }
    this.resolve(data);
    const { id } = req.params;
    const idFilter = {
      _id: new ObjectId(id),
    } as Filter<TDoc>;

    if (id) {
      // TODO: PUT/PATCH here
      const idMatch = { $match: { _id: new ObjectId(id) } };
      const empl = await this.collection.aggregate<TDoc>([...this.queryPipeline, idMatch]).next();
      if (empl) {
        const update = this.merge(empl as WithId<TDoc>, data);
        const result = await this.collection.replaceOne(idFilter, update, {});
        if (result.acknowledged) {
          this._send(
            res,
            new SingleResponse<TDoc>(200, BaseController.strings(id).UPDATED, {
              ...update,
              _id: new ObjectId(id),
            } as TDoc),
          );
        } else {
          this._send(res, new ErrorResponse(500, BaseController.strings(id).EXCEPTION));
        }
      } else {
        this._send(res, new ErrorResponse(404, BaseController.strings(id).NOT_FOUND));
      }
    } else {
      // TODO: POST here
      const result = await this.collection.insertOne(data as OptionalUnlessRequiredId<TDoc>);
      if (result.acknowledged) {
        this._send(
          res,
          new SingleResponse<TDoc>(200, BaseController.strings(id).ADDED, {
            _id: result.insertedId,
            ...data,
          }),
        );
      } else {
        this._send(res, new ErrorResponse(500, BaseController.strings(id).EXCEPTION));
      }
    }
  }
  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const idFilter = {
      _id: new ObjectId(id),
    } as Filter<TDoc>;

    const empl = await this.collection.findOne(idFilter);
    if (empl) {
      const result = await this.collection.deleteOne(idFilter);
      if (result.acknowledged) {
        this._send(res, new DeleteResponse(200, BaseController.strings(id).DELETED, { id: id }));
      } else {
        this._send(res, new ErrorResponse(500, BaseController.strings(id).EXCEPTION));
      }
    } else {
      this._send(res, new ErrorResponse(404, BaseController.strings(id).NOT_FOUND));
    }
  }
  public mount(segment: string, router: Router): void {
    this.router = this.router.use(segment, router);
  }
  public get apiRouter(): Router {
    return this.router;
  }

  private _send(res: Response, body: BaseResponse): void {
    res.status(body.status).send(body);
  }
}
