/**
 * NT Solar Academy - Integrated Engineering Unit Test Suite
 * 
 * Verifies mathematical formulas, boundary conditions, zero-division guards,
 * and edge cases according to engineering standards (DEDE, MEA/PEA, IEC 62124).
 * 
 * Run with: node tests/engine.test.js
 */

import { SolarEngine } from '../src/engine/solar-engine.js';
import { FinancialEngine } from '../src/engine/financial-engine.js';
import { OffgridEngine } from '../src/engine/offgrid-engine.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✕ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
  }
}

function assertCloseTo(actual, expected, tolerance = 0.01, testName) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, testName, `Expected ≈ ${expected}, got ${actual}, diff = ${diff}`);
}

console.log('========================================================');
console.log('    NT SOLAR ACADEMY - ENGINEERING UNIT TESTS           ');
console.log('========================================================\n');

// ----------------------------------------------------
// 1. Solar Sizing Engine Tests
// ----------------------------------------------------
console.log('[SUITE 1: Solar Sizing Engine]');

// 1.1 Daily Consumption Formula
{
  const daily = SolarEngine.calculateDailyConsumption(500);
  assertCloseTo(daily, 500 / 30.4375, 0.001, 'Daily kWh = Monthly kWh / 30.4375');
  assert(SolarEngine.calculateDailyConsumption(0) === 0, 'Zero monthly consumption yields 0 daily kWh');
  assert(SolarEngine.calculateDailyConsumption(-100) === 0, 'Negative monthly consumption yields 0 daily kWh');
}

// 1.2 Target Daily Solar Energy
{
  const daily = 500 / 30.4375;
  const target = SolarEngine.calculateTargetDailyEnergy(daily, 0.80);
  assertCloseTo(target, daily * 0.80, 0.001, 'Target Daily kWh = Daily kWh × Offset');
  assert(SolarEngine.calculateTargetDailyEnergy(daily, 0) === 0, '0% offset yields 0 target kWh');
  assertCloseTo(SolarEngine.calculateTargetDailyEnergy(daily, 1.2), daily, 0.001, 'Offset clamped to max 1.0 (100%)');
}

// 1.3 Required kWp Formula
{
  const target = 13.14; // kWh/day
  const psh = 4.5;
  const pr = 0.80;
  const requiredKwp = SolarEngine.calculateRequiredKwp(target, psh, pr);
  assertCloseTo(requiredKwp, target / (psh * pr), 0.001, 'PV kWp = Target Daily kWh / (PSH × PR)');
  assert(SolarEngine.calculateRequiredKwp(0, psh, pr) === 0, 'Zero target kWh yields 0 kWp');
  assert(SolarEngine.calculateRequiredKwp(target, 0, pr) === 0, 'Zero PSH avoids division by zero, yields 0 kWp');
  assert(SolarEngine.calculateRequiredKwp(target, psh, 0) === 0, 'Zero PR avoids division by zero, yields 0 kWp');
}

// 1.4 Panel Count Ceiling & Installed Capacity
{
  const requiredKwp = 3.65; // kWp = 3650 W
  const panelWatt = 550; // W
  // 3650 / 550 = 6.636 -> CEILING must be 7
  const count = SolarEngine.calculatePanelCount(requiredKwp, panelWatt);
  assert(count === 7, `Panel count must be integer CEILING (expected 7, got ${count})`);

  const installedKwp = SolarEngine.calculateInstalledKwp(count, panelWatt);
  assertCloseTo(installedKwp, (7 * 550) / 1000, 0.001, 'Installed kWp = Panel Count × Wattage / 1000 (3.85 kWp)');

  assert(SolarEngine.calculatePanelCount(0, 550) === 0, 'Zero kWp yields 0 panels');
  assert(SolarEngine.calculatePanelCount(3.0, 0) === 0, 'Zero panel wattage yields 0 panels without crash');
}

// 1.5 Estimated Generation
{
  const gen = SolarEngine.calculateGeneration({ installedKwp: 3.85, psh: 4.5, performanceRatio: 0.80 });
  const expectedDaily = 3.85 * 4.5 * 0.80; // 13.86 kWh/day
  const expectedMonthly = expectedDaily * 30.4375; // 421.86 kWh/month
  const expectedAnnual = expectedMonthly * 12;
  assertCloseTo(gen.dailyKwh, expectedDaily, 0.01, 'Daily Generation = Installed kWp × PSH × PR');
  assertCloseTo(gen.monthlyKwh, expectedMonthly, 0.01, 'Monthly Generation = Daily Gen × 30.4375');
  assertCloseTo(gen.annualKwh, expectedAnnual, 0.1, 'Annual Generation = Monthly Gen × 12');
}

