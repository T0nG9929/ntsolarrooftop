/**
 * NT Solar Academy - Pure SVG Charting Engine for Solar Calculator
 * Generates lightweight, crisp, vector-based interactive visualizations:
 * 1. Energy Balance Chart (Consumption vs Generation breakdown)
 * 2. Bill Comparison Chart (Pre-solar vs Post-solar monthly expense)
 * 3. 25-Year Cumulative Cash Flow Curve (Breakeven trajectory with module degradation)
 * 
 * Zero external dependencies. 100% offline & GitHub Pages compatible.
 */

export const COLORS = {
  navy: '#071C2C',
  navyLight: '#0D2A40',
  yellow: '#F6C400',
  blue: '#1677A8',
  cyan: '#38B9D3',
  gray: '#E2E9ED',
  darkGray: '#6D7D89',
  green: '#16866B',
  red: '#D9534F'
};

function formatNum(n, d = 0) {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/**
 * 1. Energy Balance Chart
 */
export function renderEnergyComparisonChart(container, data) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const consumption = Math.max(0, data.consumption || 0);
  const generation = Math.max(0, data.generation || 0);
  const selfConsumed = Math.max(0, data.selfConsumed || 0);
  const exported = Math.max(0, data.exported || 0);
  const gridImport = Math.max(0, data.gridImport || 0);

  const maxVal = Math.max(consumption, generation, 100) * 1.15;
  const width = 460;
  const height = 240;
  const padding = { top: 30, right: 25, bottom: 45, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const scaleY = val => chartH - (val / maxVal) * chartH;

  const barWidth = 80;
  const xConsumption = padding.left + (chartW / 4) - (barWidth / 2);
  const xGeneration = padding.left + (3 * chartW / 4) - (barWidth / 2);

  const hSelfCons = (selfConsumed / maxVal) * chartH;
  const hGridImport = (gridImport / maxVal) * chartH;
  const ySelfCons = padding.top + chartH - hSelfCons;
  const yGridImport = ySelfCons - hGridImport;

  const hSelfGen = (selfConsumed / maxVal) * chartH;
  const hExport = (exported / maxVal) * chartH;
  const ySelfGen = padding.top + chartH - hSelfGen;
  const yExport = ySelfGen - hExport;

  const gridSteps = 4;
  let gridLinesSvg = '';
  for (let i = 0; i <= gridSteps; i++) {
    const v = (maxVal / gridSteps) * i;
    const y = padding.top + scaleY(v);
    gridLinesSvg += `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
      <text x="${padding.left - 8}" y="${y + 4}" fill="#8DA8B6" font-size="10" text-anchor="end">${formatNum(v, 0)}</text>
    `;
  }

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" style="width: 100%; height: auto;" preserveAspectRatio="xMidYMid meet">
      ${gridLinesSvg}
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />

      <!-- Bar 1: Electricity Consumption Stack -->
      <g class="chart-bar-group">
        <rect x="${xConsumption}" y="${ySelfCons}" width="${barWidth}" height="${hSelfCons}" rx="3" fill="${COLORS.cyan}" opacity="0.95" />
        <rect x="${xConsumption}" y="${yGridImport}" width="${barWidth}" height="${hGridImport}" rx="3" fill="#D9534F" opacity="0.85" />
        <text x="${xConsumption + barWidth / 2}" y="${yGridImport - 8}" fill="#FFFFFF" font-size="12" font-weight="700" text-anchor="middle">
          ${formatNum(consumption, 0)} kWh
        </text>
        <text x="${xConsumption + barWidth / 2}" y="${height - 18}" fill="#A8BFCA" font-size="11" font-weight="600" text-anchor="middle">
          ใช้ไฟฟ้าเดิม
        </text>
      </g>

      <!-- Bar 2: Solar Generation Stack -->
      <g class="chart-bar-group">
        <rect x="${xGeneration}" y="${ySelfGen}" width="${barWidth}" height="${hSelfGen}" rx="3" fill="${COLORS.cyan}" opacity="0.95" />
        <rect x="${xGeneration}" y="${yExport}" width="${barWidth}" height="${hExport}" rx="3" fill="${COLORS.yellow}" opacity="0.95" />
        <text x="${xGeneration + barWidth / 2}" y="${yExport - 8}" fill="${COLORS.yellow}" font-size="12" font-weight="700" text-anchor="middle">
          ${formatNum(generation, 0)} kWh
        </text>
        <text x="${xGeneration + barWidth / 2}" y="${height - 18}" fill="#A8BFCA" font-size="11" font-weight="600" text-anchor="middle">
          ผลิตจากโซลาร์
        </text>
      </g>
    </svg>
    <div class="chart-legend">
      <span><i style="background: ${COLORS.cyan}"></i> ใช้เอง (${formatNum(selfConsumed, 0)} kWh)</span>
      <span><i style="background: ${COLORS.yellow}"></i> ส่งออก Grid (${formatNum(exported, 0)} kWh)</span>
      <span><i style="background: #D9534F"></i> ซื้อไฟเพิ่ม (${formatNum(gridImport, 0)} kWh)</span>
    </div>
  `;

  el.innerHTML = svg;
}

/**
 * 2. Bill Comparison Chart
 */
export function renderBillComparisonChart(container, data) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const preBill = Math.max(0, data.preSolarBill || 0);
  const postBill = Math.max(0, data.postSolarBill || 0);
  const savings = Math.max(0, data.monthlySavings || 0);

  const maxVal = Math.max(preBill, postBill, 1000) * 1.18;
  const width = 460;
  const height = 240;
  const padding = { top: 30, right: 25, bottom: 45, left: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const scaleY = val => chartH - (val / maxVal) * chartH;

  const barWidth = 80;
  const xPre = padding.left + (chartW / 4) - (barWidth / 2);
  const xPost = padding.left + (3 * chartW / 4) - (barWidth / 2);

  const hPre = (preBill / maxVal) * chartH;
  const yPre = padding.top + chartH - hPre;

  const hPost = (postBill / maxVal) * chartH;
  const yPost = padding.top + chartH - hPost;

  const gridSteps = 4;
  let gridLinesSvg = '';
  for (let i = 0; i <= gridSteps; i++) {
    const v = (maxVal / gridSteps) * i;
    const y = padding.top + scaleY(v);
    gridLinesSvg += `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
      <text x="${padding.left - 8}" y="${y + 4}" fill="#8DA8B6" font-size="10" text-anchor="end">฿${formatNum(v, 0)}</text>
    `;
  }

  const savingsPercent = preBill > 0 ? (savings / preBill) * 100 : 0;

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" style="width: 100%; height: auto;" preserveAspectRatio="xMidYMid meet">
      ${gridLinesSvg}
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />

      <!-- Pre-Solar Bill Bar -->
      <g class="chart-bar-group">
        <rect x="${xPre}" y="${yPre}" width="${barWidth}" height="${hPre}" rx="4" fill="#6D7D89" opacity="0.85" />
        <text x="${xPre + barWidth / 2}" y="${yPre - 8}" fill="#FFFFFF" font-size="12" font-weight="700" text-anchor="middle">
          ฿${formatNum(preBill, 0)}
        </text>
        <text x="${xPre + barWidth / 2}" y="${height - 18}" fill="#A8BFCA" font-size="11" font-weight="600" text-anchor="middle">
          ก่อนติดโซลาร์
        </text>
      </g>

      <!-- Post-Solar Bill Bar -->
      <g class="chart-bar-group">
        <rect x="${xPost}" y="${yPost}" width="${barWidth}" height="${hPost}" rx="4" fill="${COLORS.green}" opacity="0.9" />
        <text x="${xPost + barWidth / 2}" y="${yPost - 8}" fill="${COLORS.yellow}" font-size="12" font-weight="700" text-anchor="middle">
          ฿${formatNum(postBill, 0)}
        </text>
        <text x="${xPost + barWidth / 2}" y="${height - 18}" fill="#A8BFCA" font-size="11" font-weight="600" text-anchor="middle">
          หลังติดโซลาร์
        </text>
      </g>
    </svg>
    <div class="chart-legend">
      <span><i style="background: #6D7D89"></i> จ่ายเดิม (฿${formatNum(preBill, 0)}/ด.)</span>
      <span><i style="background: ${COLORS.green}"></i> จ่ายใหม่ (฿${formatNum(postBill, 0)}/ด.)</span>
      <span class="badge-saving">ประหยัด ฿${formatNum(savings, 0)}/ด. (-${formatNum(savingsPercent, 0)}%)</span>
    </div>
  `;

  el.innerHTML = svg;
}

/**
 * 3. 25-Year Cumulative Cash Flow Chart
 */
export function renderCumulativeCashflowChart(container, timeline, breakevenYear) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el || !Array.isArray(timeline) || timeline.length === 0) return;

  const width = 640;
  const height = 280;
  const padding = { top: 30, right: 35, bottom: 45, left: 80 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  let minCash = timeline[0].cumulativeCashFlow;
  let maxCash = timeline[timeline.length - 1].cumulativeCashFlow;
  if (minCash > 0) minCash = 0;
  if (maxCash < 0) maxCash = 10000;

  const range = maxCash - minCash;
  const yMin = minCash - (range * 0.05);
  const yMax = maxCash + (range * 0.10);

  const scaleX = yr => padding.left + (yr / 25) * chartW;
  const scaleY = val => padding.top + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  const yZero = scaleY(0);

  let pathD = '';
  let areaD = `M ${scaleX(0)} ${yZero} `;

  timeline.forEach((pt, idx) => {
    const x = scaleX(pt.year);
    const y = scaleY(pt.cumulativeCashFlow);
    if (idx === 0) {
      pathD += `M ${x} ${y} `;
    } else {
      pathD += `L ${x} ${y} `;
    }
    areaD += `L ${x} ${y} `;
  });
  areaD += `L ${scaleX(25)} ${yZero} Z`;

  const gridCount = 5;
  let gridLinesSvg = '';
  for (let i = 0; i <= gridCount; i++) {
    const val = yMin + ((yMax - yMin) / gridCount) * i;
    const y = scaleY(val);
    gridLinesSvg += `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2,2" />
      <text x="${padding.left - 8}" y="${y + 4}" fill="#8DA8B6" font-size="10" text-anchor="end">฿${formatNum(val, 0)}</text>
    `;
  }

  let xTicksSvg = '';
  for (let yr = 0; yr <= 25; yr += 5) {
    const x = scaleX(yr);
    xTicksSvg += `
      <line x1="${x}" y1="${padding.top + chartH}" x2="${x}" y2="${padding.top + chartH + 5}" stroke="#8DA8B6" />
      <text x="${x}" y="${padding.top + chartH + 18}" fill="#A8BFCA" font-size="10" text-anchor="middle">ปีที่ ${yr}</text>
    `;
  }

  let breakevenSvg = '';
  if (breakevenYear !== null && breakevenYear >= 0 && breakevenYear <= 25) {
    const bx = scaleX(breakevenYear);
    const by = yZero;
    breakevenSvg = `
      <line x1="${bx}" y1="${padding.top}" x2="${bx}" y2="${padding.top + chartH}" stroke="${COLORS.yellow}" stroke-width="1.5" stroke-dasharray="4,4" />
      <circle cx="${bx}" cy="${by}" r="6" fill="${COLORS.yellow}" stroke="${COLORS.navy}" stroke-width="2" />
      <g transform="translate(${bx}, ${padding.top + 15})">
        <rect x="-45" y="-12" width="90" height="22" rx="4" fill="${COLORS.yellow}" />
        <text x="0" y="2" fill="${COLORS.navy}" font-size="10" font-weight="800" text-anchor="middle">
          คืนทุนปีที่ ${formatNum(breakevenYear, 1)}
        </text>
      </g>
    `;
  }

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" style="width: 100%; height: auto;" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cashflowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${COLORS.green}" stop-opacity="0.35" />
          <stop offset="100%" stop-color="${COLORS.green}" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      ${gridLinesSvg}
      <line x1="${padding.left}" y1="${yZero}" x2="${width - padding.right}" y2="${yZero}" stroke="#E2E9ED" stroke-width="1.5" opacity="0.4" />
      <text x="${width - padding.right + 5}" y="${yZero + 4}" fill="#E2E9ED" font-size="9" opacity="0.7">จุดคืนทุน (฿0)</text>

      <path d="${areaD}" fill="url(#cashflowGrad)" />
      <path d="${pathD}" fill="none" stroke="${COLORS.cyan}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      ${xTicksSvg}
      ${breakevenSvg}
    </svg>
    <div class="chart-legend">
      <span><i style="background: ${COLORS.cyan}"></i> กระแสเงินสดสะสม (Cumulative Cash Flow)</span>
      <span><i style="background: ${COLORS.yellow}"></i> จุดคืนทุน (Breakeven Point)</span>
      <span class="muted-note">คำนวณการเสื่อมของแผง (Degradation) 0.5% ต่อปีตลอด 25 ปี</span>
    </div>
  `;

  el.innerHTML = svg;
}

export const SolarCharts = {
  COLORS,
  renderEnergyComparisonChart,
  renderBillComparisonChart,
  renderCumulativeCashflowChart
};

export default SolarCharts;
