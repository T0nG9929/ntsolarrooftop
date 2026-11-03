/**
 * Solar Rooftop Learning Lab - Core Calculation Engine
 * 
 * Engineering Methodology & Physical Principles:
 * - SI Units used throughout: Power in Watts (W) / Kilowatts (kW), Energy in Kilowatt-hours (kWh)
 * - Average Days per Month convention: 365.25 / 12 = 30.4375 days/month
 * - Peak Sun Hours (PSH): Daily solar insolation equivalent to 1,000 W/m² (kWh/m²/day)
 * - Performance Ratio (PR): Comprehensive derating factor for temperature, dust/soiling,
 *   wiring resistance, mismatch, inverter efficiency, and cable losses (typically 0.75 - 0.82)
 * 
 * @module SolarEngine
 */

export const DAYS_PER_MONTH = 30.4375;
export const STANDARD_TEST_IRRADIANCE = 1000; // W/m²

/**
 * Validate numerical input within acceptable engineering bounds
 * @param {number} val - Value to check
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @param {string} fieldName - Descriptive name for error messages
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRange(val, min, max, fieldName) {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    return { valid: false, error: `${fieldName} ต้องเป็นตัวเลขที่ถูกต้อง` };
  }
  if (val < min) {
    return { valid: false, error: `${fieldName} ต้องไม่น้อยกว่า ${min}` };
  }
  if (val > max) {
    return { valid: false, error: `${fieldName} ต้องไม่เกิน ${max}` };
  }
  return { valid: true };
}

/**
 * 1. Daily Energy Consumption
 * Formula: Daily kWh = Monthly kWh / 30.4375
 * @param {number} monthlyKwh - Monthly electricity consumption in kWh
 * @returns {number} Average daily electricity consumption in kWh/day
 */
export function calculateDailyConsumption(monthlyKwh) {
  if (!Number.isFinite(monthlyKwh) || monthlyKwh <= 0) return 0;
  return monthlyKwh / DAYS_PER_MONTH;
}

/**
 * 2. Target Daily Solar Energy
 * Formula: Target Daily kWh = Daily kWh × Solar Offset Ratio
 * @param {number} dailyKwh - Daily electricity consumption in kWh/day
 * @param {number} offsetRatio - Target solar offset fraction (0.0 to 1.0, e.g. 0.80 for 80%)
 * @returns {number} Target daily energy generation in kWh/day
 */
export function calculateTargetDailyEnergy(dailyKwh, offsetRatio) {
  if (!Number.isFinite(dailyKwh) || dailyKwh <= 0) return 0;
  const clampedOffset = Math.max(0, Math.min(1.0, Number.isFinite(offsetRatio) ? offsetRatio : 0));
  return dailyKwh * clampedOffset;
}

/**
 * 3. Estimated Required PV System Size
 * Formula: PV kWp = Target Daily kWh / (PSH × Performance Ratio)
 * @param {number} targetDailyKwh - Target daily energy generation in kWh/day
 * @param {number} psh - Peak Sun Hours in hours/day (kWh/m²/day)
 * @param {number} performanceRatio - Overall system performance ratio (0.0 to 1.0, typically 0.75-0.85)
 * @returns {number} Required PV peak capacity in kWp DC
 */
export function calculateRequiredKwp(targetDailyKwh, psh, performanceRatio) {
  if (!Number.isFinite(targetDailyKwh) || targetDailyKwh <= 0) return 0;
  if (!Number.isFinite(psh) || psh <= 0) return 0;
  if (!Number.isFinite(performanceRatio) || performanceRatio <= 0) return 0;
  const denominator = psh * performanceRatio;
  if (denominator <= 0) return 0;
  return targetDailyKwh / denominator;
}

/**
 * 4. Solar Panel Quantity
 * Formula: Panel Count = CEILING(PV kWp × 1000 / Panel Wattage)
 * Note: Panels cannot be split into fractional units. CEILING ensures the installed capacity
 * meets or slightly exceeds the target requirement.
 * @param {number} requiredKwp - Required PV capacity in kWp
 * @param {number} panelWattage - Nominal power of a single panel in Watts (e.g. 450, 550, 600)
 * @returns {number} Integer number of solar panels
 */
