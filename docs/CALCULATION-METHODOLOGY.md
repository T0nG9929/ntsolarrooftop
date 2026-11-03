# Calculation Methodology & Engineering Reference

**Project:** Solar Rooftop Learning Lab  
**Version:** 2.0.0  
**Classification:** Preliminary Solar PV Engineering & Educational Sizing  
**Design Standard References:**
- Department of Alternative Energy Development and Efficiency (DEDE), Ministry of Energy, Thailand: *คู่มือสร้างความรู้ เสริมทักษะโซลาร์รูฟ* (2023)
- Metropolitan Electricity Authority (MEA) & Provincial Electricity Authority (PEA): *ระเบียบการเชื่อมต่อระบบโครงข่ายไฟฟ้าสำหรับผู้ผลิตไฟฟ้าพลังงานแสงอาทิตย์บนหลังคา*
- IEC 62124: Photovoltaic (PV) stand-alone systems – Design verification

---

## 1. วัตถุประสงค์ (Purpose)

คู่มือนี้จัดทำขึ้นเพื่ออธิบายหลักการทางวิศวกรรม ฟิสิกส์พลังงานแสงอาทิตย์ และสูตรทางคณิตศาสตร์ทั้งหมดที่ใช้ในระบบคำนวณ Solar Rooftop Learning Lab
ระบบนี้ถูกออกแบบขึ้นเพื่อสนับสนุนการเรียนรู้ในระดับ **Preliminary Design** (การประเมินและออกแบบเบื้องต้น) โดยเน้นความถูกต้องของหน่วยเอสไอ (SI Units) ป้องกันการหารด้วยศูนย์ ไม่ปัดเศษตัวเลขระหว่างขั้นตอน และแสดงผลลัพธ์ที่สามารถสอบทานย้อนกลับได้ทุกขั้นตอน

---

## 2. หน่วยวัดและอนุสัญญาทางวิศวกรรม (Units & Conventions)

- **กำลังไฟฟ้า (Power):** วัตต์ (W), กิโลวัตต์ (kW), กิโลวัตต์สูงสุดกระแสตรง ($kW_p$ DC)
- **พลังงานไฟฟ้า (Energy):** วัตต์-ชั่วโมง (Wh), กิโลวัตต์-ชั่วโมง (kWh หรือ หน่วยไฟฟ้า)
- **ชั่วโมงแดดเทียบเท่า (Peak Sun Hours: PSH):** มีหน่วยเป็นชั่วโมงต่อวัน ($h/day$) ซึ่งเทียบเท่ากับความหนาแน่นพลังงานรังสีอาทิตย์รวม $1 \text{ kWh/m}^2/\text{day}$ ที่ความเข้มแสงมาตรฐาน STC ($1,000 \text{ W/m}^2$)
- **จำนวนวันเฉลี่ยต่อเดือน (Days per Month):** ในทางวิศวกรรมดาราศาสตร์และพลังงานแสงอาทิตย์ ค่าเฉลี่ยจำนวนวันต่อเดือนคำนวณจากปีสุริยคติ $365.25 \div 12 = 30.4375 \text{ วัน/เดือน}$ เพื่อให้ค่ารายเดือนและรายปีสอดคล้องกันอย่างแม่นยำ
- **ประสิทธิภาพรวมของระบบ (Performance Ratio: PR):** สัดส่วนสัมประสิทธิ์ไร้หน่วย ($0.0 - 1.0$) รวมผลกระทบจากความร้อนของแผง (Temperature Derating), ฝุ่นละออง (Soiling Loss), ความต้านทานสายไฟฟ้ากระแสตรง/สลับ (Ohmic Loss), ความสูญเสียใน Inverter และ Mismatch Loss

---

## 3. สูตรคำนวณทางวิศวกรรม (Engineering Formulas)

### 3.1 การใช้พลังงานไฟฟ้าเฉลี่ยต่อวัน (Daily Energy Consumption)

$$E_{\text{daily}} = \frac{E_{\text{monthly}}}{30.4375}$$

- **ความหมาย:** ปริมาณพลังงานไฟฟ้าเฉลี่ยที่อาคารใช้ต่อวัน
- **หน่วย:** $\text{kWh/วัน}$
- **เงื่อนไข:** $E_{\text{monthly}} > 0$

