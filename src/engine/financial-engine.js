/**
 * Solar Rooftop Learning Lab - Financial & Payback Calculation Engine
 * 
 * Engineering & Financial Methodology:
 * - Electricity Tariff: Average retail price per kWh paid to utility (MEA/PEA in THB/kWh)
 * - Self-Consumption vs Export Energy:
 *   Self-consumed solar energy directly displaces retail tariff (saving at 100% of retail rate).
 *   Excess solar generation exported to the utility grid is credited at the export buyback tariff
 *   (e.g., Thailand Solar Rooftop Rakyat scheme ~2.20 THB/kWh, or 0.00 THB/kWh if Zero Export / no agreement).
 *   NEVER assume exported energy receives 100% of the retail purchase tariff.
 * - Simple Payback Period (years): System Initial Cost / Annual Net Savings
 * - 25-Year Cumulative Financial Analysis:
 *   Accounts for standard PV module performance degradation (approx 0.50% / year)
 *   Calculates cumulative net cash flow and breakeven milestone.
 * 
 * @module FinancialEngine
 */

// Standard PV degradation per year (Tier 1 monocrystalline standard)
export const ANNUAL_DEGRADATION_RATE = 0.005; // 0.5% per year
export const ANALYSIS_HORIZON_YEARS = 25;

/**
 * Calculate Pre-Solar Electricity Bill
 * @param {number} monthlyKwh - Monthly consumption in kWh
 * @param {number} tariff - Retail tariff in THB/kWh
 * @returns {{ monthlyBill: number, annualBill: number }}
 */
export function calculatePreSolarBill(monthlyKwh, tariff) {
  if (!Number.isFinite(monthlyKwh) || monthlyKwh <= 0 || !Number.isFinite(tariff) || tariff <= 0) {
    return { monthlyBill: 0, annualBill: 0 };
  }
  const monthlyBill = monthlyKwh * tariff;
  const annualBill = monthlyBill * 12;
  return { monthlyBill, annualBill };
}

/**
 * Split Monthly Generation into Self-Consumed and Exported Energy
 * 
 * Formula:
 * Self-consumed Energy = MIN(Monthly Generation × Self-consumption Ratio, Monthly Consumption)
 * Export Energy = MAX(0, Monthly Generation - Self-consumed Energy)
 * 
 * @param {number} monthlyGenerationKwh - Total solar energy produced in a month
 * @param {number} monthlyConsumptionKwh - Total building energy consumed in a month
 * @param {number} daytimeSelfUseRatio - Daytime usage fraction (0.0 to 1.0, e.g. 0.65 for 65%)
 * @returns {{
 *   selfConsumedKwh: number,
 *   exportedKwh: number,
 *   gridImportKwh: number,
 *   selfConsumptionPercentOfGen: number,
 *   exportPercentOfGen: number
 * }}
 */
export function calculateEnergyFlows(monthlyGenerationKwh, monthlyConsumptionKwh, daytimeSelfUseRatio) {
  if (!Number.isFinite(monthlyGenerationKwh) || monthlyGenerationKwh <= 0) {
    return {
      selfConsumedKwh: 0,
      exportedKwh: 0,
      gridImportKwh: Math.max(0, monthlyConsumptionKwh || 0),
      selfConsumptionPercentOfGen: 0,
      exportPercentOfGen: 0
    };
  }

  const consumption = Math.max(0, Number.isFinite(monthlyConsumptionKwh) ? monthlyConsumptionKwh : 0);
  const selfUseRatio = Math.max(0, Math.min(1.0, Number.isFinite(daytimeSelfUseRatio) ? daytimeSelfUseRatio : 0.65));

  // Solar energy utilized on-site during sun hours
  const potentialSelfUse = monthlyGenerationKwh * selfUseRatio;
  const selfConsumedKwh = Math.min(potentialSelfUse, consumption);

  // Remaining solar generation sent back to grid or curtailed
  const exportedKwh = Math.max(0, monthlyGenerationKwh - selfConsumedKwh);

  // Electricity that still must be purchased from utility grid
  const gridImportKwh = Math.max(0, consumption - selfConsumedKwh);

  const selfConsumptionPercentOfGen = (selfConsumedKwh / monthlyGenerationKwh) * 100;
  const exportPercentOfGen = (exportedKwh / monthlyGenerationKwh) * 100;

  return {
    selfConsumedKwh,
    exportedKwh,
    gridImportKwh,
    selfConsumptionPercentOfGen,
    exportPercentOfGen
  };
}

