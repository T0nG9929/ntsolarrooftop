# Engineering Verification & Test Report

**Project:** Solar Rooftop Learning Lab  
**Version:** 2.0.0  
**Status:** ALL TESTS PASSED (54/54 Automated Tests)  
**Verification Date:** 2026-11-03  
**Verified by:** Senior Solar PV System Engineer & Software Architect  

---

## 1. ผลการทดสอบ Unit Tests (Automated Test Suite)

การทดสอบ Calculation Engine ดำเนินการผ่าน Node.js test runner (`node test/test-suite.js`) โดยครอบคลุม 3 ชุดการทดสอบหลัก:

```text
========================================================
  SOLAR ROOFTOP LEARNING LAB - ENGINEERING UNIT TESTS  
========================================================

[SUITE 1: Solar Sizing Engine]
  ✓ PASS: Daily kWh = Monthly kWh / 30.4375
  ✓ PASS: Zero monthly consumption yields 0 daily kWh
  ✓ PASS: Negative monthly consumption yields 0 daily kWh
  ✓ PASS: Target Daily kWh = Daily kWh × Offset
  ✓ PASS: 0% offset yields 0 target kWh
  ✓ PASS: Offset clamped to max 1.0 (100%)
  ✓ PASS: PV kWp = Target Daily kWh / (PSH × PR)
  ✓ PASS: Zero target kWh yields 0 kWp
  ✓ PASS: Zero PSH avoids division by zero, yields 0 kWp
  ✓ PASS: Zero PR avoids division by zero, yields 0 kWp
  ✓ PASS: Panel count must be integer CEILING (expected 7, got 7)
  ✓ PASS: Installed kWp = Panel Count × Wattage / 1000 (3.85 kWp)
  ✓ PASS: Zero kWp yields 0 panels
  ✓ PASS: Zero panel wattage yields 0 panels without crash
  ✓ PASS: Daily Generation = Installed kWp × PSH × PR
  ✓ PASS: Monthly Generation = Daily Gen × 30.4375
  ✓ PASS: Annual Generation = Monthly Gen × 12
  ✓ PASS: Net Roof Area = Panel Count × Panel Area (25.8 m²)
  ✓ PASS: Gross Roof Area includes 20% maintenance clearance
  ✓ PASS: Nominal Inverter = Installed kWp / 1.10
  ✓ PASS: Inverter Screening Min = 80%
  ✓ PASS: Inverter Screening Max = 120%
  ✓ PASS: System <= 5kWp recommends Single-Phase
  ✓ PASS: System > 5kWp recommends Three-Phase
  ✓ PASS: Standard sizing inputs return success
  ✓ PASS: Panel count calculated properly
  ✓ PASS: Warnings array returned cleanly
  ✓ PASS: Zero monthly kWh correctly rejected with error
  ✓ PASS: Negative PSH correctly rejected

[SUITE 2: Financial & Payback Engine]
  ✓ PASS: Pre-solar Monthly Bill = Monthly kWh × Tariff (2,350 THB)
  ✓ PASS: Pre-solar Annual Bill = Monthly × 12 (28,200 THB)
  ✓ PASS: Zero kWh yields 0 bill
  ✓ PASS: Case A: Self-consumed = min(400 * 0.6, 500) = 240 kWh
  ✓ PASS: Case A: Export = max(0, 400 - 240) = 160 kWh
  ✓ PASS: Case A: Grid Import = 500 - 240 = 260 kWh
  ✓ PASS: Case B: Self-consumed capped at monthly consumption (200 kWh)
  ✓ PASS: Case B: Exported energy is 400 kWh
  ✓ PASS: Case B: Grid import is 0 kWh when 100% covered
  ✓ PASS: Zero export tariff credits only self-consumed energy
  ✓ PASS: Net bill matches grid import cost
  ✓ PASS: Exported energy credited at separate export tariff (not retail)
  ✓ PASS: Simple Payback = 140,000 / 28,000 = 5.0 years
  ✓ PASS: Payback is achievable
  ✓ PASS: Zero annual savings returns null payback without throwing division by zero
  ✓ PASS: isPaybackAchievable is false when savings are zero
  ✓ PASS: Timeline includes Year 0 to Year 25 (26 points)
  ✓ PASS: Year 0 net cash flow is -Initial Cost
  ✓ PASS: Breakeven year is achieved
  ✓ PASS: Breakeven year accounts for 0.5% degradation (~5.05 years)
  ✓ PASS: 25-year net profit is positive

[SUITE 3: Off-Grid & Battery Engine]
  ✓ PASS: Total daily Wh calculated correctly (2,600 Wh)
  ✓ PASS: Peak watts calculated correctly (300 W)
  ✓ PASS: Battery capacity in Ah matches engineering formula
  ✓ PASS: Battery nominal kWh = Ah × V / 1000 (~3.92 kWh)

========================================================
TEST SUMMARY: 54 PASSED, 0 FAILED out of 54 TOTAL
========================================================
```

---

## 2. กรณีทดสอบเปรียบเทียบเชิงวิศวกรรม (Engineering Benchmark Scenarios)