export function calculatePanelCount(requiredKwp, panelWattage) {
  if (!Number.isFinite(requiredKwp) || requiredKwp <= 0) return 0;
  if (!Number.isFinite(panelWattage) || panelWattage <= 0) return 0;
  const totalWatts = requiredKwp * 1000;
  return Math.ceil(totalWatts / panelWattage);
}

/**
 * 5. Installed PV Capacity
 * Formula: Installed kWp = Panel Count × Panel Wattage / 1000
 * @param {number} panelCount - Integer number of panels
 * @param {number} panelWattage - Nominal power per panel in Watts
 * @returns {number} Installed PV capacity in kWp DC
 */
export function calculateInstalledKwp(panelCount, panelWattage) {
  if (!Number.isFinite(panelCount) || panelCount <= 0) return 0;
  if (!Number.isFinite(panelWattage) || panelWattage <= 0) return 0;
  return (panelCount * panelWattage) / 1000;
}

/**
 * 6. Estimated Energy Generation
 * Daily Generation (kWh/day) = Installed kWp × PSH × Performance Ratio
 * Monthly Generation (kWh/month) = Daily Generation × 30.4375
 * Annual Generation (kWh/year) = Monthly Generation × 12
 * @param {object} params
 * @param {number} params.installedKwp - Installed DC capacity in kWp
 * @param {number} params.psh - Peak Sun Hours (h/day)
 * @param {number} params.performanceRatio - System performance ratio (0.0 to 1.0)
 * @returns {{ dailyKwh: number, monthlyKwh: number, annualKwh: number }}
 */
export function calculateGeneration({ installedKwp, psh, performanceRatio }) {
  if (!Number.isFinite(installedKwp) || installedKwp <= 0) {
    return { dailyKwh: 0, monthlyKwh: 0, annualKwh: 0 };
  }
  if (!Number.isFinite(psh) || psh <= 0 || !Number.isFinite(performanceRatio) || performanceRatio <= 0) {
    return { dailyKwh: 0, monthlyKwh: 0, annualKwh: 0 };
  }
  const dailyKwh = installedKwp * psh * performanceRatio;
  const monthlyKwh = dailyKwh * DAYS_PER_MONTH;
  const annualKwh = monthlyKwh * 12;
  return { dailyKwh, monthlyKwh, annualKwh };
}

/**
 * 7. Estimated Roof Area Required
 * Formula: Roof Area = Panel Count × Panel Area per Panel
 * Standard panel area reference:
 * - 450W: ~2.18 m² (e.g. 2.094m × 1.038m)
 * - 550W: ~2.58 m² (e.g. 2.278m × 1.134m)
 * - 600W+: ~2.80 m² (e.g. 2.465m × 1.134m)
 * @param {number} panelCount - Number of panels
 * @param {number} panelArea - Area per panel in m²
 * @param {number} [clearanceFactor=1.20] - Recommended clearance allowance (default +20% for walkways, margins)
 * @returns {{ netArea: number, grossAreaWithClearance: number }}
 */
export function calculateRoofArea(panelCount, panelArea, clearanceFactor = 1.20) {
  if (!Number.isFinite(panelCount) || panelCount <= 0) {
    return { netArea: 0, grossAreaWithClearance: 0 };
  }
  if (!Number.isFinite(panelArea) || panelArea <= 0) {
    return { netArea: 0, grossAreaWithClearance: 0 };
  }
  const netArea = panelCount * panelArea;
  const grossAreaWithClearance = netArea * (clearanceFactor > 1 ? clearanceFactor : 1.0);
  return { netArea, grossAreaWithClearance };
}

