import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ZodPiPe implements PipeTransform {
  constructor(private readonly schema: any) {}

  transform(values: any) {
    cleanValues(values);

    const filteredValue = this.schema.parse(values);

    return filteredValue;
  }
}

function cleanValues(value) {
  if (typeof value === 'string') {
    value = value.trim();
    if (value === '') return null;
    else return value;
  }
  if (Array.isArray(value)) return value.map(cleanValues);
  if (typeof value === 'object' && value !== null) {
    for (const key of Object.keys(value)) {
      value[key] = cleanValues(value[key]);
    }
    return value;
  }
  return value;
}
