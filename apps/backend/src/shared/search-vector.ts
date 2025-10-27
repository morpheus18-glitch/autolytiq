type NullableString = string | null | undefined;

const DIACRITIC_REGEX = /\p{Diacritic}/gu;
const TOKEN_SPLIT_REGEX = /[^a-z0-9]+/gu;

function normalizeBase(value: string): string {
  return value
    .normalize('NFKD')
    .replace(DIACRITIC_REGEX, '')
    .toLowerCase();
}

function tokenize(value: NullableString): string[] {
  if (!value) {
    return [];
  }

  const normalized = normalizeBase(value);
  return normalized.split(TOKEN_SPLIT_REGEX).filter(Boolean);
}

function addTokens(target: Set<string>, tokens: string[]) {
  for (const token of tokens) {
    if (token) {
      target.add(token);
    }
  }
}

function addEmailTokens(target: Set<string>, email: NullableString) {
  if (!email) {
    return;
  }

  const normalized = normalizeBase(email);
  addTokens(target, normalized.split(TOKEN_SPLIT_REGEX).filter(Boolean));

  const compact = normalized.replace(/[^a-z0-9]/gu, '');
  if (compact) {
    target.add(compact);
  }
}

function addPhoneTokens(target: Set<string>, phone: NullableString) {
  if (!phone) {
    return;
  }

  addTokens(target, tokenize(phone));

  const digitsOnly = phone.replace(/\D+/gu, '');
  if (digitsOnly.length >= 4) {
    target.add(digitsOnly);
  }
}

function addVinTokens(target: Set<string>, vin: NullableString) {
  if (!vin) {
    return;
  }

  const normalized = normalizeBase(vin);
  addTokens(target, normalized.split(TOKEN_SPLIT_REGEX).filter(Boolean));

  const compact = normalized.replace(/[^a-z0-9]/gu, '');
  if (compact) {
    target.add(compact);
  }
}

function buildVector(tokens: Set<string>): string | null {
  if (tokens.size === 0) {
    return null;
  }

  return Array.from(tokens).sort().join(' ');
}

export type CustomerSearchVectorInput = {
  firstName: NullableString;
  lastName: NullableString;
  email: NullableString;
  phone: NullableString;
};

export function buildCustomerSearchVector(input: CustomerSearchVectorInput): string | null {
  const tokens = new Set<string>();

  addTokens(tokens, tokenize(input.firstName));
  addTokens(tokens, tokenize(input.lastName));
  addEmailTokens(tokens, input.email);
  addPhoneTokens(tokens, input.phone);

  return buildVector(tokens);
}

export type VehicleSearchVectorInput = {
  vin: NullableString;
  make: NullableString;
  model: NullableString;
};

export function buildVehicleSearchVector(input: VehicleSearchVectorInput): string | null {
  const tokens = new Set<string>();

  addVinTokens(tokens, input.vin);
  addTokens(tokens, tokenize(input.make));
  addTokens(tokens, tokenize(input.model));

  return buildVector(tokens);
}
