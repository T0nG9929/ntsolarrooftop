/**
 * NT Solar Academy - Solar 3D Models & Component Catalog
 * Single Source of Truth for:
 * 1. MODULE 12 Interactive 3D Viewer
 * 2. EXPLORE SOLAR COMPONENTS (MODEL 01 - 03)
 * 3. 3D Hotspot Interactivity & Mapping
 */

export const solar3DModels = Object.freeze({
  site: {
    id: 'site',
    key: 'site',
    number: '00',
    english: 'NT SOLAR ROOFTOP SITE',
    title: 'สถานีชุมสาย NT และระบบ Solar Rooftop',
    badge: 'STATION SITE',
    description: 'แบบจำลอง 3 มิติภาพรวมสถานีชุมสาย NT, ระบบ Solar Rooftop บนหลังคา และแผงเซลล์แสงอาทิตย์ 12 แผง',
    modelPath: 'models/LLK_exchange_site.glb',
    isStation: true
  },
  'pv-array': {
    id: 'pv-array',
    key: 'pv-array',
    number: '01',
    english: 'PV ARRAY / SOLAR MODULES',
    title: 'แผง Solar Rooftop & PV Array',
    badge: 'MODEL 01',
    description: 'โมเดล 3 มิติชุดแผงเซลล์แสงอาทิตย์โมโนคริสตัลไลน์ ประสิทธิภาพสูง พร้อมแคลมป์ยึด (Mid/End Clamps) และสายต่อวงจร DC',
    modelPath: 'models/solar_pv_array.glb',
    thumbnail: 'panels',
    hotspotId: 'pv-modules',
    hotspotName: 'แผง Solar Rooftop (PV Array)',
    hotspotDetail: 'แผงโมโนคริสตัลไลน์ 12 แผง กำลังผลิต 6.6 kWp พร้อมแคลมป์ยึดบนหลังคาชุมสาย NT',
    targetNode: 'Step5_PV_Module_R1_C3'
  },
  structure: {
    id: 'structure',
    key: 'structure',
    number: '02',
    english: 'MOUNTING STRUCTURE',
    title: 'โครงสร้างรองรับแผง (Mounting Structure)',
    badge: 'MODEL 02',
    description: 'โมเดล 3 มิติระบบโครงสร้างอะลูมิเนียม คาน Rafters, แป Rails, เสา BasePlates และคอนกรีต Ballast ถ่วงน้ำหนักมาตรฐานวิศวกรรม',
    modelPath: 'models/solar_structure.glb',
    thumbnail: 'structure',
    hotspotId: 'structure',
    hotspotName: 'โครงสร้างรองรับแผง (Mounting Structure)',
    hotspotDetail: 'คาน Rafters, แป Rails, เสา BasePlates และคอนกรีต Ballast ถ่วงน้ำหนักมาตรฐานวิศวกรรม',
    targetNode: 'Step2_Rafters'
  },
  smu01: {
    id: 'smu01',
    key: 'smu01',
    number: '03',
    english: 'SMU01 & ENETEK CABINET',
    title: 'ตู้ SMU01 พร้อมอุปกรณ์ควบคุมและสวิตช์บอร์ด',
    badge: 'MODEL 03',
    description: 'โมเดล 3 มิติตู้ควบคุม SMU01 พร้อมเบรกเกอร์ DC/AC, เซิร์จ SPD, ลิเธียมแบตเตอรี่ SmartBatt และหน้าจอ LCD Monitor',
    modelPath: 'models/smu01_cabinet.glb',
    thumbnail: 'cabinet',
    hotspotId: 'smu01',
    hotspotName: 'ตู้ควบคุม SMU01 & ระบบไฟฟ้า',
    hotspotDetail: 'ตู้ควบคุม SMU01, เซิร์จ SPD, เบรกเกอร์ DC/AC, ลิเธียมแบตเตอรี่ SmartBatt และหน้าจอ LCD Monitor',
    targetNode: 'Step7_DC_Cable'
  }
});

export const solarModelExplorer = Object.freeze([
  solar3DModels['pv-array'],
  solar3DModels['structure'],
  solar3DModels['smu01']
]);