/**
 * Calculate Post-Solar Electricity Bill & Net Monthly / Annual Savings
 * 
 * Formula:
 * Monthly Savings = Self-consumed Energy × Retail Tariff + Export Energy × Export Tariff
 * Post-Solar Net Bill = Pre-Solar Bill - Monthly Savings
 * 
 * @param {object} params
 * @param {number} params.monthlyConsumptionKwh
 * @param {number} params.monthlyGenerationKwh
 * @param {number} params.daytimeSelfUseRatio
 * @param {number} params.retailTariff - THB/kWh (paid to utility)
 * @param {number} params.exportTariff - THB/kWh (earned from utility, default 0 or ~2.20 THB/kWh)
 * @returns {object}
 */
export function calculatePostSolarBillAndSavings({
  monthlyConsumptionKwh,
  monthlyGenerationKwh,
  daytimeSelfUseRatio,
  retailTariff,
  exportTariff = 0
}) {
  const tariff = Math.max(0, Number.isFinite(retailTariff) ? retailTariff : 0);
  const feedInRate = Math.max(0, Number.isFinite(exportTariff) ? exportTariff : 0);

  const preSolar = calculatePreSolarBill(monthlyConsumptionKwh, tariff);
  const flows = calculateEnergyFlows(monthlyGenerationKwh, monthlyConsumptionKwh, daytimeSelfUseRatio);

  // Bill for electricity drawn from utility grid
  const gridImportCost = flows.gridImportKwh * tariff;

  // Revenue / Credit earned from surplus energy sold to grid
  const exportRevenue = flows.exportedKwh * feedInRate;

  // Net bill after solar
  const postSolarNetMonthlyBill = Math.max(0, gridImportCost - exportRevenue);
  const postSolarNetAnnualBill = postSolarNetMonthlyBill * 12;

  // Monthly & Annual savings
  // Directly represents: (Onsite savings) + (Feed-in revenue)
  const monthlySavings = (flows.selfConsumedKwh * tariff) + exportRevenue;
  const annualSavings = monthlySavings * 12;

  const savingsPercentOfPreBill = preSolar.monthlyBill > 0
    ? (monthlySavings / preSolar.monthlyBill) * 100
    : 0;

  return {
    preSolarMonthlyBill: preSolar.monthlyBill,
    preSolarAnnualBill: preSolar.annualBill,
    flows,
    gridImportCost,
    exportRevenue,
    postSolarNetMonthlyBill,
    postSolarNetAnnualBill,
    monthlySavings,
    annualSavings,
    savingsPercentOfPreBill
  };
}

/**
 * Calculate Simple Payback Period
 * Formula: Payback (years) = System Total Cost / Annual Savings
 * 
 * @param {number} totalSystemCost - Total capital expenditure in THB
 * @param {number} annualSavings - Net annual electricity savings in THB/year
 * @returns {{ paybackYears: number | null, isPaybackAchievable: boolean }}
 */
export function calculateSimplePayback(totalSystemCost, annualSavings) {
  if (!Number.isFinite(totalSystemCost) || totalSystemCost <= 0) {
    return { paybackYears: 0, isPaybackAchievable: true };
  }
  if (!Number.isFinite(annualSavings) || annualSavings <= 0) {
    return { paybackYears: null, isPaybackAchievable: false };
  }
  const paybackYears = totalSystemCost / annualSavings;
  return {
    paybackYears,
    isPaybackAchievable: Number.isFinite(paybackYears) && paybackYears < 50
  };
}

