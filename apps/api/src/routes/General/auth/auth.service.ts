import { Injectable } from '@nestjs/common';
import { loginSchema } from './auth.schema';
import { z } from 'zod';
import sql from 'src/utils/db';
import bcrypt from 'bcrypt';
import { Secret } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { sendError } from 'src/utils/errors';
import dotenv from 'dotenv';
import { cookieConfig, httpCookieConfig } from 'src/utils/cookies';
import { ContextProvider } from 'src/interceptors/context.provider';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(private readonly req: ContextProvider) {}

  async loginUser(body: z.infer<typeof loginSchema>, res, ip) {
    let location = '';
    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      if (response.ok) {
        const data = await response.json();
        location = `${data.city}, ${data.region}, ${data.country}`;
      }
    } catch (error) {
      console.error('Error obteniendo localización:', error);
    }

    const [user] =
      await sql`select * from users where username = ${body.username}`;
    if (!user) {
      await this.req.record(
        `Login fallido, no existe el usuario: ${body.username}, IP: ${ip}, ${location}`,
        null,
        'delete',
      );
      return sendError('Usuario invalido', 400);
    }

    const match = await bcrypt.compare(body.password, user.password);
    if (!match) {
      this.req.record(
        `Login fallido de: ${body.username}, contraseña incorrecta, IP: ${ip}, ${location}`,
        null,
        'delete',
      );
      return sendError('Contraseña incorrecta', 400);
    }

    const secret: Secret = process.env.JWT_SECRET || 'sin secreto';

    let token;
    if (user.username === 'kiosko') {
      token = jwt.sign(user, secret, { expiresIn: '365d' });
    } else {
      token = jwt.sign(user, secret, { expiresIn: '200h' });
    }

    res.setCookie('token', token, httpCookieConfig);
    delete user.password;
    Object.keys(user).forEach((key) => {
      res.setCookie(key, user[key], cookieConfig);
    });

    await this.req.record(
      `${body.username} inicio sesion, IP: ${ip}, ${location}`,
    );
    res.send();
  }

  async logoutUser(res) {
    res
      .setCookie('token', '', httpCookieConfig)
      .setCookie('username', '', cookieConfig)
      .send();
  }
}
