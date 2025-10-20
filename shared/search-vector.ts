type NullableString = string | null | undefined;

type CustomerInput = {
  firstName?: NullableString;
  lastName?: NullableString;
  email?: NullableString;
  phone?: NullableString;
};

type VehicleInput = {
  vin?: NullableString;
  make?: NullableString;
  model?: NullableString;
};

function normalizePart(value: NullableString): NullableString {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildVector(parts: NullableString[]): string | null {
  const normalized = parts
    .map((part) => normalizePart(part)?.toLowerCase() ?? null)
    .filter((part): part is string => Boolean(part));

  if (normalized.length === 0) {
    return null;
  }

  return normalized.join(' ');
}

export function buildCustomerSearchVector(input: CustomerInput): string | null {
  return buildVector([input.firstName, input.lastName, input.email, input.phone]);
}

export function buildVehicleSearchVector(input: VehicleInput): string | null {
  return buildVector([input.vin, input.make, input.model]);
}