// 1.6 Roof Area & Inverter Sizing
{
  const roof = SolarEngine.calculateRoofArea(10, 2.58, 1.20);
  assertCloseTo(roof.netArea, 25.8, 0.01, 'Net Roof Area = Panel Count × Panel Area (25.8 m²)');
  assertCloseTo(roof.grossAreaWithClearance, 25.8 * 1.20, 0.01, 'Gross Roof Area includes 20% maintenance clearance');

  const inv = SolarEngine.calculateInverterSizing(3.85);
  assertCloseTo(inv.nominalKw, 3.85 / 1.10, 0.01, 'Nominal Inverter = Installed kWp / 1.10');
  assertCloseTo(inv.minKw, 3.85 * 0.80, 0.01, 'Inverter Screening Min = 80%');
  assertCloseTo(inv.maxKw, 3.85 * 1.20, 0.01, 'Inverter Screening Max = 120%');
  assert(inv.recommendedPhaseCode === 1, 'System <= 5kWp recommends Single-Phase');

  const invLarge = SolarEngine.calculateInverterSizing(10.0);
  assert(invLarge.recommendedPhaseCode === 3, 'System > 5kWp recommends Three-Phase');
}

// 1.7 Master Sizing Integration Function
{
  const result = SolarEngine.calculateSolarSizing({
    monthlyKwh: 500,
    offsetPercent: 80,
    psh: 4.5,
    performanceRatioPercent: 80,
    panelWattage: 550,
    availableRoofArea: 40
  });

  assert(result.success === true, 'Standard sizing inputs return success');
  assert(result.data.panelCount === 7, 'Panel count calculated properly');
  assert(Array.isArray(result.warnings), 'Warnings array returned cleanly');

  // Input validation boundary checks
  const errResult = SolarEngine.calculateSolarSizing({
    monthlyKwh: 0,
    offsetPercent: 80,
    psh: 4.5,
    performanceRatioPercent: 80,
    panelWattage: 550
  });
  assert(errResult.success === false, 'Zero monthly kWh correctly rejected with error');

  const pshErr = SolarEngine.calculateSolarSizing({
    monthlyKwh: 500,
    offsetPercent: 80,
    psh: -1,
    performanceRatioPercent: 80,
    panelWattage: 550
  });
  assert(pshErr.success === false, 'Negative PSH correctly rejected');
}

// ----------------------------------------------------
// 2. Financial & Payback Engine Tests
// ----------------------------------------------------
console.log('\n[SUITE 2: Financial & Payback Engine]');

// 2.1 Pre-solar bill
{
  const bill = FinancialEngine.calculatePreSolarBill(500, 4.70);
  assertCloseTo(bill.monthlyBill, 2350, 0.01, 'Pre-solar Monthly Bill = Monthly kWh × Tariff (2,350 THB)');
  assertCloseTo(bill.annualBill, 2350 * 12, 0.01, 'Pre-solar Annual Bill = Monthly × 12 (28,200 THB)');
  assert(FinancialEngine.calculatePreSolarBill(0, 4.70).monthlyBill === 0, 'Zero kWh yields 0 bill');
}

// 2.2 Energy flows & separation
{
  // Case A: Generation = 400 kWh, Consumption = 500 kWh, Self-use = 60%
  // Potential self-use = 400 * 0.6 = 240 kWh. Self-consumed = min(240, 500) = 240 kWh.
  // Export = 400 - 240 = 160 kWh. Grid import = 500 - 240 = 260 kWh.
  const flows = FinancialEngine.calculateEnergyFlows(400, 500, 0.60);
  assertCloseTo(flows.selfConsumedKwh, 240, 0.01, 'Case A: Self-consumed = min(400 * 0.6, 500) = 240 kWh');
  assertCloseTo(flows.exportedKwh, 160, 0.01, 'Case A: Export = max(0, 400 - 240) = 160 kWh');
  assertCloseTo(flows.gridImportKwh, 260, 0.01, 'Case A: Grid Import = 500 - 240 = 260 kWh');

  // Case B: Generation = 600 kWh, Consumption = 200 kWh, Self-use = 100%
  // Potential self-use = 600 kWh. Capped at Consumption = 200 kWh.
  // Export = 600 - 200 = 400 kWh. Grid import = 0 kWh.
  const flowsB = FinancialEngine.calculateEnergyFlows(600, 200, 1.0);
  assertCloseTo(flowsB.selfConsumedKwh, 200, 0.01, 'Case B: Self-consumed capped at monthly consumption (200 kWh)');
  assertCloseTo(flowsB.exportedKwh, 400, 0.01, 'Case B: Exported energy is 400 kWh');
  assertCloseTo(flowsB.gridImportKwh, 0, 0.01, 'Case B: Grid import is 0 kWh when 100% covered');
}