/**
 * 25-Year Cumulative Financial Flow & Breakeven Modeling
 * 
 * Simulates year-by-year performance:
 * - Annual module degradation of 0.5% per year
 * - Optional electricity tariff inflation rate
 * - Cumulative net cash position = Cumulative Savings - Initial CAPEX
 * 
 * @param {object} params
 * @param {number} params.totalSystemCost - Initial CAPEX in THB
 * @param {number} params.firstYearSavings - First year net savings in THB
 * @param {number} [params.degradationRate=0.005] - Annual degradation (0.005 = 0.5%/yr)
 * @param {number} [params.tariffInflationRate=0.0] - Annual electricity tariff inflation
 * @param {number} [params.years=25] - Analysis horizon
 * @returns {object}
 */
export function calculateCumulativeCashFlow({
  totalSystemCost,
  firstYearSavings,
  degradationRate = ANNUAL_DEGRADATION_RATE,
  tariffInflationRate = 0.0,
  years = ANALYSIS_HORIZON_YEARS
}) {
  const cost = Math.max(0, Number.isFinite(totalSystemCost) ? totalSystemCost : 0);
  const baseSavings = Math.max(0, Number.isFinite(firstYearSavings) ? firstYearSavings : 0);

  const timeline = [];
  let cumulativeSavings = 0;
  let breakevenYear = null;

  // Year 0 (Initial investment outlay)
  timeline.push({
    year: 0,
    annualSavings: 0,
    cumulativeSavings: 0,
    netCashFlow: -cost,
    cumulativeCashFlow: -cost,
    generationFactor: 1.0
  });

  for (let yr = 1; yr <= years; yr++) {
    // Degradation factor for year yr (Year 1 has factor 1.0)
    const genFactor = Math.max(0, 1.0 - (degradationRate * (yr - 1)));
    // Tariff inflation factor
    const inflationFactor = Math.pow(1.0 + tariffInflationRate, yr - 1);
    
    const yearSavings = baseSavings * genFactor * inflationFactor;
    cumulativeSavings += yearSavings;
    const cumulativeNet = cumulativeSavings - cost;

    if (breakevenYear === null && cumulativeNet >= 0) {
      // Linear interpolation to determine partial year of breakeven
      const prevNet = yr === 1 ? -cost : (cumulativeSavings - yearSavings - cost);
      const fraction = yearSavings > 0 ? (0 - prevNet) / yearSavings : 0;
      breakevenYear = (yr - 1) + Math.max(0, Math.min(1.0, fraction));
    }

    timeline.push({
      year: yr,
      annualSavings: yearSavings,
      cumulativeSavings,
      netCashFlow: yearSavings,
      cumulativeCashFlow: cumulativeNet,
      generationFactor: genFactor
    });
  }

  const total25YearSavings = cumulativeSavings;
  const net25YearProfit = cumulativeSavings - cost;
  const returnOnInvestmentPercent = cost > 0 ? (net25YearProfit / cost) * 100 : 0;

  return {
    cost,
    years,
    timeline,
    breakevenYear,
    total25YearSavings,
    net25YearProfit,
    returnOnInvestmentPercent
  };
}

/**
 * Master Financial Assessment Function
 * Integrates sizing result with financial parameters
 * 
 * @param {object} inputs
 * @param {number} inputs.installedKwp
 * @param {number} inputs.monthlyGenerationKwh
 * @param {number} inputs.monthlyConsumptionKwh
 * @param {number} inputs.retailTariff - THB/kWh (e.g. 4.70)
 * @param {number} inputs.daytimeSelfUsePercent - % (e.g. 65)
 * @param {number} [inputs.exportTariff=0] - THB/kWh (e.g. 2.20 or 0)
 * @param {number} [inputs.costPerKwp=35000] - THB/kWp (e.g. 35,000)
 * @param {number} [inputs.customTotalCost] - Custom total cost in THB (optional override)
 * @returns {object}
 */