/**
 * 8. Preliminary Inverter Sizing & Screening Range
 * Engineering guideline:
 * - DC/AC Inverter Sizing Ratio: Recommended nominal inverter size is ~ Installed kWp / 1.1 (DC:AC ratio 1.10 - 1.20)
 * - Preliminary screening range: 80% to 120% of PV array peak DC rating
 * - Grid Phase recommendation: In Thailand (MEA/PEA regulations), systems ≤ 5 kWp are typically
 *   Single-Phase (1Ø 230V), and systems > 5 kWp are typically Three-Phase (3Ø 400V).
 * @param {number} installedKwp - Installed PV peak capacity in kWp
 * @returns {{
 *   nominalKw: number,
 *   minKw: number,
 *   maxKw: number,
 *   recommendedPhase: string,
 *   recommendedPhaseCode: number
 * }}
 */
export function calculateInverterSizing(installedKwp) {
  if (!Number.isFinite(installedKwp) || installedKwp <= 0) {
    return {
      nominalKw: 0,
      minKw: 0,
      maxKw: 0,
      recommendedPhase: 'N/A',
      recommendedPhaseCode: 0
    };
  }
  const nominalKw = installedKwp / 1.10;
  const minKw = installedKwp * 0.80;
  const maxKw = installedKwp * 1.20;
  const isSinglePhase = installedKwp <= 5.0;

  return {
    nominalKw,
    minKw,
    maxKw,
    recommendedPhase: isSinglePhase ? '1 เฟส (Single-Phase 230V)' : '3 เฟส (Three-Phase 400V)',
    recommendedPhaseCode: isSinglePhase ? 1 : 3
  };
}

/**
 * Master PV Sizing Calculator
 * Executes the complete Step 1 & Step 2 sizing calculation chain with full validation
 * @param {object} inputs
 * @param {number} inputs.monthlyKwh - Monthly consumption (kWh)
 * @param {number} inputs.offsetPercent - Target offset % (e.g. 80)
 * @param {number} inputs.psh - Peak Sun Hours (e.g. 4.5)
 * @param {number} inputs.performanceRatioPercent - System PR % (e.g. 80)
 * @param {number} inputs.panelWattage - Panel power rating in Watts (e.g. 550)
 * @param {number} [inputs.panelArea] - Area per panel in m² (optional, defaults by wattage)
 * @param {number} [inputs.availableRoofArea] - User's available roof area in m²
 * @param {string} [inputs.systemType='on-grid'] - 'on-grid' | 'hybrid' | 'off-grid'
 * @returns {object} Comprehensive sizing result with warnings and validation info
 */
