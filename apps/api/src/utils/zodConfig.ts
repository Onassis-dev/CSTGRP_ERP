import z from 'zod/v4';

z.config({
  customError: ({ code, input, expected }) => {
    if (code === 'invalid_type') {
      if (input === 'null' || input === 'undefinded') return 'Faltante';
      if (expected === 'number') return 'Numero invalido';
      if (expected === 'string') return 'Texto invalido';
    }

    return 'incorrecto';
  },
});
