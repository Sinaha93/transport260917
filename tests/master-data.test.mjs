import test from "node:test";
import assert from "node:assert/strict";

import {
  buildMasterSummary,
  validatePallet,
  validateProduct,
  validateVehicle,
} from "../lib/master-data.mjs";

test("차량 치수와 적재중량은 양수여야 한다", () => {
  const result = validateVehicle({
    name: "5t 정규차량",
    type: "5T",
    lengthMm: 0,
    widthMm: 2300,
    heightMm: 2400,
    maxLoadKg: 5000,
    axleLimitKg: 10000,
    doorSide: "REAR",
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /적재함 길이/);
});

test("저장 가능한 차량 필드만 반환한다", () => {
  const result = validateVehicle({
    name: "11t 정규차량",
    type: "11T",
    lengthMm: 9200,
    widthMm: 2400,
    heightMm: 2500,
    maxLoadKg: 11000,
    axleLimitKg: 10000,
    doorSide: "REAR",
    unexpected: "discard-me",
  });

  assert.equal(result.ok, true);
  assert.equal("unexpected" in result.value, false);
});

test("비적층 파렛트는 최대 적층 수를 1로 정규화한다", () => {
  const result = validatePallet({
    name: "A형 철제 파렛트",
    lengthMm: 1200,
    widthMm: 1000,
    heightMm: 900,
    tareWeightKg: 120,
    maxGrossWeightKg: 1100,
    stackable: false,
    maxStack: 2,
    rotatable: true,
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.maxStack, 1);
});

test("품목은 파렛트당 수량과 단위중량이 필요하다", () => {
  const result = validateProduct({
    code: "P-001",
    name: "브라켓",
    palletId: "PAL-001",
    unitsPerPallet: 0,
    unitWeightKg: 2.4,
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /파렛트당 수량/);
});

test("기준정보 요약은 등록 수와 미완성 품목을 계산한다", () => {
  const summary = buildMasterSummary({
    vehicles: [{ id: "V1" }, { id: "V2" }, { id: "V3" }],
    pallets: [{ id: "P1" }, { id: "P2" }],
    products: [
      { id: "I1", palletId: "P1" },
      { id: "I2", palletId: "UNKNOWN" },
    ],
  });

  assert.deepEqual(summary, {
    vehicleCount: 3,
    palletCount: 2,
    productCount: 2,
    incompleteProductCount: 1,
  });
});
