import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { getTraducction } from 'src/utils/traduction';
import { $ZodError } from 'zod/v4/core';
import z from 'zod/v4';

@Catch($ZodError)
export class ValidationFilter<T extends $ZodError> {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const bodyExists = !!exception.issues[0].path[0];
    const message = `${getTraducction(exception.issues[0].path[0] as string)}: ${exception.issues[0].message}`;

    console.log(exception);
    response.status(HttpStatus.BAD_REQUEST).send({
      errors: bodyExists ? exception.issues : 'No se ah mandado ningun dato',
      message: bodyExists ? message : 'No se ah mandado ningun dato',
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

z.config({
  customError: ({ code, input, expected, minimum, maximum }) => {
    if (code === 'invalid_type') {
      if (!input) return 'Faltante';
      if (expected === 'number') return 'Numero invalido';
      if (expected === 'string') return 'Texto invalido';
    }

    if (code === 'invalid_format') {
      return 'Formato invalido';
    }

    if (code === 'too_small') {
      return `Es muy corto, (minimo: ${minimum})`;
    }

    if (code === 'too_big') {
      return `Es muy grande, (maximo: ${maximum})`;
    }
  },
});