---

### 3.2 พลังงานเป้าหมายที่ต้องการให้โซลาร์ผลิต (Target Daily Solar Energy)

$$E_{\text{target}} = E_{\text{daily}} \times \text{Solar Offset Ratio}$$

- **ความหมาย:** พลังงานเป้าหมายต่อวันที่ต้องการชดเชยด้วยพลังงานแสงอาทิตย์
- **หน่วย:** $\text{kWh/วัน}$
- **เงื่อนไข:** $\text{Solar Offset Ratio}$ เป็นสัดส่วน $0.10 \le \text{Offset} \le 1.00$ (10% ถึง 100%)

---

### 3.3 ขนาดกำลังผลิตติดตั้งที่ต้องการ (Estimated PV System Size)

$$P_{\text{required\_kWp}} = \frac{E_{\text{target}}}{\text{PSH} \times \text{PR}}$$

- **ความหมาย:** กำลังผลิตสูงสุดของแผงเซลล์แสงอาทิตย์ (DC) ที่ต้องติดตั้งเพื่อให้ได้พลังงานตามเป้าหมาย
- **หน่วย:** $\text{kWp}$ (Kilowatt-peak DC)
- **การป้องกันข้อผิดพลาด:** มีการตรวจสอบว่า $\text{PSH} > 0$ และ $\text{PR} > 0$ เพื่อป้องกัน Division by Zero

---

### 3.4 จำนวนแผงโซลาร์เซลล์ (Solar Panel Quantity)

$$N_{\text{panels}} = \left\lceil \frac{P_{\text{required\_kWp}} \times 1000}{P_{\text{panel\_W}}} \right\rceil = \text{CEILING}\left( \frac{P_{\text{required\_kWp}} \times 1000}{P_{\text{panel\_W}}} \right)$$

- **ความหมาย:** จำนวนแผงโซลาร์เซลล์ที่ต้องใช้
- **หน่วย:** แผง (จำนวนเต็มบวก)
- **หลักวิศวกรรม:** แผงโซลาร์เซลล์เป็นหน่วยทางกายภาพที่ไม่สามารถแบ่งครึ่งได้ จึงต้องใช้ฟังก์ชัน **CEILING (ปัดเศษขึ้น)** เสมอ เพื่อให้กำลังติดตั้งจริงไม่ต่ำกว่ากำลังไฟฟ้าเป้าหมาย

---

### 3.5 กำลังผลิตติดตั้งจริง (Installed PV Capacity)

$$P_{\text{installed\_kWp}} = \frac{N_{\text{panels}} \times P_{\text{panel\_W}}}{1000}$$

- **ความหมาย:** กำลังผลิตติดตั้งจริงรวมของระบบหลังจากการปัดเศษจำนวนแผง
- **หน่วย:** $\text{kWp}$ (Kilowatt-peak DC)

---

### 3.6 พลังงานไฟฟ้าที่ผลิตได้โดยประมาณ (Estimated Generation)

- **พลังงานที่ผลิตได้ต่อวัน (Daily Generation):**
  $$E_{\text{gen\_daily}} = P_{\text{installed\_kWp}} \times \text{PSH} \times \text{PR} \quad (\text{kWh/วัน})$$

- **พลังงานที่ผลิตได้ต่อเดือน (Monthly Generation):**
  $$E_{\text{gen\_monthly}} = E_{\text{gen\_daily}} \times 30.4375 \quad (\text{kWh/เดือน})$$

- **พลังงานที่ผลิตได้ต่อปี (Annual Generation):**
  $$E_{\text{gen\_annual}} = E_{\text{gen\_monthly}} \times 12 \quad (\text{kWh/ปี})$$

---

### 3.7 พื้นที่หลังคาที่ต้องใช้ (Estimated Roof Area)

$$A_{\text{roof\_net}} = N_{\text{panels}} \times A_{\text{panel}}$$
$$A_{\text{roof\_gross}} = A_{\text{roof\_net}} \times 1.20$$

- **ความหมาย:**
  - $A_{\text{roof\_net}}$: พื้นที่แผงรวมสุทธิ ($\text{m}^2$)
  - $A_{\text{roof\_gross}}$: พื้นที่หลังคารวมที่แนะนำ เผื่อทางเดินซ่อมบำรุงและแนวเว้นระยะชายคา 20%
