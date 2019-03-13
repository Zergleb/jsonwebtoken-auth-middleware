import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default function(publicCert: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const headerToken = req.get('Authorization');
    const authToken = headerToken ? headerToken.replace('Bearer ', '') : '';
    jwt.verify(authToken, publicCert, (err, decoded) => {
      // tslint:disable-next-line:no-object-mutation
      req.jwt = decoded;
      if (err) {
        res.status(401).send();
      } else {
        next();
      }
    });
  };
}
