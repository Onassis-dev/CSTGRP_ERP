import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import sql from 'src/utils/db';
import { FastifyRequest } from 'fastify';
import { sendError } from 'src/utils/errors';
import { cookieConfig } from 'src/utils/cookies';

type permissionType =
  | 'users'
  | 'employees'
  | 'productivity'
  | 'assistance'
  | 'structure'
  | 'it'
  | 'requisitions'
  | 'materialmovements'
  | 'poimp'
  | 'inventorystats'
  | 'petitions'
  | 'inventory'
  | 'formats'
  | 'directory'
  | 'purchases'
  | 'docs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly requiredPermission: permissionType) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const req: FastifyRequest & { userId: string } = httpContext.getRequest();
    const res = httpContext.getResponse();

    const token = req.cookies.token;
    if (!token) throw new HttpException('Inicie sesion', 401);

    const methods = {
      GET: 1,
      POST: 2,
      PUT: 2,
      DELETE: 2,
    };

    try {
      const user: any = await jwt.verify(token, process.env.JWT_SECRET);
      const [{ perm }] =
        await sql`select ${sql('perm_' + this.requiredPermission)} as perm from "users" where "id" = ${user.id}`;

      const [userperms] = await sql`select * from users where id = ${user.id}`;
      if (!userperms) return sendError('Usuario invalido', 400);

      res
        // .setCookie('perms', user, cookieConfig)
        .setCookie('areas', userperms.perm_assistance_areas, cookieConfig);
      req.userId = user.id;
      return perm >= methods[req.method];
    } catch (err) {
      throw new HttpException('Token invalido', 401);
    }
  }
}
