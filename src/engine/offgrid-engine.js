/**
 * Solar Rooftop Learning Lab - Off-Grid & Battery Calculation Engine
 * 
 * Engineering Methodology (DEDE Standard & IEC 62124 Guidelines):
 * - Appliance Load: Evaluated per appliance (Watts × Quantity × Hours/Day = Wh/day)
 * - Inverter Loss Correction: AC energy required from DC source = AC Load Wh / Inverter Efficiency
 * - Battery Bank Sizing (Ah):
 *   Ah = (Adjusted Daily Wh × Autonomy Days) / (System Voltage × DoD × Battery Efficiency)
 * - Inverter Continuous Rating: Total simultaneous running watts / Inverter Efficiency × 1.25 margin
 * - PV Array Requirement: Adjusted Daily kWh / (PSH × 0.80 derate)
 * 
 * @module OffgridEngine
 */

/**
 * Calculate Total Appliance Daily Energy & Peak Simultaneous Watts
 * @param {Array<{ name: string, watts: number, quantity: number, hoursPerDay: number }>} appliances
 * @returns {{ dailyWh: number, peakWatts: number }}
 */
export function calculateLoadProfile(appliances) {
  if (!Array.isArray(appliances) || appliances.length === 0) {
    return { dailyWh: 0, peakWatts: 0 };
  }
  let dailyWh = 0;
  let peakWatts = 0;

  for (const app of appliances) {
    const w = Math.max(0, Number(app.watts) || 0);
    const q = Math.max(0, Number(app.quantity) || 0);
    const h = Math.max(0, Math.min(24, Number(app.hoursPerDay) || 0));
    dailyWh += w * q * h;
    peakWatts += w * q;
  }

  return { dailyWh, peakWatts };
}

/**
 * Calculate Battery Bank Storage Sizing
 * @param {object} params
 * @param {number} params.dailyWh - Gross daily AC energy in Wh
 * @param {number} [params.autonomyDays=1.0] - Days of autonomy (no sun days)
 * @param {number} [params.batteryVoltage=48] - Nominal DC system voltage (12V, 24V, 48V)
 * @param {number} [params.depthOfDischargeRatio=0.80] - DoD (0.80 for LiFePO4, 0.50 for Lead-Acid)
 * @param {number} [params.batteryEfficiency=0.90] - Coulombic/energy efficiency (0.90 - 0.95)
 * @param {number} [params.inverterEfficiency=0.92] - Inverter DC to AC conversion efficiency
 * @returns {{
 *   adjustedDailyWh: number,
 *   batteryCapacityAh: number,
 *   nominalKwh: number,
 *   usableKwh: number
 * }}
 */
export function calculateBatteryBank({
  dailyWh,
  autonomyDays = 1.0,
  batteryVoltage = 48,
  depthOfDischargeRatio = 0.80,
  batteryEfficiency = 0.90,
  inverterEfficiency = 0.92
}) {
  if (!Number.isFinite(dailyWh) || dailyWh <= 0) {
    return { adjustedDailyWh: 0, batteryCapacityAh: 0, nominalKwh: 0, usableKwh: 0 };
  }

  const days = Math.max(0.5, Number.isFinite(autonomyDays) ? autonomyDays : 1.0);
  const volts = Math.max(12, Number.isFinite(batteryVoltage) ? batteryVoltage : 48);
  const dod = Math.max(0.1, Math.min(0.95, Number.isFinite(depthOfDischargeRatio) ? depthOfDischargeRatio : 0.80));
  const beff = Math.max(0.5, Math.min(0.99, Number.isFinite(batteryEfficiency) ? batteryEfficiency : 0.90));
  const ieff = Math.max(0.5, Math.min(0.99, Number.isFinite(inverterEfficiency) ? inverterEfficiency : 0.92));

  // Energy that the DC battery must provide to deliver the required AC energy
  const adjustedDailyWh = dailyWh / ieff;

  // Required storage capacity in Ampere-hours (Ah)
  const denominator = volts * dod * beff;
  const batteryCapacityAh = (adjustedDailyWh * days) / denominator;

  // Nominal energy storage in kWh
  const nominalKwh = (batteryCapacityAh * volts) / 1000;
  const usableKwh = nominalKwh * dod;

  return {
    adjustedDailyWh,
    batteryCapacityAh,
    nominalKwh,
    usableKwh
  };
}

/**
 * Calculate Off-grid Inverter and PV Array Screening Sizing
 * @param {object} params
 * @param {number} params.peakWatts - Simultaneous load in Watts
 * @param {number} params.adjustedDailyWh - DC daily energy in Wh
 * @param {number} params.psh - Peak Sun Hours (h/day)
 * @param {number} [params.inverterEfficiency=0.92]
 * @returns {{
 *   inverterContinuousKw: number,
 *   pvArrayKwp: number
 * }}
 */
export function calculateOffgridEquipment({
  peakWatts,
  adjustedDailyWh,
  psh,
  inverterEfficiency = 0.92
}) {
  const peak = Math.max(0, Number(peakWatts) || 0);
  const adjWh = Math.max(0, Number(adjustedDailyWh) || 0);
  const ieff = Math.max(0.5, Math.min(0.99, Number(inverterEfficiency) || 0.92));
  const sunHours = Math.max(1.0, Number(psh) || 4.5);

  // Inverter continuous power with 25% safety margin
  const inverterContinuousKw = (peak / ieff / 1000) * 1.25;

  // PV array requirement considering off-grid 80% typical efficiency factor
  const pvArrayKwp = (adjWh / 1000) / (sunHours * 0.80);

  return {
    inverterContinuousKw,
    pvArrayKwp
  };
}

export const OffgridEngine = {
  calculateLoadProfile,
  calculateBatteryBank,
  calculateOffgridEquipment
};

export default OffgridEngine;