### กรณีที่ 1: บ้านพักอาศัยมาตรฐาน (Typical Residential Baseline)
- **ข้อมูลนำเข้า:**
  - การใช้ไฟฟ้า: $500 \text{ kWh/เดือน}$
  - ค่าไฟฟ้าเฉลี่ย: $4.70 \text{ บาท/kWh}$
  - สัดส่วนใช้ไฟกลางวัน: $65\%$
  - เป้าหมายการผลิต: $80\%$
  - ชั่วโมงแดด (PSH): $4.5 \text{ ชม./วัน}$
  - Performance Ratio (PR): $80\%$
  - แผงโซลาร์: $550 \text{ W}$ (พื้นที่ $2.58 \text{ m}^2$/แผง)
  - ต้นทุนติดตั้ง: $35,000 \text{ บาท/kWp}$
  - อัตรารับซื้อไฟคืน: $2.20 \text{ บาท/kWh}$
- **ผลลัพธ์การคำนวณ:**
  - ความต้องการพลังงานเป้าหมาย: $13.14 \text{ kWh/วัน}$
  - ขนาดระบบที่ต้องการ: $3.65 \text{ kWp}$
  - จำนวนแผง: $\lceil 3650 / 550 \rceil = 7 \text{ แผง}$
  - กำลังติดตั้งจริง: $7 \times 550 / 1000 = 3.85 \text{ kWp}$
  - ผลิตไฟเฉลี่ย: $421.9 \text{ kWh/เดือน}$
  - พลังงานใช้เอง (Self-consumed): $\min(421.9 \times 0.65, 500) = 274.2 \text{ kWh/เดือน}$
  - ไฟฟ้าส่วนเกินส่งออก (Exported): $421.9 - 274.2 = 147.7 \text{ kWh/เดือน}$
  - ค่าไฟฟ้าเดิม: $500 \times 4.70 = 2,350 \text{ บาท/เดือน}$
  - ค่าไฟฟ้าใหม่: $(500 - 274.2) \times 4.70 - (147.7 \times 2.20) = 1,060.7 - 324.9 = 735.8 \text{ บาท/เดือน}$
  - ผลประหยัดต่อเดือน: $1,614.2 \text{ บาท/เดือน}$ ($19,370 \text{ บาท/ปี}$)
  - เงินลงทุนระบบ: $3.85 \times 35,000 = 134,750 \text{ บาท}$
  - ระยะเวลาคืนทุน (Simple Payback): $134,750 / 19,370 = 6.95 \text{ ปี}$
  - ขนาด Inverter แนะนำ: $3.85 / 1.1 = 3.50 \text{ kW AC}$ (แนะนำระบบ 1 เฟส)

---

### กรณีที่ 2: เปรียบเทียบกรณี Zero Export vs มีสัญญารับซื้อไฟคืน
- เมื่อตั้งค่า **Export Tariff = 0.00 บาท/kWh** (ไม่มีสัญญาขายไฟคืน หรือติดตั้ง Zero Export Controller):
  - รายได้จากไฟส่วนเกินเป็น 0 บาท
  - ผลประหยัดต่อเดือนคิดเฉพาะไฟฟ้าที่ใช้เอง: $274.2 \times 4.70 = 1,288.7 \text{ บาท/เดือน}$
  - ระยะเวลาคืนทุน: $134,750 / (1,288.7 \times 12) = 8.71 \text{ ปี}$
- **ข้อสรุปเชิงวิศวกรรม:** ยืนยันว่าระบบแยกสูตรคำนวณระหว่าง Self-consumption และ Export Energy อย่างเคร่งครัดตามข้อกำหนด ไม่มีการคิดเหมารวมอัตรา

---

### กรณีที่ 3: ระบบขนาดใหญ่เกิน 5 kWp (Grid Code Phase Check)
- เมื่อขนาดระบบติดตั้ง $P_{\text{installed}} = 6.6 \text{ kWp}$ (12 แผง $\times$ 550W):
  - Inverter Phase แนะนำ: **3 เฟส (Three-Phase 400V)**
  - ตรงตามข้อกำหนดของการไฟฟ้านครหลวง (MEA) และการไฟฟ้าส่วนภูมิภาค (PEA) ที่กำหนดให้ระบบที่เกิน 5 kWp ต้องเชื่อมต่อแบบ 3 เฟส

---

## 3. การตรวจสอบความเข้ากันได้และการแสดงผล (UI & Environment)
- **Responsive Design:** ผ่านการทดสอบบนหน้าจอ Desktop (1440px), Laptop (1024px), Tablet (768px), และ Mobile (375px - 414px)
- **Print / PDF Generation:** รองรับ `@media print` สำหรับพิมพ์สรุปผลเป็นรายงานวิศวกรรมเบื้องต้นได้ทันทีโดยไม่มีเมนูหรือปุ่มควบคุมรบกวน
- **Asset Loading:** ไอคอนและภาพประกอบทั้งหมดเป็น Local SVG ไร้การพึ่งพา external CDN
- **Offline / GitHub Pages:** 100% Client-side Static Web Application พร้อม Deploy ทันที
