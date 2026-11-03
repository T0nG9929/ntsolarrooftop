/**
 * NT Solar Academy - Off-Grid & Battery Sizing Lab Module
 */

import { OffgridEngine } from '../../engine/offgrid-engine.js';
import { formulaExplanations } from '../../data/quiz-data.js';

export function getOffgridTemplate() {
  return `
    <div class="offgrid-wrapper" id="offgridApp">
      <div class="calc-header-strip">
        <div class="calc-header-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> STANDALONE BATTERY STORAGE DESIGN</span>
          <h2>ห้องทดลองระบบ <span>Off-Grid &amp; แบตเตอรี่</span></h2>
          <p>คำนวณการใช้พลังงานจากเครื่องใช้ไฟฟ้าจริง และออกแบบขนาดความจุแบตเตอรี่สำรองไฟอย่างถูกต้องตามมาตรฐาน DEDE &amp; IEC 62124</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="eyebrow">APPLIANCE LOAD PROFILE</span>
            <h3>รายการเครื่องใช้ไฟฟ้า (Daily Load Profile)</h3>
            <p>ระบุกำลังวัตต์ จำนวน และชั่วโมงการใช้งานในแต่ละวันเพื่อคำนวณความต้องการพลังงาน</p>
          </div>
          <span class="card-badge">ENERGY AUDIT</span>
        </div>

        <div class="table-responsive">
          <table class="load-table">
            <thead>
              <tr>
                <th style="width: 35%;">ชื่อเครื่องใช้ไฟฟ้า</th>
                <th style="width: 18%;">กำลังวัตต์ (W)</th>
                <th style="width: 15%;">จำนวน</th>
                <th style="width: 18%;">ชั่วโมง/วัน</th>
                <th style="width: 14%;">จัดการ</th>
              </tr>
            </thead>
            <tbody id="loadTableBody"></tbody>
          </table>
        </div>

        <div class="table-actions-row">
          <button class="btn btn-outline btn-sm" id="btnAddLoadRow" type="button">＋ เพิ่มเครื่องใช้ไฟฟ้า</button>
          <div class="preset-dropdown-wrap">
            <button class="btn btn-outline btn-sm" id="btnQuickAddPreset" type="button">⚡ ใส่ชุดตัวอย่างบ้านพัก</button>
          </div>
        </div>

        <div class="form-grid" style="margin-top: 24px;">
          <div class="form-group">
            <label class="form-label" for="offgridAutonomy">จำนวนวันสำรองไฟ (Autonomy Days)</label>
            <input class="form-control" id="offgridAutonomy" type="number" min="0.5" max="7" value="1.0" step="0.5">
            <small class="form-help">วันที่ไม่มีแดดหรือฝนตกต่อเนื่อง (แนะนำ 1.0 – 2.0 วัน)</small>
          </div>
          <div class="form-group">
            <label class="form-label" for="offgridVoltage">แรงดันระบบแบตเตอรี่ (Battery Voltage)</label>
            <select class="form-select" id="offgridVoltage">
              <option value="12">12 โวลต์ (ระบบขนาดเล็กมาก)</option>
              <option value="24">24 โวลต์ (ระบบขนาดกลาง)</option>
              <option value="48" selected>48 โวลต์ (ระบบมาตรฐานบ้านพักอาศัย)</option>
            </select>
            <small class="form-help">ระบบ 48V ช่วยลดกระแสในสายไฟและสูญเสียน้อยกว่า</small>
          </div>
          <div class="form-group">
            <label class="form-label" for="offgridDod">Depth of Discharge (DoD %)</label>
            <input class="form-control" id="offgridDod" type="number" min="20" max="95" value="80" step="5">
            <small class="form-help">80% สำหรับ LiFePO4, 50% สำหรับ Lead-Acid (เจล/น้ำ)</small>
          </div>
          <div class="form-group">
            <label class="form-label" for="offgridPsh">ชั่วโมงแดด (PSH)</label>
            <input class="form-control" id="offgridPsh" type="number" min="1" max="8" value="4.5" step="0.1">
            <small class="form-help">ชั่วโมงแดดเฉลี่ยต่อวัน (4.2 – 5.0 ชม./วัน)</small>
          </div>
        </div>

        <!-- Output Metric Grid -->
        <div class="stat-strip" style="margin-top: 24px; margin-bottom: 24px;">
          <div>
            <span class="stat-box-label">พลังงานโหลดต่อวัน</span>
            <strong style="color: var(--navy);"><span id="offgridDailyKwh">—</span> <small>kWh</small></strong>
            <small id="offgridDailyWhSub">กำลังคำนวณ...</small>
          </div>
          <div>
            <span class="stat-box-label">ความจุแบตเตอรี่ขั้นต่ำ</span>
            <strong style="color: var(--blue);"><span id="offgridBatteryAh">—</span> <small>Ah</small></strong>
            <small id="offgridBatteryVoltSub">ที่ระบบ 48V</small>
          </div>
          <div>
            <span class="stat-box-label">พลังงานแบตเตอรี่รวม</span>
            <strong style="color: var(--green);"><span id="offgridBatteryKwh">—</span> <small>kWh</small></strong>
            <small id="offgridBatteryUsableSub">พลังงานใช้งานได้</small>
          </div>
          <div>
            <span class="stat-box-label">แผงโซลาร์ที่แนะนำ</span>
            <strong style="color: #947900;"><span id="offgridPvKwp">—</span> <small>kWp</small></strong>
            <small id="offgridInverterSub">Inverter ≥ — kW</small>
          </div>
        </div>

        <div class="formula-strip">
          <div class="formula-icon">🔋</div>
          <div class="formula-text">
            <b>สูตรคำนวณความจุแบตเตอรี่</b>
            <p>Ah = (Adjusted Daily Wh × Autonomy Days) / (System Voltage × DoD × Battery Efficiency)</p>
          </div>
          <button class="btn-text" id="btnExplainBattery" type="button">ดูสูตรและการคำนวณ ↗</button>
        </div>
      </div>
    </div>
  `;
}

