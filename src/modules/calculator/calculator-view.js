/**
 * NT Solar Academy - Solar Rooftop Calculator Module
 * 4-Step Interactive Engineering Design Wizard & Executive Dashboard
 */

import { SolarEngine } from '../../engine/solar-engine.js';
import { FinancialEngine } from '../../engine/financial-engine.js';
import { renderEnergyComparisonChart, renderBillComparisonChart, renderCumulativeCashflowChart } from './calculator-charts.js';
import { exportJsonReport, printPdfReport } from './calculator-report.js';
import { formulaExplanations } from '../../data/quiz-data.js';

export function getCalculatorTemplate(BASE_URL = './') {
  return `
    <div class="calculator-wrapper" id="calculatorApp">
      <!-- Section Header -->
      <div class="calc-header-strip">
        <div class="calc-header-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> PRELIMINARY SOLAR PV SIZING ENGINE</span>
          <h2>เครื่องคำนวณและออกแบบระบบ <span>Solar Rooftop</span></h2>
          <p>ประเมินขนาดแผงโซลาร์เซลล์ อินเวอร์เตอร์ พื้นที่หลังคา และผลประโยชน์ทางการเงินเบื้องต้น ด้วยหลักวิศวกรรมที่ตรวจสอบได้</p>
        </div>
        <div class="calc-header-actions">
          <button class="btn btn-outline btn-sm" id="btnResetCalc" type="button" title="รีเซ็ตค่าทั้งหมดเป็นค่าเริ่มต้น">
            ↺ รีเซ็ตค่าเริ่มต้น
          </button>
        </div>
      </div>

      <!-- Printable Header (For Print / PDF) -->
      <div class="print-only-header">
        <h1>รายงานผลการออกแบบระบบ Solar Rooftop เบื้องต้น</h1>
        <p>NT Solar Academy · Preliminary Engineering Design Report</p>
        <p>มาตรฐานอ้างอิง: IEC 62124 / ระเบียบการเชื่อมต่อโครงข่าย MEA &amp; PEA</p>
      </div>

      <!-- 4-Step Wizard Navigation -->
      <nav class="wizard-nav" aria-label="ขั้นตอนการออกแบบ">
        <button class="wizard-step-btn active" data-step="1" type="button">
          <span class="step-num">01</span>
          <div class="step-info">
            <b>ข้อมูลการใช้ไฟฟ้า</b>
            <small>ปริมาณไฟ, ค่าไฟ, พฤติกรรม</small>
          </div>
        </button>
        <button class="wizard-step-btn" data-step="2" type="button">
          <span class="step-num">02</span>
          <div class="step-info">
            <b>ออกแบบขนาดระบบ</b>
            <small>kWp, แผง, หลังคา, Inverter</small>
          </div>
        </button>
        <button class="wizard-step-btn" data-step="3" type="button">
          <span class="step-num">03</span>
          <div class="step-info">
            <b>วิเคราะห์ความคุ้มค่า</b>
            <small>ผลประหยัด, คืนทุน, กระแสเงินสด</small>
          </div>
        </button>
        <button class="wizard-step-btn" data-step="4" type="button">
          <span class="step-num">04</span>
          <div class="step-info">
            <b>สรุปผลการออกแบบ</b>
            <small>Dashboard, กราฟ, รายงาน</small>
          </div>
        </button>
      </nav>

      <!-- =====================================================================
           STEP 1: ข้อมูลการใช้ไฟฟ้า (DEMAND & RESOURCE)
           ===================================================================== -->
      <section class="step-container active" id="calc-step-1">
        <div class="step-layout">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="eyebrow">STEP 01 · DEMAND &amp; RESOURCE</span>
                <h3>ข้อมูลการใช้ไฟฟ้าและทรัพยากรแสง</h3>
                <p>กรอกข้อมูลการใช้พลังงานไฟฟ้าและพฤติกรรมการใช้ไฟเพื่อประเมินความต้องการระบบ</p>
              </div>
              <span class="card-badge">INPUT DATA</span>
            </div>

            <div class="form-grid">
              <!-- Monthly Consumption -->
              <div class="form-group">
                <label class="form-label" for="calcMonthlyKwh">
                  ปริมาณการใช้ไฟฟ้าต่อเดือน <span class="req">*</span>
                </label>
                <input class="form-control" id="calcMonthlyKwh" type="number" min="1" max="100000" value="500" step="1" required>
                <small class="form-help">หน่วย kWh (หน่วย) ต่อเดือน ดูได้จากบิลค่าไฟฟ้า</small>
              </div>

              <!-- Retail Tariff -->
              <div class="form-group">
                <label class="form-label" for="calcRetailTariff">
                  ค่าไฟฟ้าเฉลี่ยต่อหน่วย <span class="req">*</span>
                </label>
                <input class="form-control" id="calcRetailTariff" type="number" min="0.5" max="20" value="4.70" step="0.05" required>
                <small class="form-help">บาท / kWh (อัตราเฉลี่ยค่าไฟฟ้ารวม Ft และภาษีมูลค่าเพิ่ม)</small>
              </div>

              <!-- Daytime Consumption Percentage -->
              <div class="form-group full-width">
                <div class="form-label">
                  <span>สัดส่วนการใช้ไฟช่วงกลางวัน (Self-consumption Ratio)</span>
                  <span class="range-val" id="calcDaytimeSelfUseVal">65%</span>
                </div>
                <div class="range-wrap">
                  <input id="calcDaytimeSelfUse" type="range" min="10" max="100" value="65" step="5">
                </div>
                <small class="form-help">เปอร์เซ็นต์ไฟฟ้าที่ใช้ในช่วง 09:00 – 15:00 น. (โซลาร์เซลล์ On-grid ประหยัดค่าไฟได้สูงสุดเมื่อใช้ไฟตรงกับเวลาแดดออก)</small>
              </div>

              <!-- Target Solar Offset -->
              <div class="form-group full-width">
                <div class="form-label">
                  <span>เป้าหมายการลดค่าไฟฟ้า (Solar Offset Goal)</span>
                  <span class="range-val" id="calcOffsetPercentVal">80%</span>
                </div>
                <div class="range-wrap">
                  <input id="calcOffsetPercent" type="range" min="10" max="100" value="80" step="5">
                </div>
                <small class="form-help">สัดส่วนพลังงานที่ต้องการให้ระบบโซลาร์ผลิตชดเชย (แนะนำ 50% – 85% เพื่อป้องกันไฟเหลือทิ้ง)</small>
              </div>

              <!-- Peak Sun Hours (PSH) -->
              <div class="form-group">
                <label class="form-label" for="calcPsh">
                  Peak Sun Hours (PSH) <span class="req">*</span>
                </label>
                <input class="form-control" id="calcPsh" type="number" min="1.0" max="8.0" value="4.5" step="0.1" required>
                <small class="form-help">ชั่วโมงแดดเทียบเท่าต่อวัน (ประเทศไทยเฉลี่ย 4.2 – 5.0 ชม./วัน)</small>
              </div>

              <!-- System Type -->
              <div class="form-group">
                <label class="form-label" for="calcSystemType">
                  ประเภทระบบ Solar PV
                </label>
                <select class="form-select" id="calcSystemType">
                  <option value="on-grid" selected>On-grid (เชื่อมต่อสายส่ง ไม่ใช้แบตเตอรี่)</option>
                  <option value="hybrid">Hybrid (มีแบตเตอรี่สำรองไฟเมื่อไฟดับ)</option>
                  <option value="off-grid">Off-grid (อิสระจากสายส่ง พึ่งพาแบตเตอรี่ 100%)</option>
                </select>
                <small class="form-help">ระบบที่นิยมและคุ้มค่าที่สุดในเขตเมืองคือ On-grid</small>
              </div>
            </div>

            <div class="formula-strip">
              <div class="formula-icon">ƒx</div>
              <div class="formula-text">
                <b>หลักการคำนวณพลังงานที่ใช้ต่อวัน</b>
                <p>Daily kWh = Monthly kWh / 30.4375 (ใช้ค่าเฉลี่ย 365.25 ÷ 12 วันต่อเดือน)</p>
              </div>
              <button class="btn-text" type="button" data-explain="dailyConsumption">ดูสูตรและการคำนวณ ↗</button>
            </div>

            <div class="wizard-actions">
              <div></div>
              <button class="btn btn-dark" data-wizard-next type="button">
                ถัดไป: ออกแบบขนาดระบบ <span>→</span>
              </button>
            </div>
          </div>

          <!-- Live Preview Sidebar -->
          <aside class="card-live-result">
            <div class="live-header">
              <span class="eyebrow" style="color: var(--cyan);">LIVE ESTIMATION</span>
              <span class="live-pill">REAL-TIME</span>
            </div>
            <div class="kpi-hero">
              <span>ขนาดระบบติดตั้งที่แนะนำ</span>
              <strong id="sideLiveKwp">— <small>kWp</small></strong>
              <p id="sideLivePanels">กำลังคำนวณ...</p>
            </div>
            <div class="mini-kpi-grid">
              <div class="mini-kpi">
                <span>ผลิตไฟเฉลี่ย/เดือน</span>
                <b id="sideLiveMonthlyGen">—</b>
                <small>kWh / เดือน</small>
              </div>
              <div class="mini-kpi">
                <span>พื้นที่หลังคาที่ต้องใช้</span>
                <b id="sideLiveRoofArea">—</b>
                <small>ตร.ม. (m²)</small>
              </div>
              <div class="mini-kpi">
                <span>ประหยัดค่าไฟประมาณ</span>
                <b id="sideLiveSavings">—</b>
                <small>บาท / เดือน</small>
              </div>
              <div class="mini-kpi">
                <span>ระยะเวลาคืนทุน</span>
                <b id="sideLivePayback">—</b>
                <small>ปี (Simple Payback)</small>
              </div>
            </div>

            <div class="meter-block">
              <div class="meter-header">
                <span>การใช้พื้นที่หลังคา</span>
                <b id="sideRoofMeterText">—</b>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="sideRoofMeterFill" style="width: 0%;"></div>
              </div>
            </div>

            <div id="stepSizingWarnings"></div>
          </aside>
        </div>
      </section>

      <!-- =====================================================================
           STEP 2: ออกแบบขนาดระบบ (SIZING & EQUIPMENT)
           ===================================================================== -->
      <section class="step-container" id="calc-step-2">
        <div class="step-layout">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="eyebrow">STEP 02 · SYSTEM SIZING</span>
                <h3>ออกแบบขนาดระบบและอุปกรณ์หลัก</h3>
                <p>เลือกขนาดวัตต์ของแผงโซลาร์ ประสิทธิภาพรวมของระบบ และตรวจสอบพื้นที่หลังคา</p>
              </div>
              <span class="card-badge">PV SIZING</span>
            </div>

            <div class="form-grid">
              <!-- Panel Wattage Selection -->
              <div class="form-group full-width">
                <label class="form-label" for="calcPanelWattage">
                  กำลังวัตต์ของแผงโซลาร์เซลล์ (Panel Wattage) <span class="req">*</span>
                </label>
                <div class="preset-selector">
                  <button class="btn-pill" data-watt-preset="450" type="button">450 W (รุ่นมาตรฐานเดิม)</button>
                  <button class="btn-pill active" data-watt-preset="550" type="button">550 W (ยอดนิยมปัจจุบัน)</button>
                  <button class="btn-pill" data-watt-preset="600" type="button">600 W (รุ่นกำลังผลิตสูง)</button>
                </div>
                <input class="form-control" id="calcPanelWattage" type="number" min="100" max="1000" value="550" step="10" style="margin-top: 8px;">
                <small class="form-help">วัตต์ต่อแผง (W) แผงขนาดใหญ่จะใช้จำนวนแผงน้อยลง แต่ต้องมีพื้นที่รองรับขนาดแผงที่ยาวขึ้น</small>
              </div>

              <!-- Performance Ratio (PR) -->
              <div class="form-group full-width">
                <div class="form-label">
                  <span>ประสิทธิภาพรวมของระบบ (Performance Ratio: PR)</span>
                  <span class="range-val" id="calcPerformanceRatioVal">80%</span>
                </div>
                <div class="range-wrap">
                  <input id="calcPerformanceRatio" type="range" min="60" max="95" value="80" step="1">
                </div>
                <small class="form-help">คิดรวมความสูญเสียจากความร้อน (Temperature Loss), ฝุ่นเกาะ, ความต้านทานสายไฟ, และประสิทธิภาพ Inverter (ระบบทั่วไปอยู่ที่ 75% – 82%)</small>
              </div>

              <!-- Available Roof Area -->
              <div class="form-group">
                <label class="form-label" for="calcAvailableRoofArea">
                  พื้นที่หลังคาที่ใช้งานได้
                </label>
                <input class="form-control" id="calcAvailableRoofArea" type="number" min="0" max="5000" value="35" step="1">
                <small class="form-help">ตารางเมตร (m²) ไม่รวมพื้นที่เงาบังและแนวเว้นระยะชายคา</small>
              </div>

              <!-- Panel Footprint Info -->
              <div class="form-group">
                <label class="form-label">
                  พื้นที่ต่อแผงโดยประมาณ
                </label>
                <input class="form-control" id="calcPanelAreaDisplay" type="text" value="2.58 m² (สำหรับแผง 550W)" readonly>
                <small class="form-help">ขนาดมาตรฐานประมาณ 2.28 ม. × 1.13 ม. (คำนวณอัตโนมัติตามวัตต์)</small>
              </div>
            </div>

            <!-- Sizing Output Summary Cards -->
            <div class="calc-results-subgrid">
              <h4>ผลการคำนวณทางวิศวกรรม (Sizing Outputs)</h4>
              <div class="stat-mini-row">
                <div class="stat-box">
                  <span>ขนาดที่ต้องการคำนวณ</span>
                  <strong id="s2RecKwp">—</strong> <small>kWp</small>
                </div>
                <div class="stat-box">
                  <span>จำนวนแผง (CEILING)</span>
                  <strong style="color: var(--blue);" id="s2PanelCount">—</strong> <small>แผง</small>
                </div>
                <div class="stat-box">
                  <span>กำลังติดตั้งจริงรวม</span>
                  <strong style="color: var(--green);" id="s2InstalledKwp">—</strong> <small>kWp</small>
                </div>
              </div>

              <div class="detail-split-row">
                <div class="detail-box">
                  <b>พื้นที่หลังคาที่ใช้:</b>
                  <div style="margin-top: 4px;">พื้นที่แผงสุทธิ: <strong id="s2RoofNet">—</strong> m²</div>
                  <div style="color: var(--text-muted);">รวมทางเดินซ่อมบำรุง (+20%): <strong id="s2RoofGross">—</strong> m²</div>
                </div>
                <div class="detail-box">
                  <b>ประมาณการ Inverter:</b>
                  <div style="margin-top: 4px;">ขนาดแนะนำ (DC/1.1): <strong id="s2InvNominal">—</strong> kW AC</div>
                  <div style="color: var(--text-muted);">ช่วงคัดเลือก (80–120%): <span id="s2InvRange">—</span></div>
                  <div style="color: var(--blue); font-weight: 700; margin-top: 2px;" id="s2InvPhase">—</div>
                </div>
              </div>
            </div>

            <div class="formula-strip">
              <div class="formula-icon">ƒx</div>
              <div class="formula-text">
                <b>หลักการคำนวณขนาดระบบและจำนวนแผง</b>
                <p>PV kWp = Target Daily kWh / (PSH × PR) และ Panel Count = CEILING(PV kWp × 1000 / Panel Wattage)</p>
              </div>
              <button class="btn-text" type="button" data-explain="pvSizing">ดูสูตรและการคำนวณ ↗</button>
            </div>

            <div class="wizard-actions">
              <button class="btn btn-outline" data-wizard-prev type="button">← ย้อนกลับ</button>
              <button class="btn btn-dark" data-wizard-next type="button">ถัดไป: วิเคราะห์ความคุ้มค่า →</button>
            </div>
          </div>

          <!-- Equipment Side Banner -->
          <aside class="card-live-result">
            <div class="live-header">
              <span class="eyebrow" style="color: var(--cyan);">HARDWARE LAYOUT</span>
              <span class="live-pill">EQUIPMENT</span>
            </div>
            <div style="text-align: center; margin: 10px 0 20px;">
              <img src="${BASE_URL}assets/inverter.svg" alt="Inverter Equipment" style="width: 100%; max-height: 180px; object-fit: contain;">
            </div>
            <div style="background: rgba(255,255,255,0.06); padding: 14px; border-radius: var(--radius-sm); font-size: 11px; line-height: 1.6;">
              <b style="color: var(--yellow); display: block; margin-bottom: 4px;">ข้อควรคำนึงด้าน Inverter:</b>
              ขนาด Inverter ทางวิศวกรรมจริงต้องตรวจสอบแรงดันสตริง (Voc / Vmp ในช่วงอุณหภูมิต่ำสุดและสูงสุด) ให้ตรงกับช่วง MPPT Voltage Range ของผู้ผลิต
            </div>
          </aside>
        </div>
      </section>

      <!-- =====================================================================
           STEP 3: วิเคราะห์ความคุ้มค่า (FINANCIAL & PAYBACK)
           ===================================================================== -->
      <section class="step-container" id="calc-step-3">
        <div class="step-layout">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="eyebrow">STEP 03 · FINANCIAL ANALYSIS</span>
                <h3>วิเคราะห์ผลประหยัดและความคุ้มค่า</h3>
                <p>คำนวณค่าไฟฟ้าก่อนและหลังติดตั้ง จุดคืนทุน และกระแสเงินสดสะสม</p>
              </div>
              <span class="card-badge">FINANCIALS</span>
            </div>

            <div class="form-grid">
              <!-- Cost per kWp -->
              <div class="form-group">
                <label class="form-label" for="calcCostPerKwp">
                  เงินลงทุนติดตั้งต่อ kWp <span class="req">*</span>
                </label>
                <input class="form-control" id="calcCostPerKwp" type="number" min="15000" max="80000" value="35000" step="500" required>
                <small class="form-help">บาท / kWp รวมแผง อินเวอร์เตอร์ โครงสร้าง และค่าติดตั้ง (On-grid ทั่วไป ~30,000 – 38,000 บาท)</small>
              </div>

              <!-- Export Tariff -->
              <div class="form-group">
                <label class="form-label" for="calcExportTariff">
                  อัตรารับซื้อไฟฟ้าส่วนเกิน (Export Tariff)
                </label>
                <input class="form-control" id="calcExportTariff" type="number" min="0" max="10" value="2.20" step="0.10">
                <small class="form-help">บาท / kWh (โครงการโซลาร์ภาคประชาชน กฟน./กฟภ. รับซื้อ ~2.20 บาท หรือใส่ 0 หากไม่มีสัญญาขายไฟ)</small>
              </div>
            </div>

            <!-- Financial Breakdown Table -->
            <div class="calc-results-subgrid">
              <h4>ตารางวิเคราะห์เปรียบเทียบค่าไฟฟ้า (Before vs After Solar)</h4>
              
              <div class="bill-split-row">
                <div class="bill-card">
                  <span class="bill-label">ค่าไฟฟ้าเดิมก่อนติดโซลาร์</span>
                  <strong class="bill-val">฿<span id="s3PreBillMonthly">—</span></strong> <small>/เดือน</small>
                </div>

                <div class="bill-card highlight-green">
                  <span class="bill-label">ค่าไฟฟ้าสุทธิหลังติดโซลาร์</span>
                  <strong class="bill-val green">฿<span id="s3PostBillMonthly">—</span></strong> <small>/เดือน</small>
                </div>
              </div>

              <div class="stat-mini-row" style="margin-top: 14px;">
                <div class="stat-box blue-bg">
                  <span class="stat-box-label">ประหยัดค่าไฟ/เดือน</span>
                  <b class="stat-box-val">฿<span id="s3SavingsMonthly">—</span></b>
                </div>
                <div class="stat-box blue-bg">
                  <span class="stat-box-label">ประหยัดค่าไฟ/ปี</span>
                  <b class="stat-box-val">฿<span id="s3SavingsAnnual">—</span></b>
                </div>
                <div class="stat-box yellow-bg">
                  <span class="stat-box-label">ระยะเวลาคืนทุน (Payback)</span>
                  <b class="stat-box-val amber"><span id="s3PaybackYears">—</span> ปี</b>
                </div>
              </div>

              <!-- Energy Separation Notes -->
              <div class="energy-separation-note">
                <b>การแบ่งสัดส่วนพลังงาน (Energy Separation):</b>
                <div class="energy-sep-line">
                  <span>ไฟฟ้าโซลาร์ใช้เองในบ้าน (Self-consumed):</span>
                  <strong style="color: var(--cyan);"><span id="s3SelfKwh">—</span> kWh/ด.</strong>
                </div>
                <div class="energy-sep-line">
                  <span>ไฟฟ้าส่วนเกินส่งออก Grid (Exported):</span>
                  <strong style="color: var(--yellow);"><span id="s3ExportKwh">—</span> kWh/ด. (ได้เงิน ฿<span id="s3ExportRevenue">—</span>/ด.)</strong>
                </div>
                <small>* ห้ามคิดว่าไฟฟ้าส่งออกจะได้รับค่าตอบแทนเท่ากับค่าไฟฟ้าที่ซื้อเข้า การคำนวณแยกอัตราชัดเจนเพื่อความถูกต้องทางวิศวกรรมการเงิน</small>
              </div>
            </div>

            <div class="formula-strip">
              <div class="formula-icon">ƒx</div>
              <div class="formula-text">
                <b>สูตรการประหยัดและระยะเวลาคืนทุน</b>
                <p>Monthly Savings = Self-consumed × Retail Tariff + Export × Export Tariff และ Payback = Cost / Annual Savings</p>
              </div>
              <button class="btn-text" type="button" data-explain="financial">ดูสูตรและการคำนวณ ↗</button>
            </div>

            <div class="wizard-actions">
              <button class="btn btn-outline" data-wizard-prev type="button">← ย้อนกลับ</button>
              <button class="btn btn-dark" data-wizard-next type="button">ดูแดชบอร์ดสรุปผลการออกแบบ →</button>
            </div>
          </div>

          <aside class="card-live-result">
            <div class="live-header">
              <span class="eyebrow" style="color: var(--cyan);">FINANCIAL TRAJECTORY</span>
              <span class="live-pill">ROI</span>
            </div>
            <div style="text-align: center; margin: 10px 0 20px;">
              <img src="${BASE_URL}assets/energy-analytics.svg" alt="Energy Analytics" style="width: 100%; max-height: 180px; object-fit: contain;">
            </div>
            <div style="background: rgba(255,255,255,0.06); padding: 14px; border-radius: var(--radius-sm); font-size: 11px; line-height: 1.6;">
              <b style="color: var(--yellow); display: block; margin-bottom: 4px;">สมมติฐานการเงิน 25 ปี:</b>
              การจำลองคิดค่าการเสื่อมของแผงโซลาร์เซลล์ (Degradation) 0.5% ต่อปี ซึ่งเป็นค่ามาตรฐานสากลของแผงเกรด Tier-1 Monocrystalline
            </div>
          </aside>
        </div>
      </section>

      <!-- =====================================================================
           STEP 4: สรุปผลการออกแบบ (EXECUTIVE DASHBOARD)
           ===================================================================== -->
      <section class="step-container" id="calc-step-4">
        <!-- Section Header -->
        <div class="dash-top-bar">
          <div>
            <span class="eyebrow">STEP 04 · EXECUTIVE SUMMARY</span>
            <h3 style="font-size: 26px; font-weight: 800; color: var(--navy); margin-top: 4px;">สรุปผลการออกแบบระบบ Solar Rooftop</h3>
            <p style="color: var(--text-muted); font-size: 13px;">ผลลัพธ์การออกแบบเบื้องต้น ตัวชี้วัดหลัก กราฟวิเคราะห์พลังงาน และกระแสเงินสดสะสม 25 ปี</p>
          </div>
          <div class="dash-action-group">
            <button class="btn btn-outline btn-sm" data-jump-step="1" type="button">✏ แก้ไขข้อมูล</button>
            <button class="btn btn-dark btn-sm" id="btnRecalcDashboard" type="button">↺ คำนวณใหม่</button>
          </div>
        </div>

        <!-- 6 Visual KPI Cards -->
        <div class="dashboard-grid">
          <div class="kpi-card highlight">
            <div class="kpi-card-header">
              <span>RECOMMENDED PV SIZE</span>
              <span class="kpi-icon">⚡</span>
            </div>
            <div class="kpi-val" id="dashKpiSize">— <small>kWp</small></div>
            <div class="kpi-sub">กำลังติดตั้งแผงโซลาร์เซลล์รวม</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-card-header">
              <span>SOLAR PANELS REQUIRED</span>
              <span class="kpi-icon">▦</span>
            </div>
            <div class="kpi-val" id="dashKpiPanels">— <small>แผง</small></div>
            <div class="kpi-sub">จำนวนแผงที่คำนวณปัดขึ้น (CEILING)</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-card-header">
              <span>MONTHLY GENERATION</span>
              <span class="kpi-icon">☀</span>
            </div>
            <div class="kpi-val" id="dashKpiGen">— <small>kWh/ด.</small></div>
            <div class="kpi-sub">พลังงานไฟฟ้าเฉลี่ยที่ผลิตได้ต่อเดือน</div>
          </div>

          <div class="kpi-card highlight">
            <div class="kpi-card-header">
              <span>MONTHLY SAVINGS</span>
              <span class="kpi-icon">💰</span>
            </div>
            <div class="kpi-val" id="dashKpiSavings">— <small>บาท/ด.</small></div>
            <div class="kpi-sub">ค่าไฟฟ้าที่ประหยัดได้สุทธิเฉลี่ย</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-card-header">
              <span>SIMPLE PAYBACK PERIOD</span>
              <span class="kpi-icon">⏱</span>
            </div>
            <div class="kpi-val" id="dashKpiPayback">— <small>ปี</small></div>
            <div class="kpi-sub">ระยะเวลาคืนทุนโดยประมาณ</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-card-header">
              <span>ROOF AREA REQUIRED</span>
              <span class="kpi-icon">🏠</span>
            </div>
            <div class="kpi-val" id="dashKpiRoof">— <small>m²</small></div>
            <div class="kpi-sub">พื้นที่ติดตั้งแผงสุทธิบนหลังคา</div>
          </div>
        </div>

        <!-- Interactive SVG Charts Grid -->
        <div class="charts-grid">
          <div class="chart-card dark">
            <div class="chart-header">
              <h4>การใช้ไฟฟ้าเทียบกับการผลิต (Monthly Energy Balance)</h4>
              <span class="card-badge">kWh / เดือน</span>
            </div>
            <div id="chartEnergyComparison"></div>
          </div>

          <div class="chart-card dark">
            <div class="chart-header">
              <h4>เปรียบเทียบค่าไฟฟ้าก่อนและหลังติดตั้ง (Monthly Bill)</h4>
              <span class="card-badge" style="color: var(--yellow);">บาท / เดือน</span>
            </div>
            <div id="chartBillComparison"></div>
          </div>

          <div class="chart-card dark full-width">
            <div class="chart-header">
              <h4>กระแสเงินสดสะสมตลอดอายุโครงการ 25 ปี (25-Year Cumulative Cash Flow &amp; Breakeven)</h4>
              <span class="card-badge" style="color: #34D399;">กระแสเงินสดสุทธิ (THB)</span>
            </div>
            <div id="chartCashflow"></div>
          </div>
        </div>

        <!-- Engineering Disclaimer Card -->
        <div class="disclaimer-card">
          <div class="disclaimer-head">
            <span class="disclaimer-badge">ENGINEERING DISCLAIMER</span>
            <h4>ข้อจำกัดของการคำนวณทางวิศวกรรมเบื้องต้น (Preliminary Design Limitations)</h4>
          </div>
          <p class="disclaimer-lead">
            ระบบคำนวณนี้พัฒนาขึ้นเพื่อการเรียนรู้และประเมินความเป็นไปได้เบื้องต้น (Preliminary Solar PV Calculator) ไม่ใช่แบบวิศวกรรมสำหรับการติดตั้งจริง โดยระบบไม่ได้ดำเนินการดังต่อไปนี้:
          </p>
          <ul class="disclaimer-list">
            <li><strong>ไม่ได้คำนวณ String Configuration อย่างสมบูรณ์:</strong> ไม่ได้จัดจำนวนแผงอนุกรม/ขนานตามข้อจำกัดของ MPPT</li>
            <li><strong>ไม่ได้ตรวจสอบ Voc, Vmp, Isc, Imp ตามอุณหภูมิ:</strong> ไม่ได้คิดค่าสัมประสิทธิ์อุณหภูมิในสภาพอากาศสุดขั้ว</li>
            <li><strong>ไม่ได้ตรวจสอบ MPPT และ Inverter Voltage Limits:</strong> ต้องตรวจสอบ datasheet ของผู้ผลิตอินเวอร์เตอร์จริง</li>
            <li><strong>ไม่ได้ออกแบบ Cable Sizing และ Protection Devices:</strong> ไม่ได้คำนวณขนาดสายไฟ แรงดันตก, ฟิวส์, เบรกเกอร์, SPD, และ Rapid Shutdown</li>
            <li><strong>ไม่ได้คำนวณ Structural Roof Load:</strong> ไม่ได้ตรวจสอบความสามารถในการรับน้ำหนักของโครงสร้างหลังคาและแรงลม (Wind Load)</li>
            <li><strong>ไม่ได้จำลอง Shading อย่างละเอียด:</strong> ไม่ได้จำลองสิ่งกีดขวาง ทิศ และมุมเอียง 3 มิติ</li>
            <li><strong>ไม่ได้รับรองการอนุญาตจากการไฟฟ้า:</strong> การเชื่อมต่อเข้าระบบต้องยื่นขออนุญาตตามระเบียบ MEA หรือ PEA อย่างเป็นทางการ</li>
          </ul>
          <div class="disclaimer-footer">
            * การออกแบบติดตั้งจริงต้องได้รับการสำรวจหน้างาน คำนวณ และรับรองโดยวิศวกรไฟฟ้าและวิศวกรโยธาที่มีใบอนุญาตประกอบวิชาชีพตามกฎหมาย
          </div>
        </div>

        <!-- Dashboard Action Bar -->
        <div class="dashboard-actions-bar">
          <div class="action-group">
            <button class="btn btn-outline" data-jump-step="1" type="button">✏ แก้ไขข้อมูลนำเข้า</button>
            <button class="btn btn-outline" data-jump-step="2" type="button">⚙ ปรับแต่งขนาดแผง</button>
            <button class="btn btn-outline" data-jump-step="3" type="button">💵 ปรับสมมติฐานการเงิน</button>
          </div>
          <div class="action-group">
            <button class="btn btn-dark" id="btnDownloadJson" type="button">
              📥 ดาวน์โหลดรายงาน JSON
            </button>
            <button class="btn btn-yellow" id="btnPrintPdf" type="button">
              🖨 พิมพ์ / ดาวน์โหลดรายงาน PDF
            </button>
          </div>
        </div>
      </section>

      <!-- Formula Detail Modal Dialog -->
      <dialog id="explainDialog" class="explain-dialog">
        <div class="dialog-header">
          <h3 id="dialogTitle">รายละเอียดสูตรคำนวณ</h3>
          <button class="dialog-close" id="closeExplainDialog" type="button" aria-label="ปิด">✕</button>
        </div>
        <div class="dialog-content" id="dialogBody"></div>
      </dialog>
    </div>
  `;
}

