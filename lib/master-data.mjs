const positiveFields = {
  lengthMm: "적재함 길이",
  widthMm: "적재함 폭",
  heightMm: "적재함 높이",
  maxLoadKg: "최대 적재중량",
};

function requiredText(value, label) {
  const text = String(value ?? "").trim();
  return text ? { ok: true, value: text } : { ok: false, error: `${label}을(를) 입력하세요.` };
}

function positiveNumber(value, label) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0
    ? { ok: true, value: number }
    : { ok: false, error: `${label}은(는) 0보다 커야 합니다.` };
}

export function validateVehicle(input) {
  for (const [field, label] of Object.entries(positiveFields)) {
    const result = positiveNumber(input[field], label);
    if (!result.ok) return result;
  }

  const name = requiredText(input.name, "차량명");
  if (!name.ok) return name;

  return {
    ok: true,
    value: {
      name: name.value,
      type: String(input.type ?? "ETC"),
      lengthMm: Number(input.lengthMm),
      widthMm: Number(input.widthMm),
      heightMm: Number(input.heightMm),
      maxLoadKg: Number(input.maxLoadKg),
      axleLimitKg: Number(input.axleLimitKg || 0),
      doorSide: String(input.doorSide ?? "REAR"),
    },
  };
}

export function validatePallet(input) {
  for (const [field, label] of [
    ["lengthMm", "파렛트 길이"],
    ["widthMm", "파렛트 폭"],
    ["heightMm", "파렛트 높이"],
    ["tareWeightKg", "파렛트 자체중량"],
    ["maxGrossWeightKg", "최대 총중량"],
  ]) {
    const result = positiveNumber(input[field], label);
    if (!result.ok) return result;
  }

  const name = requiredText(input.name, "파렛트명");
  if (!name.ok) return name;
  const stackable = Boolean(input.stackable);
  const maxStack = stackable ? Math.max(1, Math.floor(Number(input.maxStack || 1))) : 1;

  return {
    ok: true,
    value: {
      name: name.value,
      lengthMm: Number(input.lengthMm),
      widthMm: Number(input.widthMm),
      heightMm: Number(input.heightMm),
      tareWeightKg: Number(input.tareWeightKg),
      maxGrossWeightKg: Number(input.maxGrossWeightKg),
      stackable,
      maxStack,
      rotatable: Boolean(input.rotatable),
    },
  };
}

export function validateProduct(input) {
  const code = requiredText(input.code, "품목코드");
  if (!code.ok) return code;
  const name = requiredText(input.name, "품목명");
  if (!name.ok) return name;
  const palletId = requiredText(input.palletId, "파렛트 규격");
  if (!palletId.ok) return palletId;
  const units = positiveNumber(input.unitsPerPallet, "파렛트당 수량");
  if (!units.ok) return units;
  const weight = positiveNumber(input.unitWeightKg, "제품 단위중량");
  if (!weight.ok) return weight;

  return {
    ok: true,
    value: {
      code: code.value,
      name: name.value,
      palletId: palletId.value,
      unitsPerPallet: Math.floor(units.value),
      unitWeightKg: weight.value,
    },
  };
}

export function buildMasterSummary({ vehicles, pallets, products }) {
  const palletIds = new Set(pallets.map((pallet) => pallet.id));
  return {
    vehicleCount: vehicles.length,
    palletCount: pallets.length,
    productCount: products.length,
    incompleteProductCount: products.filter((product) => !palletIds.has(product.palletId)).length,
  };
}