- **ขนาดมาตรฐานต่อแผง:**
  - แผง 450W: $\sim 2.18 \text{ m}^2$ (ประมาณ $2.09 \times 1.04 \text{ ม.}$)
  - แผง 550W: $\sim 2.58 \text{ m}^2$ (ประมาณ $2.28 \times 1.13 \text{ ม.}$)
  - แผง 600W+: $\sim 2.80 \text{ m}^2$ (ประมาณ $2.47 \times 1.13 \text{ ม.}$)

---

### 3.8 การคัดเลือกขนาด Inverter เบื้องต้น (Preliminary Inverter Screening)

- **Inverter Nominal Size (ขนาดพิกัดแนะนำ):**
  $$P_{\text{inv\_nominal}} = \frac{P_{\text{installed\_kWp}}}{1.10} \quad (\text{kW AC})$$
  *(อ้างอิงอัตราส่วน Inverter Sizing Ratio DC/AC $\approx 1.10 - 1.25$)*
- **ช่วงคัดเลือกเบื้องต้น (Screening Range):**
  $$0.80 \times P_{\text{installed\_kWp}} \le P_{\text{inv}} \le 1.20 \times P_{\text{installed\_kWp}}$$
- **การแนะนำระบบเฟสไฟฟ้า (Grid Phase Standard ในไทย):**
  - $P_{\text{installed}} \le 5.0 \text{ kWp}$: แนะนำ 1 เฟส ($1\varnothing \text{ 230V}$)
  - $P_{\text{installed}} > 5.0 \text{ kWp}$: แนะนำ 3 เฟส ($3\varnothing \text{ 400V}$) ตามระเบียบ กฟน. / กฟภ.

---

## 4. การวิเคราะห์ทางเศรษฐศาสตร์และการเงิน (Financial & Economic Engine)

### 4.1 การแยกสัดส่วน Self-Consumption และ Export Energy

$$E_{\text{self}} = \min(E_{\text{gen\_monthly}} \times \text{Self-consumption Ratio}, E_{\text{consumption}})$$
$$E_{\text{export}} = \max(0, E_{\text{gen\_monthly}} - E_{\text{self}})$$
$$E_{\text{grid\_import}} = \max(0, E_{\text{consumption}} - E_{\text{self}})$$

> [!IMPORTANT]
> **หลักการวิศวกรรมการเงินที่สำคัญ:**
> ห้ามสมมติว่าพลังงานไฟฟ้าที่ส่งคืน Grid ได้จะได้รับเงินเต็มอัตราค่าไฟฟ้าซื้อเข้า
> - ไฟฟ้าที่ใช้เอง ($E_{\text{self}}$) จะประหยัดค่าไฟเต็มอัตราซื้อเข้า (Retail Tariff เช่น 4.70 บาท/หน่วย)
> - ไฟฟ้าส่วนเกินส่งออก ($E_{\text{export}}$) จะได้รับตามอัตราค่ารับซื้อไฟคืนส่วนเกิน (Export Tariff เช่น 2.20 บาท/หน่วย) หรือเป็น 0 บาทหากไม่มีสัญญาขายไฟคืนหรือระบบตั้งค่า Zero Export

---

### 4.2 ค่าไฟฟ้าก่อนและหลังติดตั้ง

- **ค่าไฟฟ้าเดิมก่อนติดโซลาร์:**
  $$\text{Bill}_{\text{pre}} = E_{\text{consumption}} \times \text{Tariff}_{\text{retail}}$$
- **ค่าไฟฟ้าสุทธิหลังติดโซลาร์:**
  $$\text{Bill}_{\text{post}} = (E_{\text{grid\_import}} \times \text{Tariff}_{\text{retail}}) - (E_{\text{export}} \times \text{Tariff}_{\text{export}})$$
- **ผลประหยัดค่าไฟฟ้ารายเดือน (Monthly Savings):**
  $$\text{Savings}_{\text{monthly}} = (E_{\text{self}} \times \text{Tariff}_{\text{retail}}) + (E_{\text{export}} \times \text{Tariff}_{\text{export}})$$
