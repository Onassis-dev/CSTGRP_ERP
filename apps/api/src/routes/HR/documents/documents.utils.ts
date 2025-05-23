export function numberToWords(num) {
  const unidades = [
    '',
    'Uno',
    'Dos',
    'Tres',
    'Cuatro',
    'Cinco',
    'Seis',
    'Siete',
    'Ocho',
    'Nueve',
  ];
  const especiales = [
    'Diez',
    'Once',
    'Doce',
    'Trece',
    'Catorce',
    'Quince',
    'Dieciséis',
    'Diecisiete',
    'Dieciocho',
    'Diecinueve',
  ];
  const decenas = [
    '',
    'Diez',
    'Veinte',
    'Treinta',
    'Cuarenta',
    'Cincuenta',
    'Sesenta',
    'Setenta',
    'Ochenta',
    'Noventa',
  ];
  const centenas = [
    '',
    'Cien',
    'Doscientos',
    'Trescientos',
    'Cuatrocientos',
    'Quinientos',
    'Seiscientos',
    'Setecientos',
    'Ochocientos',
    'Novecientos',
  ];

  if (typeof num !== 'number' || isNaN(num)) return 'cero';

  if (num === 0) return 'cero';

  const convertirMenor1000 = (n) => {
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    let texto = '';

    if (c > 0) {
      if (c === 1 && d === 0 && u === 0) texto += 'cien';
      else texto += centenas[c] + ' ';
    }

    if (d === 1) texto += especiales[u];
    else {
      if (d > 0) texto += decenas[d];
      if (d > 0 && u > 0) texto += ' y ';
      if (u > 0) texto += unidades[u];
    }

    return texto.trim();
  };

  const partes = [];

  if (num >= 1000000) {
    const millones = Math.floor(num / 1000000);
    partes.push(
      millones === 1 ? 'un millón' : `${numberToWords(millones)} millones`,
    );
    num = num % 1000000;
  }
  if (num >= 1000) {
    const miles = Math.floor(num / 1000);
    if (miles === 1) partes.push('mil');
    else partes.push(`${numberToWords(miles)} mil`);
    num = num % 1000;
  }
  if (num > 0) {
    partes.push(convertirMenor1000(num));
  }

  return partes.join(' ').trim();
}