export function calculateSolarSizing(inputs) {
  const warnings = [];
  const errors = [];

  // Parse and sanitize inputs
  const monthlyKwh = Number(inputs.monthlyKwh);
  const offsetRatio = Number(inputs.offsetPercent) / 100;
  const psh = Number(inputs.psh);
  const prRatio = Number(inputs.performanceRatioPercent) / 100;
  const panelWattage = Number(inputs.panelWattage);
  const availableRoofArea = inputs.availableRoofArea ? Number(inputs.availableRoofArea) : 0;
  const systemType = inputs.systemType || 'on-grid';

  // Dynamic panel area default if not provided
  let panelArea = Number(inputs.panelArea);
  if (!Number.isFinite(panelArea) || panelArea <= 0) {
    if (panelWattage >= 600) panelArea = 2.80;
    else if (panelWattage >= 500) panelArea = 2.58;
    else panelArea = 2.18;
  }

  // Input Validation Checks
  if (!Number.isFinite(monthlyKwh) || monthlyKwh <= 0) {
    errors.push('ปริมาณไฟฟ้าที่ใช้ต่อเดือนต้องมากกว่า 0 kWh');
  }
  if (!Number.isFinite(offsetRatio) || offsetRatio <= 0 || offsetRatio > 1.0) {
    errors.push('เป้าหมายการลดค่าไฟต้องอยู่ระหว่าง 1% ถึง 100%');
  }
  if (!Number.isFinite(psh) || psh < 1.0 || psh > 8.0) {
    errors.push('Peak Sun Hours (PSH) ควรอยู่ในช่วง 1.0 - 8.0 ชม./วัน (ประเทศไทยเฉลี่ย 4.2 - 5.0)');
  }
  if (!Number.isFinite(prRatio) || prRatio < 0.50 || prRatio > 0.95) {
    errors.push('Performance Ratio (PR) ควรอยู่ในช่วง 50% - 95%');
  }
  if (!Number.isFinite(panelWattage) || panelWattage < 100 || panelWattage > 1000) {
    errors.push('กำลังวัตต์ของแผงควรอยู่ในช่วง 100W - 1,000W');
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      warnings,
      data: null
    };
  }

  // Step 1: Daily consumption
  const dailyKwh = calculateDailyConsumption(monthlyKwh);

  // Step 2: Target solar energy
  const targetDailyKwh = calculateTargetDailyEnergy(dailyKwh, offsetRatio);

  // Step 3: Required PV peak kWp
  const requiredKwp = calculateRequiredKwp(targetDailyKwh, psh, prRatio);

  // Step 4: Panels count (CEILING)
  const panelCount = calculatePanelCount(requiredKwp, panelWattage);

  // Step 5: Actual installed kWp
  const installedKwp = calculateInstalledKwp(panelCount, panelWattage);

  // Step 6: Estimated generation
  const generation = calculateGeneration({
    installedKwp,
    psh,
    performanceRatio: prRatio
  });

  // Step 7: Roof area
  const roofArea = calculateRoofArea(panelCount, panelArea);

  // Step 8: Inverter Sizing
  const inverter = calculateInverterSizing(installedKwp);

  // Engineering Warnings Checks
  if (availableRoofArea > 0) {
    if (roofArea.grossAreaWithClearance > availableRoofArea) {
      warnings.push(`พื้นที่หลังคารวมทางเดิน (${roofArea.grossAreaWithClearance.toFixed(1)} ตร.ม.) เกินกว่าพื้นที่หลังคาที่คุณมี (${availableRoofArea} ตร.ม.) แนะนำลดเป้าหมายการประหยัดไฟ หรือเลือกแผงวัตต์สูงขึ้น`);
    } else if (roofArea.netArea > availableRoofArea) {
      warnings.push(`พื้นที่แผงสุทธิ (${roofArea.netArea.toFixed(1)} ตร.ม.) เกินกว่าพื้นที่หลังคาของคุณ (${availableRoofArea} ตร.ม.)`);
    }
  }

  if (installedKwp > 10.0 && systemType === 'on-grid') {
    warnings.push('ระบบขนาดเกิน 10 kWp สำหรับบ้านอยู่อาศัยต้องตรวจสอบข้อกำหนดหม้อแปลงและโครงข่ายไฟฟ้ากับการไฟฟ้าในพื้นที่');
  }

  return {
    success: true,
    errors: [],
    warnings,
    data: {
      systemType,
      monthlyKwh,
      dailyConsumptionKwh: dailyKwh,
      offsetRatio,
      targetDailyKwh,
      psh,
      performanceRatio: prRatio,
      requiredKwp,
      panelWattage,
      panelCount,
      installedKwp,
      panelArea,
      roofAreaNet: roofArea.netArea,
      roofAreaGross: roofArea.grossAreaWithClearance,
      availableRoofArea,
      roofUtilizationPercent: availableRoofArea > 0 ? (roofArea.netArea / availableRoofArea) * 100 : null,
      dailyGenerationKwh: generation.dailyKwh,
      monthlyGenerationKwh: generation.monthlyKwh,
      annualGenerationKwh: generation.annualKwh,
      inverterNominalKw: inverter.nominalKw,
      inverterMinKw: inverter.minKw,
      inverterMaxKw: inverter.maxKw,
      inverterPhase: inverter.recommendedPhase,
      inverterPhaseCode: inverter.recommendedPhaseCode,
      daysPerMonth: DAYS_PER_MONTH
    }
  };
}

export const SolarEngine = {
  DAYS_PER_MONTH,
  STANDARD_TEST_IRRADIANCE,
  validateRange,
  calculateDailyConsumption,
  calculateTargetDailyEnergy,
  calculateRequiredKwp,
  calculatePanelCount,
  calculateInstalledKwp,
  calculateGeneration,
  calculateRoofArea,
  calculateInverterSizing,
  calculateSolarSizing
};

export default SolarEngine;