- **ผลประหยัดค่าไฟฟ้ารายปี (Annual Savings):**
  $$\text{Savings}_{\text{annual}} = \text{Savings}_{\text{monthly}} \times 12$$

---

### 4.3 ระยะเวลาคืนทุนอย่างง่าย (Simple Payback Period)

$$\text{Payback}_{\text{years}} = \frac{\text{System CAPEX}}{\text{Savings}_{\text{annual}}}$$

- **การป้องกันข้อผิดพลาด:** หาก $\text{Savings}_{\text{annual}} \le 0$ ระบบจะแสดงผลว่า "ไม่สามารถคืนทุนได้" โดยไม่เกิดข้อผิดพลาด Division by Zero

---

### 4.4 แบบจำลองกระแสเงินสดสะสม 25 ปี (25-Year Cumulative Cash Flow)

- คิดค่าการเสื่อมของแผงเซลล์แสงอาทิตย์ (Degradation Rate) ที่ $0.50\% \text{ ต่อปี}$:
  $$\text{Degradation Factor}_t = 1.0 - [0.005 \times (t - 1)] \quad \text{สำหรับปีที่ } t = 1, 2, \dots, 25$$
- กระแสเงินสดสุทธิปีที่ 0: $-\text{CAPEX}$
- กระแสเงินสดสะสมปีที่ $t$:
  $$\text{Cumulative Cash Flow}_t = -\text{CAPEX} + \sum_{i=1}^t \left( \text{Savings}_{\text{base}} \times \text{Degradation Factor}_i \right)$$
- จุดคืนทุน (Breakeven Point) คำนวณด้วยวิธี Linear Interpolation ในปีที่กระแสเงินสดสะสมเปลี่ยนเครื่องหมายจากลบเป็นบวก

---

## 5. ระบบ Off-grid และแบตเตอรี่ (Off-Grid & Battery Sizing)

$$E_{\text{adjusted\_daily\_Wh}} = \frac{\sum (W_i \times Q_i \times H_i)}{\eta_{\text{inverter}}}$$
$$C_{\text{battery\_Ah}} = \frac{E_{\text{adjusted\_daily\_Wh}} \times \text{Autonomy Days}}{V_{\text{system}} \times \text{DoD} \times \eta_{\text{battery}}}$$
$$E_{\text{battery\_kWh}} = \frac{C_{\text{battery\_Ah}} \times V_{\text{system}}}{1000}$$

- **$\text{DoD}$:** Depth of Discharge (LiFePO4 $\approx 80\%$, Lead-Acid $\approx 50\%$)
- **$\eta_{\text{battery}}$:** ประสิทธิภาพแบตเตอรี่ ($\approx 90\%$)
- **$\eta_{\text{inverter}}$:** ประสิทธิภาพ Inverter ($\approx 92\%$)

---

## 6. ข้อจำกัดทางวิศวกรรม (Engineering Limitations & Disclaimer)

ระบบคำนวณนี้เป็นการประเมินเบื้องต้น (Preliminary Design) ไม่สามารถใช้แทนแบบทางวิศวกรรมสำหรับการติดตั้งจริงได้ เนื่องจาก:
1. ไม่ได้คำนวณ String Configuration โดยละเอียด (Voc, Vmp, Isc, Imp ตามอุณหภูมิใช้งานจริง)
2. ไม่ได้ตรวจสอบหน้าต่างแรงดัน MPPT Voltage Window และขีดจำกัดกระแสลัดวงจรสูงสุดของอินเวอร์เตอร์
3. ไม่ได้ออกแบบขนาดสายไฟฟ้ากระแสตรง/สลับ (Cable Sizing & Voltage Drop), อุปกรณ์ป้องกัน (Circuit Breakers, DC Fuses, Surge Protection Device SPD), และระบบ Rapid Shutdown
4. ไม่ได้คำนวณ Structural Roof Loading และแรงลมยก (Wind Uplift Load) ตามมาตรฐานวิศวกรรมโยธา
5. ไม่ได้จำลอง Shading และ Azimuth/Tilt Yield แบบ 3 มิติ
6. ไม่ได้รับรองการอนุญาตขนานเครื่องกำเนิดไฟฟ้าจากการไฟฟ้า (MEA/PEA Grid Interconnection Code)
