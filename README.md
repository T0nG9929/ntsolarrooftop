# NT Solar Academy — Solar Rooftop Learning Platform

เว็บต้นแบบสำหรับพัฒนาต่อด้วย Node.js + Vite + JavaScript ES Modules และ Three.js โดยใช้สีเหลือง NT (#F6C400) กับ Navy เป็นสีหลัก อ้างอิงโครงสร้างการเรียนรู้จาก `Solar-Academy3D.html` ที่ให้ไว้

## สิ่งที่มีในต้นแบบ
- หน้าแรกสไตล์ NTPLC และรองรับมือถือ/เดสก์ท็อป
- เส้นทางการเรียนรู้ 10 โมดูลพื้นฐาน ตามชื่อ/เป้าหมายจากโครงสร้างต้นฉบับ
- โมดูล 11 ใช้โมเดลสถานี NT จากซอร์ส LLK_SolarAR (`public/models/LLK_exchange_site.glb`) แสดงแบบ 3 มิติด้วย Three.js และหมุน/ซูมได้
- หน้าแนะนำใช้ภาพสถานี NT ที่ผู้ใช้ให้มา (`public/images/nt-solar-rooftop-station.jpg`)
- ปุ่มเปิด LLK_SolarAR เชื่อมตรงไปยัง https://solar-ar-llk.netlify.app/ ทั้งหน้าแนะนำ โมดูล 11 และส่วนท้ายเว็บไซต์
- โมเดล 3D ใช้เพื่อสำรวจและเรียนรู้เบื้องต้น ไม่ใช่แบบจำลองวิศวกรรมสำหรับออกแบบติดตั้งจริง
- ลิงก์เครื่องมือจำลองจริงภายนอก แก้ไข URL ได้จาก `src/data/simulators.js`
- เปิดรายละเอียดโมดูลและบันทึกสถานะเรียนจบในเบราว์เซอร์
- แยกไฟล์ HTML, CSS, JavaScript และข้อมูล เพื่อให้แก้ไขง่ายใน VS Code

## เริ่มใช้งาน
ต้องติดตั้ง Node.js รุ่น LTS ก่อน

```bash
npm install
npm run dev
```
จากนั้นเปิด URL ที่ Vite แสดงใน Terminal (โดยทั่วไปคือ `http://localhost:5173`)

สร้างไฟล์สำหรับนำขึ้นเซิร์ฟเวอร์:

```bash
npm run build
npm run preview
```

## จุดที่แก้ไขได้ง่าย
- ชื่อ/เป้าหมาย/เนื้อหาแต่ละโมดูล: `src/data/modules.js`
- ลิงก์แพลตฟอร์มจำลองภายนอก: `src/data/simulators.js`
- สีและการจัดหน้า: `src/style.css` (ตัวแปรสีอยู่ส่วนต้นไฟล์)
- การทำงานและการแสดงผล: `src/main.js`
- ภาพสถานี NT: `public/images/nt-solar-rooftop-station.jpg`
- โมเดล GLB จาก LLK_SolarAR: `public/models/LLK_exchange_site.glb`
- ปลายทาง AR หลัก: `https://solar-ar-llk.netlify.app/`

## ลิงก์จำลองที่ใส่ไว้
- SvetGrid: https://svetgrid.com/
- Sun Sandbox: https://sunsandbox.com/
- PVAlign: https://pvalign.com/simulator/
- QuantumX: https://www.quantumxrd.com/simulator
- 360Configurator: https://www.360configurator.com/configurators/solar
- Open-source Solar PV 3D Simulator: https://github.com/KaranSinghBisht/solar-pv-simulator
- งานวิจัย Solar Energy Education through VR (อ้างอิงแนวทาง ไม่ใช่ตัว simulator ที่เปิดใช้งานโดยตรง): https://researchwith.njit.edu/en/publications/solar-energy-education-through-a-cloud-based-desktop-virtual-real/

**ข้อจำกัด:** ลิงก์ภายนอกส่วนใหญ่เป็นเครื่องมือ 3D/interactive simulation ไม่ได้ยืนยันว่ารองรับ AR หรือแว่น VR โดยตรง จึงระบุประเภทไว้ชัดเจนเพื่อไม่ให้ผู้เรียนเข้าใจผิด และสามารถเปลี่ยนเป็นแพลตฟอร์ม AR/VR ของ NT เมื่อพร้อมใช้งาน


## หน้าแนะนำก่อนเข้าเรียน
เมื่อเปิดเว็บไซต์จะพบหน้าแนะนำแพลตฟอร์มก่อน โดยสรุปวัตถุประสงค์ รูปแบบการเรียนรู้ กลุ่มผู้เรียนเป้าหมาย และจุดเด่นของบทเรียน กด “เข้าสู่แพลตฟอร์มการเรียนรู้” เพื่อไปยังเว็บไซต์หลักเดิม หรือกด “เปิด LLK_SolarAR” เพื่อเข้าสู่ AR ได้โดยตรง หน้าโมดูลและรูปแบบเดิมยังคงอยู่


## การเชื่อมต่อ LLK_SolarAR (รุ่นที่ต่อยอด)
- โมเดล 3D โหลดด้วย `GLTFLoader` จากไฟล์ใน `public/models/LLK_exchange_site.glb` โดยตรง ไม่ใช่โมเดลบ้านตัวอย่างที่สร้างด้วย primitive geometry
- ลากเมาส์/นิ้วบนพื้นที่ 3D เพื่อหมุนมุมมอง และใช้ล้อเมาส์เพื่อซูมบนเดสก์ท็อป
- ปุ่ม AR เปิดเว็บไซต์เดิมในแท็บใหม่ เพื่อไม่ให้ผู้เรียนสูญเสียหน้าเรียนรู้
- หากเปิดจากคอมพิวเตอร์และ AR แนะนำให้ใช้มือถือ ให้สแกน QR Code ตามที่เว็บไซต์ AR แสดง (ขึ้นกับการทำงานของเว็บไซต์ปลายทาง)
- หากโมเดลไม่โหลด ให้ตรวจสอบว่ามีไฟล์ GLB อยู่ที่ `public/models/LLK_exchange_site.glb` และเปิดเว็บผ่าน Vite ไม่ใช่เปิด `index.html` โดยตรง
