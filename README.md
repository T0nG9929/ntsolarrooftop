# NT Solar Academy & Solar Rooftop Learning Lab

**Unified Learning & Preliminary Engineering Platform**  
*National Telecom Public Company Limited (NTPLC)*

---

## ☀️ ภาพรวมระบบที่รวมเป็นหนึ่งเดียว (Unified Platform)

ระบบนี้รวมสองโปรเจกต์สำคัญเข้าด้วยกันเป็น **Single Website, Single Repository, Single Deployment**:
1. **NT Solar Academy**: แพลตฟอร์มการเรียนรู้พลังงานแสงอาทิตย์ 12 โมดูล พร้อมแบบจำลองสามมิติสถานี NT (Three.js WebGL & AR) และคลังบทความ
2. **Solar Rooftop Learning Lab**: เครื่องคำนวณและออกแบบระบบโซลาร์เซลล์บนหลังคาระดับ Preliminary Engineering Design พร้อมเครื่องมือคำนวณ Off-grid Battery Lab และแบบทดสอบความรู้ Knowledge Quiz

**Target URL (GitHub Pages):**  
[https://t0ng9929.github.io/solar-rooftop-learning-lab/](https://t0ng9929.github.io/solar-rooftop-learning-lab/)

---

## 🧭 โครงสร้างเมนูหลัก 6 ส่วน (Phase 4 Navigation)

1. **Home (หน้าแรก)**: แนะนำแพลตฟอร์ม วิสัยทัศน์ ภาพบรรยากาศสถานีจริง NT สถิติระบบ และจุดเริ่มต้นการเรียนรู้
2. **Articles (คลังบทความ)**: รวบรวมเอกสารวิชาการ มาตรฐานการติดตั้ง และลิงก์คลังบทความ NT Cloud Box
3. **Solar Calculator (เครื่องคำนวณโซลาร์)**: วิซาร์ด 4 ขั้นตอนสำหรับประเมินขนาดแผง (kWp), จำนวนแผง (CEILING), ขนาด Inverter, สัดส่วน Self-consumption vs Export, ค่าไฟก่อน/หลังติด, และกราฟกระแสเงินสดสะสม 25 ปี
4. **Solar Learning Lab (เส้นทางการเรียนรู้)**: 12 โมดูลครอบคลุมตั้งแต่อุปกรณ์พื้นฐาน วงจร การป้องกัน การขออนุญาต จนถึงการซ่อมบำรุง พร้อมเอกสาร PDF ดาวน์โหลดและวิดีโอ
5. **3D Learning (แบบจำลอง 3 มิติ)**: Interactive WebGL Explorer แสดงโมเดลสถานีแลกเปลี่ยน NT (`LLK_exchange_site.glb`) หมุน/ซูม/เต็มจอได้อิสระ พร้อมเชื่อมต่อแอป AR `LLK_SolarAR`
6. **Knowledge Quiz (แบบทดสอบความรู้)**: ข้อสอบ 5 ข้อประเมินความเข้าใจหลักฟิสิกส์ วิศวกรรม และเศรษฐศาสตร์โซลาร์เซลล์ พร้อมเฉลยละเอียด
*(พร้อมห้องทดลองระบบ **Off-Grid & Battery Lab** สำหรับจำลองโหลดเครื่องใช้ไฟฟ้าและคำนวณความจุแบตเตอรี่)*

---

## ⚙️ สถาปัตยกรรมทางวิศวกรรม (Software & Calculation Architecture)

```
nt-solar-academy/
├── .github/workflows/
│   └── deploy-pages.yml          # GitHub Actions CI/CD (Test + Build + Deploy to Pages)
├── docs/
│   ├── CALCULATION-METHODOLOGY.md # เอกสารสูตรและมาตรฐานอ้างอิง
│   └── VERIFICATION-REPORT.md     # รายงานผลการสอบทานทางวิศวกรรม
├── public/
│   ├── 404.html                  # Single Page App 404 redirect handler สำหรับ GitHub Pages
│   ├── assets/                   # SVG Diagrams & Vector Illustrations
│   ├── models/                   # 3D GLB Models (LLK_exchange_site.glb)
│   └── resources/                # PDF เอกสารการเรียนรู้ 11 โมดูล
├── src/
│   ├── data/
│   │   ├── modules.js            # ข้อมูล 12 โมดูลการเรียนรู้
│   │   ├── simulators.js         # ลิงก์เครื่องมือจำลองภายนอก
│   │   └── quiz-data.js          # คลังข้อสอบและคำอธิบายสูตร
│   ├── engine/                   # Pure Decoupled Calculation Engines (Zero DOM Dependency)
│   │   ├── solar-engine.js       # Sizing, Panels, Inverter, Roof Area, Generation
│   │   ├── financial-engine.js   # Energy flows, Tariffs, Payback, 25-yr Degradation
│   │   └── offgrid-engine.js     # Load Profile, Battery Sizing, Offgrid Inverter/PV
│   ├── modules/
│   │   ├── calculator/           # Solar Rooftop Calculator View, Charts & Reports
│   │   ├── offgrid/              # Off-grid & Battery Sizing Lab
│   │   ├── quiz/                 # Knowledge Quiz Interactive View
│   │   └── three-viewer/         # Three.js 3D WebGL Model Viewer
│   ├── router/
│   │   └── router.js             # Native Hash Router (Direct route & Browser History)
│   ├── main.js                   # Application Entry Point
│   └── style.css                 # Unified Design System (Navy #071C2C & Yellow #F6C400)
├── tests/
│   └── engine.test.js            # 55 Unit Tests สำหรับ Calculation Engine
├── index.html
├── package.json
└── vite.config.js
```

---

## 📐 มาตรฐานและสูตรคำนวณ (Engineering Standards)

ระบบอ้างอิงมาตรฐานทางวิศวกรรมดังต่อไปนี้:
- **กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน (พพ. / DEDE)**: *คู่มือสร้างความรู้ เสริมทักษะโซลาร์รูฟ*
- **การไฟฟ้านครหลวง (กฟน. / MEA) & การไฟฟ้าส่วนภูมิภาค (กฟภ. / PEA)**: *ระเบียบการเชื่อมต่อระบบโครงข่ายไฟฟ้าสำหรับผู้ผลิตไฟฟ้าพลังงานแสงอาทิตย์บนหลังคา*
- **IEC 62124**: *Photovoltaic (PV) stand-alone systems – Design verification*

### สรุปสูตรหลัก:
1. **พลังงานใช้เฉลี่ยต่อวัน:** $E_{\text{daily}} = \frac{E_{\text{monthly}}}{30.4375}$
2. **ขนาดกำลังผลิต DC ที่ต้องการ:** $P_{\text{required}} = \frac{E_{\text{target}}}{\text{PSH} \times \text{PR}}$
3. **จำนวนแผง (CEILING):** $N_{\text{panels}} = \left\lceil \frac{P_{\text{required}} \times 1000}{P_{\text{panel\_W}}} \right\rceil$
4. **กำลังติดตั้งจริง:** $P_{\text{installed}} = \frac{N_{\text{panels}} \times P_{\text{panel\_W}}}{1000} \text{ (kWp)}$
5. **การแยก Self-consumption:** $E_{\text{self}} = \min(E_{\text{gen}} \times \text{SelfRatio}, E_{\text{consumption}})$
6. **ผลประหยัดค่าไฟ:** $\text{Savings} = (E_{\text{self}} \times \text{Tariff}_{\text{retail}}) + (E_{\text{export}} \times \text{Tariff}_{\text{export}})$
7. **กระแสเงินสด 25 ปี:** หักค่าการเสื่อมของแผง $0.50\% \text{ ต่อปี}$ ตามมาตรฐาน Tier-1 Monocrystalline
8. **ความจุแบตเตอรี่ (Off-Grid):** $C_{\text{battery}} = \frac{E_{\text{load}} \times \text{Autonomy}}{V_{\text{system}} \times \text{DoD} \times \eta_{\text{battery}} \times \eta_{\text{inverter}}}$

---

## 🚀 การติดตั้งและเริ่มใช้งานในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Unit Tests เพื่อทดสอบความถูกต้องของสูตรคำนวณ
```bash
npm test
```
*(ระบบจะรันการตรวจสอบสูตรทั้ง 55 รายการ และต้องผ่าน 100%)*

### 3. รัน Development Server
```bash
npm run dev
```
เปิดบราวเซอร์ที่ `http://localhost:5173/`

### 4. Build สำหรับ Production
```bash
npm run build
```
ผลลัพธ์จะถูกคอมไพล์ลงในโฟลเดอร์ `dist/` พร้อมไฟล์ `404.html` และ Relative Assets ที่พร้อม Deploy บน GitHub Pages ทันที

---

## 🌐 การ Deploy ขึ้น GitHub Pages

1. ตั้งค่า Remote Repository ไปยัง `solar-rooftop-learning-lab`:
   ```bash
   git remote set-url origin https://github.com/T0nG9929/solar-rooftop-learning-lab.git
   ```
2. Commit และ Push ขึ้น branch `main`:
   ```bash
   git add .
   git commit -m "Merge NT Solar Academy and Solar Rooftop Learning Lab into unified platform"
   git push -u origin main
   ```
3. GitHub Actions ใน `.github/workflows/deploy-pages.yml` จะทำการ:
   - ตรวจสอบโค้ด
   - รัน Unit Tests (`npm test`)
   - Build Production Artifact (`npm run build`)
   - Deploy ขึ้น GitHub Pages อัตโนมัติ
4. บน GitHub Repository Settings -> Pages:
   - Source: เลือก **GitHub Actions**
   - URL ของเว็บไซต์: `https://t0ng9929.github.io/solar-rooftop-learning-lab/`