export class CalculatorController {
  constructor(rootEl, BASE_URL = './') {
    this.root = rootEl;
    this.BASE_URL = BASE_URL;
    this.currentStep = 1;
    this.totalSteps = 4;

    this.state = {
      inputs: {
        monthlyKwh: 500,
        retailTariff: 4.70,
        daytimeSelfUse: 65,
        offsetPercent: 80,
        psh: 4.5,
        systemType: 'on-grid',
        panelWattage: 550,
        panelArea: 2.58,
        performanceRatio: 80,
        availableRoofArea: 35,
        costPerKwp: 35000,
        exportTariff: 2.20
      },
      sizingResult: null,
      financialResult: null
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.recalculate();
  }

  fmt(n, d = 1) {
    return Number.isFinite(n)
      ? n.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d })
      : '—';
  }

  fmtInt(n) {
    return Number.isFinite(n)
      ? Math.round(n).toLocaleString('th-TH')
      : '—';
  }

  syncInputsFromDom() {
    const $ = id => this.root.querySelector(`#${id}`);
    if (!$) return;

    this.state.inputs.monthlyKwh = parseFloat($('calcMonthlyKwh')?.value) || 0;
    this.state.inputs.retailTariff = parseFloat($('calcRetailTariff')?.value) || 0;
    this.state.inputs.daytimeSelfUse = parseInt($('calcDaytimeSelfUse')?.value, 10) || 65;
    this.state.inputs.offsetPercent = parseInt($('calcOffsetPercent')?.value, 10) || 80;
    this.state.inputs.psh = parseFloat($('calcPsh')?.value) || 4.5;
    this.state.inputs.systemType = $('calcSystemType')?.value || 'on-grid';
    this.state.inputs.panelWattage = parseInt($('calcPanelWattage')?.value, 10) || 550;
    this.state.inputs.performanceRatio = parseInt($('calcPerformanceRatio')?.value, 10) || 80;
    this.state.inputs.availableRoofArea = parseFloat($('calcAvailableRoofArea')?.value) || 0;
    this.state.inputs.costPerKwp = parseFloat($('calcCostPerKwp')?.value) || 35000;
    this.state.inputs.exportTariff = parseFloat($('calcExportTariff')?.value) || 0;

    // Dynamically calculate panel area
    const w = this.state.inputs.panelWattage;
    if (w >= 600) this.state.inputs.panelArea = 2.80;
    else if (w >= 500) this.state.inputs.panelArea = 2.58;
    else this.state.inputs.panelArea = 2.18;

    const areaDisplay = $('calcPanelAreaDisplay');
    if (areaDisplay) {
      areaDisplay.value = `${this.state.inputs.panelArea.toFixed(2)} m² (สำหรับแผง ${w}W)`;
    }
  }

  recalculate() {
    this.syncInputsFromDom();

    // 1. Solar Sizing Engine
    this.state.sizingResult = SolarEngine.calculateSolarSizing({
      monthlyKwh: this.state.inputs.monthlyKwh,
      offsetPercent: this.state.inputs.offsetPercent,
      psh: this.state.inputs.psh,
      performanceRatioPercent: this.state.inputs.performanceRatio,
      panelWattage: this.state.inputs.panelWattage,
      panelArea: this.state.inputs.panelArea,
      availableRoofArea: this.state.inputs.availableRoofArea,
      systemType: this.state.inputs.systemType
    });

    if (!this.state.sizingResult.success) {
      this.updateSidebarWarnings(this.state.sizingResult.errors);
      return;
    }

    // 2. Financial & Payback Engine
    this.state.financialResult = FinancialEngine.calculateFinancialEconomics({
      installedKwp: this.state.sizingResult.data.installedKwp,
      monthlyGenerationKwh: this.state.sizingResult.data.monthlyGenerationKwh,
      monthlyConsumptionKwh: this.state.inputs.monthlyKwh,
      retailTariff: this.state.inputs.retailTariff,
      daytimeSelfUsePercent: this.state.inputs.daytimeSelfUse,
      exportTariff: this.state.inputs.exportTariff,
      costPerKwp: this.state.inputs.costPerKwp
    });

    // 3. Update all UI representations
    this.updateSidebarPreview();
    this.updateStep2Display();
    this.updateStep3Display();
    this.updateDashboard();
  }

  updateSidebarPreview() {
    const $ = id => this.root.querySelector(`#${id}`);
    const sData = this.state.sizingResult?.data;
    const fData = this.state.financialResult?.data;

    if (!sData || !fData) return;

    if ($('sideLiveKwp')) $('sideLiveKwp').innerHTML = `${this.fmt(sData.installedKwp, 2)} <small>kWp</small>`;
    if ($('sideLivePanels')) $('sideLivePanels').textContent = `จำนวน ${sData.panelCount} แผง (${sData.panelWattage}W)`;
    if ($('sideLiveMonthlyGen')) $('sideLiveMonthlyGen').textContent = this.fmt(sData.monthlyGenerationKwh, 0);
    if ($('sideLiveRoofArea')) $('sideLiveRoofArea').textContent = this.fmt(sData.roofAreaNet, 1);
    if ($('sideLiveSavings')) $('sideLiveSavings').textContent = `฿${this.fmt(fData.monthlySavings, 0)}`;
    if ($('sideLivePayback')) {
      $('sideLivePayback').textContent = fData.paybackYears ? `${this.fmt(fData.paybackYears, 1)}` : 'N/A';
    }

    // Roof Meter Bar
    const meterFill = $('sideRoofMeterFill');
    const meterText = $('sideRoofMeterText');
    if (meterFill && meterText) {
      if (sData.availableRoofArea > 0) {
        const pct = Math.min(100, Math.round((sData.roofAreaNet / sData.availableRoofArea) * 100));
        meterFill.style.width = `${pct}%`;
        meterFill.style.background = pct > 90 ? 'var(--red)' : pct > 75 ? 'var(--yellow)' : 'var(--cyan)';
        meterText.textContent = `${pct}% (${this.fmt(sData.roofAreaNet, 1)} / ${sData.availableRoofArea} m²)`;
      } else {
        meterFill.style.width = '0%';
        meterText.textContent = `${this.fmt(sData.roofAreaNet, 1)} m² (ไม่ได้ระบุพื้นที่)`;
      }
    }

    this.updateSidebarWarnings(this.state.sizingResult.warnings);
  }

  updateSidebarWarnings(warnings) {
    const box = this.root.querySelector('#stepSizingWarnings');
    if (!box) return;
    if (!warnings || warnings.length === 0) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML = warnings.map(w => `
      <div class="warning-callout">
        <span class="warning-icon">⚠</span>
        <p>${w}</p>
      </div>
    `).join('');
  }

  updateStep2Display() {
    const $ = id => this.root.querySelector(`#${id}`);
    const s = this.state.sizingResult?.data;
    if (!s) return;

    if ($('s2RecKwp')) $('s2RecKwp').textContent = this.fmt(s.requiredKwp, 2);
    if ($('s2PanelCount')) $('s2PanelCount').textContent = s.panelCount;
    if ($('s2InstalledKwp')) $('s2InstalledKwp').textContent = this.fmt(s.installedKwp, 2);
    if ($('s2RoofNet')) $('s2RoofNet').textContent = this.fmt(s.roofAreaNet, 1);
    if ($('s2RoofGross')) $('s2RoofGross').textContent = this.fmt(s.roofAreaGross, 1);
    if ($('s2InvNominal')) $('s2InvNominal').textContent = this.fmt(s.inverterNominalKw, 2);
    if ($('s2InvRange')) $('s2InvRange').textContent = `${this.fmt(s.inverterMinKw, 1)} – ${this.fmt(s.inverterMaxKw, 1)} kW`;
    if ($('s2InvPhase')) $('s2InvPhase').textContent = `ระบบไฟแนะนำ: ${s.inverterPhase}`;
  }

  updateStep3Display() {
    const $ = id => this.root.querySelector(`#${id}`);
    const f = this.state.financialResult?.data;
    if (!f) return;

    if ($('s3PreBillMonthly')) $('s3PreBillMonthly').textContent = this.fmt(f.preSolarMonthlyBill, 0);
    if ($('s3PostBillMonthly')) $('s3PostBillMonthly').textContent = this.fmt(f.postSolarNetMonthlyBill, 0);
    if ($('s3SavingsMonthly')) $('s3SavingsMonthly').textContent = this.fmt(f.monthlySavings, 0);
    if ($('s3SavingsAnnual')) $('s3SavingsAnnual').textContent = this.fmt(f.annualSavings, 0);
    if ($('s3PaybackYears')) $('s3PaybackYears').textContent = f.paybackYears ? this.fmt(f.paybackYears, 1) : '—';
    if ($('s3SelfKwh')) $('s3SelfKwh').textContent = this.fmt(f.selfConsumedKwh, 0);
    if ($('s3ExportKwh')) $('s3ExportKwh').textContent = this.fmt(f.exportedKwh, 0);
    if ($('s3ExportRevenue')) $('s3ExportRevenue').textContent = this.fmt(f.exportRevenue, 0);
  }

  updateDashboard() {
    const $ = id => this.root.querySelector(`#${id}`);
    const s = this.state.sizingResult?.data;
    const f = this.state.financialResult?.data;
    if (!s || !f) return;

    if ($('dashKpiSize')) $('dashKpiSize').innerHTML = `${this.fmt(s.installedKwp, 2)} <small>kWp</small>`;
    if ($('dashKpiPanels')) $('dashKpiPanels').innerHTML = `${s.panelCount} <small>แผง (${s.panelWattage}W)</small>`;
    if ($('dashKpiGen')) $('dashKpiGen').innerHTML = `${this.fmt(s.monthlyGenerationKwh, 0)} <small>kWh/ด.</small>`;
    if ($('dashKpiSavings')) $('dashKpiSavings').innerHTML = `฿${this.fmt(f.monthlySavings, 0)} <small>/ด.</small>`;
    if ($('dashKpiPayback')) $('dashKpiPayback').innerHTML = `${f.paybackYears ? this.fmt(f.paybackYears, 1) : '—'} <small>ปี</small>`;
    if ($('dashKpiRoof')) $('dashKpiRoof').innerHTML = `${this.fmt(s.roofAreaNet, 1)} <small>m²</small>`;

    // Render Charts
    renderEnergyComparisonChart(this.root.querySelector('#chartEnergyComparison'), {
      consumption: this.state.inputs.monthlyKwh,
      generation: s.monthlyGenerationKwh,
      selfConsumed: f.selfConsumedKwh,
      exported: f.exportedKwh,
      gridImport: f.gridImportKwh
    });

    renderBillComparisonChart(this.root.querySelector('#chartBillComparison'), {
      preSolarBill: f.preSolarMonthlyBill,
      postSolarBill: f.postSolarNetMonthlyBill,
      monthlySavings: f.monthlySavings
    });

    if (f.cashFlow?.timeline) {
      renderCumulativeCashflowChart(
        this.root.querySelector('#chartCashflow'),
        f.cashFlow.timeline,
        f.cashFlow.breakevenYear
      );
    }
  }

  goToStep(step) {
    if (step < 1 || step > this.totalSteps) return;
    this.currentStep = step;

    // Update active tab buttons
    this.root.querySelectorAll('.wizard-step-btn').forEach(btn => {
      const s = parseInt(btn.dataset.step, 10);
      btn.classList.toggle('active', s === step);
    });

    // Update active step containers
    this.root.querySelectorAll('.step-container').forEach(c => c.classList.remove('active'));
    const target = this.root.querySelector(`#calc-step-${step}`);
    if (target) target.classList.add('active');

    if (step === 4) {
      this.recalculate();
    }
  }

  openExplainModal(topicKey) {
    const dialog = this.root.querySelector('#explainDialog');
    const titleEl = this.root.querySelector('#dialogTitle');
    const bodyEl = this.root.querySelector('#dialogBody');
    const topic = formulaExplanations[topicKey];

    if (!dialog || !topic) return;

    titleEl.textContent = topic.title;
    bodyEl.innerHTML = `
      <div class="code-banner">
        <code>${topic.code}</code>
      </div>
      <p style="margin: 12px 0; font-size: 13px; line-height: 1.8; color: var(--text-dark);">${topic.desc}</p>
      <div style="font-size: 11px; color: var(--blue); font-weight: 700;">${topic.units}</div>
    `;
    dialog.showModal();
  }

  bindEvents() {
    const $ = id => this.root.querySelector(`#${id}`);

    // Input changes
    const inputsToWatch = [
      'calcMonthlyKwh', 'calcRetailTariff', 'calcPsh', 'calcSystemType',
      'calcPanelWattage', 'calcAvailableRoofArea', 'calcCostPerKwp', 'calcExportTariff'
    ];
    inputsToWatch.forEach(id => {
      $(id)?.addEventListener('input', () => this.recalculate());
      $(id)?.addEventListener('change', () => this.recalculate());
    });

    // Sliders with value badges
    const sliderDaytime = $('calcDaytimeSelfUse');
    const valDaytime = $('calcDaytimeSelfUseVal');
    sliderDaytime?.addEventListener('input', () => {
      if (valDaytime) valDaytime.textContent = `${sliderDaytime.value}%`;
      this.recalculate();
    });

    const sliderOffset = $('calcOffsetPercent');
    const valOffset = $('calcOffsetPercentVal');
    sliderOffset?.addEventListener('input', () => {
      if (valOffset) valOffset.textContent = `${sliderOffset.value}%`;
      this.recalculate();
    });

    const sliderPr = $('calcPerformanceRatio');
    const valPr = $('calcPerformanceRatioVal');
    sliderPr?.addEventListener('input', () => {
      if (valPr) valPr.textContent = `${sliderPr.value}%`;
      this.recalculate();
    });

    // Watt presets
    this.root.querySelectorAll('[data-watt-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.root.querySelectorAll('[data-watt-preset]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const watt = parseInt(btn.dataset.wattPreset, 10);
        const panelInput = $('calcPanelWattage');
        if (panelInput) panelInput.value = watt;
        this.recalculate();
      });
    });

    // Wizard Nav Buttons
    this.root.querySelectorAll('.wizard-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.dataset.step, 10);
        this.goToStep(step);
      });
    });

    this.root.querySelectorAll('[data-wizard-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(this.currentStep + 1);
      });
    });

    this.root.querySelectorAll('[data-wizard-prev]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(this.currentStep - 1);
      });
    });

    this.root.querySelectorAll('[data-jump-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.dataset.jumpStep, 10);
        this.goToStep(step);
      });
    });

    // Explain formula dialog
    this.root.querySelectorAll('[data-explain]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openExplainModal(btn.dataset.explain);
      });
    });

    $('closeExplainDialog')?.addEventListener('click', () => {
      $('explainDialog')?.close();
    });
    $('explainDialog')?.addEventListener('click', e => {
      if (e.target === $('explainDialog')) $('explainDialog').close();
    });

    // Reset All Button
    $('btnResetCalc')?.addEventListener('click', () => {
      if (confirm('คุณต้องการรีเซ็ตค่าเริ่มต้นทั้งหมดใช่หรือไม่?')) {
        if ($('calcMonthlyKwh')) $('calcMonthlyKwh').value = 500;
        if ($('calcRetailTariff')) $('calcRetailTariff').value = 4.70;
        if (sliderDaytime) { sliderDaytime.value = 65; if (valDaytime) valDaytime.textContent = '65%'; }
        if (sliderOffset) { sliderOffset.value = 80; if (valOffset) valOffset.textContent = '80%'; }
        if ($('calcPsh')) $('calcPsh').value = 4.5;
        if ($('calcSystemType')) $('calcSystemType').value = 'on-grid';
        if ($('calcPanelWattage')) $('calcPanelWattage').value = 550;
        if (sliderPr) { sliderPr.value = 80; if (valPr) valPr.textContent = '80%'; }
        if ($('calcAvailableRoofArea')) $('calcAvailableRoofArea').value = 35;
        if ($('calcCostPerKwp')) $('calcCostPerKwp').value = 35000;
        if ($('calcExportTariff')) $('calcExportTariff').value = 2.20;
        this.root.querySelectorAll('[data-watt-preset]').forEach(b => {
          b.classList.toggle('active', b.dataset.wattPreset === '550');
        });
        this.recalculate();
        this.goToStep(1);
      }
    });

    // Recalculate Dashboard
    $('btnRecalcDashboard')?.addEventListener('click', () => {
      this.recalculate();
    });

    // Export Reports
    $('btnDownloadJson')?.addEventListener('click', () => {
      exportJsonReport({
        inputs: this.state.inputs,
        sizing: this.state.sizingResult,
        financial: this.state.financialResult
      });
    });

    $('btnPrintPdf')?.addEventListener('click', () => {
      printPdfReport();
    });
  }
}
