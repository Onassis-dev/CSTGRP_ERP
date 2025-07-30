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
import { permissionsList } from 'src/routes/General/users/users.schema';

type permissionType = keyof typeof permissionsList;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly requiredPermission?: permissionType) {}

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
      const decoded: any = await jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;

      const [user] = await sql`select * from users where id = ${decoded.id}`;
      if (!user) return sendError('Usuario invalido', 400);

      if (!this.requiredPermission) return true;

      res.setCookie('areas', user.perm_assistance_areas, cookieConfig);

      return user.permissions[this.requiredPermission] >= methods[req.method];
    } catch (err) {
      throw new HttpException('Token invalido', 401);
    }
  }
}
