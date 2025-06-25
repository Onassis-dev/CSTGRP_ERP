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

function cleanValues(values) {
  for (const key of Object.keys(values)) {
    if (values[key] === '') {
      values[key] = null;
    } else if (typeof values[key] === 'string') {
      values[key] = values[key].trim();
    } else if (typeof values[key] === 'object' && values[key] !== null) {
      cleanValues(values[key]);
    }
  }
}