export class OffgridController {
  constructor(rootEl) {
    this.root = rootEl;
    this.appliances = [
      { name: 'หลอดไฟ LED', watts: 10, quantity: 8, hoursPerDay: 6 },
      { name: 'ตู้เย็น Inverter', watts: 120, quantity: 1, hoursPerDay: 12 },
      { name: 'พัดลมตั้งพื้น', watts: 50, quantity: 2, hoursPerDay: 8 },
      { name: 'สมาร์ททีวี', watts: 80, quantity: 1, hoursPerDay: 4 },
      { name: 'Wi-Fi Router', watts: 15, quantity: 1, hoursPerDay: 24 }
    ];

    this.init();
  }

  init() {
    this.renderTableRows();
    this.bindEvents();
    this.recalculate();
  }

  renderTableRows() {
    const tbody = this.root.querySelector('#loadTableBody');
    if (!tbody) return;

    tbody.innerHTML = this.appliances.map((app, idx) => `
      <tr data-index="${idx}">
        <td><input class="form-control form-control-sm" type="text" value="${app.name}" data-field="name"></td>
        <td><input class="form-control form-control-sm" type="number" min="1" max="10000" value="${app.watts}" data-field="watts"></td>
        <td><input class="form-control form-control-sm" type="number" min="1" max="100" value="${app.quantity}" data-field="quantity"></td>
        <td><input class="form-control form-control-sm" type="number" min="0.5" max="24" step="0.5" value="${app.hoursPerDay}" data-field="hoursPerDay"></td>
        <td style="text-align: center;">
          <button class="btn-delete-row" data-remove="${idx}" type="button" title="ลบรายการ">✕</button>
        </td>
      </tr>
    `).join('');
  }