export function calculateFinancialEconomics(inputs) {
  const warnings = [];
  const errors = [];

  const installedKwp = Number(inputs.installedKwp);
  const monthlyGen = Number(inputs.monthlyGenerationKwh);
  const monthlyConsumption = Number(inputs.monthlyConsumptionKwh);
  const retailTariff = Number(inputs.retailTariff);
  const daytimeSelfUseRatio = Number(inputs.daytimeSelfUsePercent) / 100;
  const exportTariff = Number(inputs.exportTariff || 0);

  let costPerKwp = Number(inputs.costPerKwp || 35000);
  let totalCost = inputs.customTotalCost ? Number(inputs.customTotalCost) : (installedKwp * costPerKwp);

  if (!Number.isFinite(retailTariff) || retailTariff <= 0) {
    errors.push('ค่าไฟฟ้าเฉลี่ย (บาท/kWh) ต้องมากกว่า 0');
  }
  if (!Number.isFinite(daytimeSelfUseRatio) || daytimeSelfUseRatio < 0 || daytimeSelfUseRatio > 1.0) {
    errors.push('สัดส่วนการใช้ไฟกลางวันต้องอยู่ระหว่าง 0% ถึง 100%');
  }
  if (exportTariff < 0) {
    errors.push('อัตรารับซื้อไฟฟ้าส่วนเกินต้องไม่ติดลบ');
  }

  if (errors.length > 0) {
    return { success: false, errors, warnings: [] };
  }

  if (exportTariff > retailTariff) {
    warnings.push(`อัตรารับซื้อไฟฟ้าส่วนเกิน (${exportTariff.toFixed(2)} บาท/kWh) สูงกว่าค่าไฟฟ้าซื้อเข้า (${retailTariff.toFixed(2)} บาท/kWh) ซึ่งไม่สอดคล้องกับระเบียบการรับซื้อไฟฟ้าในปัจจุบัน`);
  }

  if (exportTariff > 0) {
    warnings.push(`ระบุอัตรารับซื้อไฟส่วนเกิน ${exportTariff.toFixed(2)} บาท/kWh เป็นสมมติฐานการเรียนรู้ ในทางปฏิบัติผู้ใช้ต้องได้รับสัญญาซื้อขายไฟฟ้ากับ กฟน./กฟภ. อย่างถูกต้อง`);
  } else {
    warnings.push('อัตรารับซื้อไฟส่วนเกินตั้งเป็น 0.00 บาท/kWh (Zero Export หรือไม่มีสัญญาขายไฟคืน) ไฟฟ้าส่วนเกินจะไม่ก่อให้เกิดรายได้');
  }

  const bills = calculatePostSolarBillAndSavings({
    monthlyConsumptionKwh: monthlyConsumption,
    monthlyGenerationKwh: monthlyGen,
    daytimeSelfUseRatio,
    retailTariff,
    exportTariff
  });

  const payback = calculateSimplePayback(totalCost, bills.annualSavings);
  const cashFlow = calculateCumulativeCashFlow({
    totalSystemCost: totalCost,
    firstYearSavings: bills.annualSavings
  });

  return {
    success: true,
    errors: [],
    warnings,
    data: {
      retailTariff,
      exportTariff,
      costPerKwp,
      totalCost,
      preSolarMonthlyBill: bills.preSolarMonthlyBill,
      preSolarAnnualBill: bills.preSolarAnnualBill,
      flows: bills.flows,
      selfConsumedKwh: bills.flows.selfConsumedKwh,
      exportedKwh: bills.flows.exportedKwh,
      gridImportKwh: bills.flows.gridImportKwh,
      gridImportCost: bills.gridImportCost,
      exportRevenue: bills.exportRevenue,
      postSolarNetMonthlyBill: bills.postSolarNetMonthlyBill,
      postSolarNetAnnualBill: bills.postSolarNetAnnualBill,
      monthlySavings: bills.monthlySavings,
      annualSavings: bills.annualSavings,
      savingsPercentOfPreBill: bills.savingsPercentOfPreBill,
      paybackYears: payback.paybackYears,
      isPaybackAchievable: payback.isPaybackAchievable,
      cashFlow
    }
  };
}

export const FinancialEngine = {
  ANNUAL_DEGRADATION_RATE,
  ANALYSIS_HORIZON_YEARS,
  calculatePreSolarBill,
  calculateEnergyFlows,
  calculatePostSolarBillAndSavings,
  calculateSimplePayback,
  calculateCumulativeCashFlow,
  calculateFinancialEconomics
};

export default FinancialEngine;
