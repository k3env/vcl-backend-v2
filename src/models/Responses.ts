import { ObjectId } from 'mongodb';

export class BaseResponse {
  constructor(public status: number, public message: string) {}
}

export class SingleResponse<T> extends BaseResponse {
  constructor(public status: number, public message: string, public data: T) {
    super(status, message);
  }
}

export class ManyResponse<T> extends BaseResponse {
  constructor(public status: number, public message: string, public data: T[]) {
    super(status, message);
  }
}

export class DeleteResponse extends BaseResponse {
  constructor(
    public status: number,
    public message: string,
    public data: { id: number | string | ObjectId },
  ) {
    super(status, message);
  }
}
export class ErrorResponse extends BaseResponse {
  constructor(public status: number, public message: string) {
    super(status, message);
  }
}
