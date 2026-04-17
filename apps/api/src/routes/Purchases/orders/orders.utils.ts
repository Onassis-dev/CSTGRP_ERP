export function formatNumber(value: number, decimals: number = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value));
}

const normalizeMeasurement = (measurement: string | null | undefined) =>
  measurement?.toLowerCase().replace(/[-\s.,_]/g, '') || '';

const distances = {
  metro: 1,
  mt: 1,
  mts: 1,
  mm: 0.001,
  yd: 0.9144,
  yds: 0.9144,
  ft: 0.3048,
  pies: 0.3048,
  in: 0.0254,
  pulgadas: 0.0254,
};

const weights = {
  kg: 1,
  kgs: 1,
  lb: 0.453592,
  lbs: 0.453592,
};

const volumes = {
  lt: 1,
  lts: 1,
  gal: 3.78541,
  gals: 3.78541,
};

export function convertMeasurements({
  amount,
  from,
  to,
}: {
  amount: number;
  from: string;
  to: string;
}): number {
  const fromMeasurement = normalizeMeasurement(from);
  const toMeasurement = normalizeMeasurement(to);

  if (distances[fromMeasurement] && distances[toMeasurement]) {
    return amount * (distances[fromMeasurement] / distances[toMeasurement]);
  }

  if (weights[fromMeasurement] && weights[toMeasurement]) {
    return amount * (weights[fromMeasurement] / weights[toMeasurement]);
  }

  if (volumes[fromMeasurement] && volumes[toMeasurement]) {
    return amount * (volumes[fromMeasurement] / volumes[toMeasurement]);
  }

  return amount;
}