  recalculate() {
    const $ = id => this.root.querySelector(`#${id}`);

    const loadProfile = OffgridEngine.calculateLoadProfile(this.appliances);
    const autonomyDays = parseFloat($('offgridAutonomy')?.value) || 1.0;
    const batteryVoltage = parseInt($('offgridVoltage')?.value, 10) || 48;
    const dod = (parseFloat($('offgridDod')?.value) || 80) / 100;
    const psh = parseFloat($('offgridPsh')?.value) || 4.5;

    const battery = OffgridEngine.calculateBatteryBank({
      dailyWh: loadProfile.dailyWh,
      autonomyDays,
      batteryVoltage,
      depthOfDischargeRatio: dod,
      batteryEfficiency: 0.90,
      inverterEfficiency: 0.92
    });

    const equipment = OffgridEngine.calculateOffgridEquipment({
      peakWatts: loadProfile.peakWatts,
      adjustedDailyWh: battery.adjustedDailyWh,
      psh,
      inverterEfficiency: 0.92
    });

    if ($('offgridDailyKwh')) $('offgridDailyKwh').textContent = (loadProfile.dailyWh / 1000).toFixed(2);
    if ($('offgridDailyWhSub')) $('offgridDailyWhSub').textContent = `${Math.round(loadProfile.dailyWh).toLocaleString()} Wh/วัน (Peak ${loadProfile.peakWatts} W)`;
    if ($('offgridBatteryAh')) $('offgridBatteryAh').textContent = Math.ceil(battery.batteryCapacityAh).toLocaleString();
    if ($('offgridBatteryVoltSub')) $('offgridBatteryVoltSub').textContent = `ที่แรงดัน ${batteryVoltage}V (DoD ${(dod * 100).toFixed(0)}%)`;
    if ($('offgridBatteryKwh')) $('offgridBatteryKwh').textContent = battery.nominalKwh.toFixed(2);
    if ($('offgridBatteryUsableSub')) $('offgridBatteryUsableSub').textContent = `ใช้ได้จริง ${battery.usableKwh.toFixed(2)} kWh`;
    if ($('offgridPvKwp')) $('offgridPvKwp').textContent = equipment.pvArrayKwp.toFixed(2);
    if ($('offgridInverterSub')) $('offgridInverterSub').textContent = `Inverter ≥ ${equipment.inverterContinuousKw.toFixed(1)} kW`;
  }

  bindEvents() {
    const $ = id => this.root.querySelector(`#${id}`);

    // Table row changes
    this.root.querySelector('#loadTableBody')?.addEventListener('input', e => {
      const input = e.target;
      const row = input.closest('tr');
      if (!row) return;
      const idx = parseInt(row.dataset.index, 10);
      const field = input.dataset.field;
      if (this.appliances[idx]) {
        if (field === 'name') this.appliances[idx].name = input.value;
        else this.appliances[idx][field] = parseFloat(input.value) || 0;
        this.recalculate();
      }
    });

    // Delete row
    this.root.querySelector('#loadTableBody')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-remove]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.remove, 10);
      this.appliances.splice(idx, 1);
      this.renderTableRows();
      this.recalculate();
    });

    // Add row
    $('btnAddLoadRow')?.addEventListener('click', () => {
      this.appliances.push({ name: 'อุปกรณ์ใหม่', watts: 100, quantity: 1, hoursPerDay: 2 });
      this.renderTableRows();
      this.recalculate();
    });

    // Quick add preset
    $('btnQuickAddPreset')?.addEventListener('click', () => {
      this.appliances = [
        { name: 'หลอดไฟ LED', watts: 10, quantity: 10, hoursPerDay: 6 },
        { name: 'ตู้เย็น 2 ประตู', watts: 150, quantity: 1, hoursPerDay: 12 },
        { name: 'พัดลม', watts: 50, quantity: 3, hoursPerDay: 8 },
        { name: 'ทีวีและเครื่องเสียง', watts: 120, quantity: 1, hoursPerDay: 4 },
        { name: 'คอมพิวเตอร์ทำงาน', watts: 150, quantity: 1, hoursPerDay: 6 },
        { name: 'เร้าเตอร์ Wi-Fi', watts: 20, quantity: 1, hoursPerDay: 24 }
      ];
      this.renderTableRows();
      this.recalculate();
    });

    // System inputs
    ['offgridAutonomy', 'offgridVoltage', 'offgridDod', 'offgridPsh'].forEach(id => {
      $(id)?.addEventListener('input', () => this.recalculate());
      $(id)?.addEventListener('change', () => this.recalculate());
    });

    // Battery explanation modal
    $('btnExplainBattery')?.addEventListener('click', () => {
      const dialog = document.querySelector('#explainDialog');
      if (!dialog) return;
      const titleEl = dialog.querySelector('#dialogTitle');
      const bodyEl = dialog.querySelector('#dialogBody');
      const topic = formulaExplanations.battery;
      if (titleEl && bodyEl && topic) {
        titleEl.textContent = topic.title;
        bodyEl.innerHTML = `
          <div class="code-banner"><code>${topic.code}</code></div>
          <p style="margin: 12px 0; font-size: 13px; line-height: 1.8; color: var(--text-dark);">${topic.desc}</p>
          <div style="font-size: 11px; color: var(--blue); font-weight: 700;">${topic.units}</div>
        `;
        dialog.showModal();
      }
    });
  }
}
