/**
 * NT Solar Academy - Report & Export Engine for Solar Calculator
 */

export function exportJsonReport(projectData) {
  const reportPayload = {
    project: 'Solar Rooftop Learning Lab',
    organization: 'NT Academy - National Telecom Public Company Limited',
    standard: 'MEA / PEA Preliminary Solar Rooftop Design & IEC 62124 Reference',
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    reportSummary: {
      recommendedPvSizeKwp: projectData.sizing?.data?.installedKwp || 0,
      panelCount: projectData.sizing?.data?.panelCount || 0,
      panelWattage: projectData.sizing?.data?.panelWattage || 0,
      estimatedMonthlyGenerationKwh: projectData.sizing?.data?.monthlyGenerationKwh || 0,
      estimatedMonthlySavingsThb: projectData.financial?.data?.monthlySavings || 0,
      estimatedPaybackYears: projectData.financial?.data?.paybackYears || null,
      estimatedRoofAreaM2: projectData.sizing?.data?.roofAreaNet || 0,
      inverterNominalKw: projectData.sizing?.data?.inverterNominalKw || 0,
      inverterGridPhase: projectData.sizing?.data?.inverterPhase || 'N/A'
    },
    inputs: projectData.inputs,
    sizingResult: projectData.sizing,
    financialResult: projectData.financial,
    offgridResult: projectData.offgrid || null,
    engineeringDisclaimer: [
      '1. Preliminary Solar PV Calculator for educational and screening purposes only.',
      '2. Does not include detailed temperature-corrected Voc/Vmp/Isc string calculation.',
      '3. Does not calculate MPPT tracking windows or inverter DC voltage limits.',
      '4. Does not engineer electrical cables, protection breakers, surge arrestors (SPD), or rapid shutdown.',
      '5. Does not inspect structural roof loading or wind uplift capacity.',
      '6. Does not simulate near/far 3D shading or tilt/azimuth yield curves.',
      '7. Does not constitute formal grid interconnection approval from MEA or PEA.'
    ]
  };

  const jsonString = JSON.stringify(reportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `NT-Solar-Rooftop-Design-Report-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printPdfReport() {
  window.print();
}

export const SolarReport = {
  exportJsonReport,
  printPdfReport
};

export default SolarReport;
