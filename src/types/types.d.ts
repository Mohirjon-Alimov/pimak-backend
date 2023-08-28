export {};

declare global {
  namespace Express {
    interface Request {
      filtered: {
        id?: string;
        username?: string;
        password?: string;
      };
    }
    interface MulterRequest extends Request {
      files: any;
    }
  }
}
