declare namespace Express {
  export interface Request {
    jwt: string | object;
  }
}