// 2.3 Post-solar bill & savings with separate export tariff
{
  const billsZeroExport = FinancialEngine.calculatePostSolarBillAndSavings({
    monthlyConsumptionKwh: 500,
    monthlyGenerationKwh: 400,
    daytimeSelfUseRatio: 0.65,
    retailTariff: 4.70,
    exportTariff: 0
  });

  // Self-consumed = 400 * 0.65 = 260 kWh. Savings = 260 * 4.70 = 1222 THB
  assertCloseTo(billsZeroExport.monthlySavings, 260 * 4.70, 0.01, 'Zero export tariff credits only self-consumed energy');
  assertCloseTo(billsZeroExport.postSolarNetMonthlyBill, (500 - 260) * 4.70, 0.01, 'Net bill matches grid import cost');

  const billsWithFeedIn = FinancialEngine.calculatePostSolarBillAndSavings({
    monthlyConsumptionKwh: 500,
    monthlyGenerationKwh: 400,
    daytimeSelfUseRatio: 0.65,
    retailTariff: 4.70,
    exportTariff: 2.20
  });
  // Exported = 140 kWh * 2.20 = 308 THB. Total savings = 1222 + 308 = 1530 THB
  assertCloseTo(billsWithFeedIn.exportRevenue, 140 * 2.20, 0.01, 'Exported energy credited at separate export tariff (not retail)');
  assertCloseTo(billsWithFeedIn.monthlySavings, (260 * 4.70) + (140 * 2.20), 0.01, 'Total savings = Self savings + Export revenue');
}

// 2.4 Simple Payback Period
{
  const payback = FinancialEngine.calculateSimplePayback(140000, 28000);
  assertCloseTo(payback.paybackYears, 5.0, 0.01, 'Simple Payback = 140,000 / 28,000 = 5.0 years');
  assert(payback.isPaybackAchievable === true, 'Payback is achievable');

  const zeroSavings = FinancialEngine.calculateSimplePayback(140000, 0);
  assert(zeroSavings.paybackYears === null, 'Zero annual savings returns null payback without throwing division by zero');
  assert(zeroSavings.isPaybackAchievable === false, 'isPaybackAchievable is false when savings are zero');
}

// 2.5 25-Year Cumulative Cash Flow & Degradation
{
  const cashFlow = FinancialEngine.calculateCumulativeCashFlow({
    totalSystemCost: 140000,
    firstYearSavings: 28000,
    degradationRate: 0.005,
    years: 25
  });

  assert(cashFlow.timeline.length === 26, 'Timeline includes Year 0 to Year 25 (26 points)');
  assert(cashFlow.timeline[0].netCashFlow === -140000, 'Year 0 net cash flow is -Initial Cost');
  assert(cashFlow.breakevenYear !== null, 'Breakeven year is achieved');
  // At 0.5% degradation, breakeven is slightly over 5 years (~5.05 years)
  assertCloseTo(cashFlow.breakevenYear, 5.05, 0.1, 'Breakeven year accounts for 0.5% degradation (~5.05 years)');
  assert(cashFlow.net25YearProfit > 0, '25-year net profit is positive');
}

// ----------------------------------------------------
// 3. Off-Grid & Battery Engine Tests
// ----------------------------------------------------
console.log('\n[SUITE 3: Off-Grid & Battery Engine]');

{
  const appliances = [
    { name: 'ไฟ LED', watts: 10, quantity: 10, hoursPerDay: 6 }, // 600 Wh
    { name: 'ตู้เย็น', watts: 150, quantity: 1, hoursPerDay: 8 }, // 1200 Wh
    { name: 'ทีวี', watts: 100, quantity: 1, hoursPerDay: 4 }, // 400 Wh
    { name: 'พัดลม', watts: 50, quantity: 2, hoursPerDay: 4 } // 400 Wh
  ];

  const profile = OffgridEngine.calculateLoadProfile(appliances);
  assert(profile.dailyWh === 2600, 'Total daily Wh calculated correctly (2,600 Wh)');
  assert(profile.peakWatts === (100 + 150 + 100 + 100), 'Peak watts calculated correctly (450 W)');

  const battery = OffgridEngine.calculateBatteryBank({
    dailyWh: 2600,
    autonomyDays: 1.0,
    batteryVoltage: 48,
    depthOfDischargeRatio: 0.80,
    batteryEfficiency: 0.90,
    inverterEfficiency: 0.92
  });

  // Adjusted daily Wh = 2600 / 0.92 = 2826.087 Wh
  // Ah = 2826.087 / (48 * 0.80 * 0.90) = 2826.087 / 34.56 = 81.77 Ah
  assertCloseTo(battery.batteryCapacityAh, 81.77, 0.1, 'Battery capacity in Ah matches engineering formula');
  assertCloseTo(battery.nominalKwh, (battery.batteryCapacityAh * 48) / 1000, 0.01, 'Battery nominal kWh = Ah × V / 1000 (~3.92 kWh)');
}

console.log('\n========================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} TOTAL`);
console.log('========================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL ENGINEERING CALCULATION ENGINE TESTS PASSED SUCCESSFULLY! ✓\n');
}
