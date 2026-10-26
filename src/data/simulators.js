// แก้ไขหรือเพิ่มลิงก์แพลตฟอร์มได้จากไฟล์นี้ โดยไม่ต้องแก้โครงสร้างหน้าเว็บ
export const simulators = [
  {
    name: 'SvetGrid 3D Solar Array',
    type: '3D Interactive',
    url: 'https://svetgrid.com/',
    description: 'ทดลองจัดวางแผงโซลาร์ในพื้นที่สามมิติ ปรับมุมแผง ดูตำแหน่งดวงอาทิตย์ และค่ากำลังไฟฟ้าโดยประมาณ',
    note: 'เว็บจำลอง 3 มิติ ใช้งานผ่านเบราว์เซอร์'
  },
  {
    name: 'Sun Sandbox',
    type: '3D / Shadow Simulation',
    url: 'https://sunsandbox.com/',
    description: 'จำลองหลังคาและสิ่งกีดขวางเพื่อสังเกตเงาที่ตกกระทบบนแผงตามเวลาและฤดูกาล',
    note: 'เน้นตำแหน่งดวงอาทิตย์และเงา ไม่ใช่ VR headset โดยตรง'
  },
  {
    name: 'PVAlign Simulator',
    type: 'Interactive System',
    url: 'https://pvalign.com/simulator/',
    description: 'ประกอบวงจรระบบ PV ด้วยแผง แบตเตอรี่ คอนโทรลเลอร์ อินเวอร์เตอร์ สายไฟ และโหลด เพื่อเรียนรู้การเชื่อมต่อ',
    note: 'เวิร์กเบนช์จำลองวงจร ไม่ใช่สภาพแวดล้อม VR'
  },
  {
    name: 'QuantumX 3D Installation Simulator',
    type: '3D Design',
    url: 'https://www.quantumxrd.com/simulator',
    description: 'ทดลองกำหนดรูปทรงหลังคา วางแผง และตั้งค่าระบบเบื้องต้นในเครื่องมือออกแบบโซลาร์',
    note: 'เครื่องมือออกแบบ 3 มิติผ่านเว็บ'
  },
  {
    name: '360Configurator Solar',
    type: '3D Configurator',
    url: 'https://www.360configurator.com/configurators/solar',
    description: 'สำรวจภาพจำลองระบบโซลาร์ 3 มิติ หมุนมุมมองและปรับข้อมูลหลังคา แผง และช่วงเวลาของดวงอาทิตย์',
    note: 'ภาพจำลอง 3 มิติแบบโต้ตอบ'
  },
  {
    name: 'Solar PV 3D Simulator (GitHub)',
    type: 'Open-source 3D',
    url: 'https://github.com/KaranSinghBisht/solar-pv-simulator',
    description: 'ตัวอย่างโครงการจำลองฉากโซลาร์ 3 มิติ พร้อมแนวคิดเรื่องเงา I–V/P–V และ MPPT',
    note: 'เป็นซอร์สโค้ด ต้องตรวจสอบวิธีเปิดใช้งานก่อนใช้จริง'
  },
  {
    name: 'Solar Energy Education through VR',
    type: 'VR Learning Reference',
    url: 'https://researchwith.njit.edu/en/publications/solar-energy-education-through-a-cloud-based-desktop-virtual-real/',
    description: 'งานวิจัยด้านการเรียนรู้พลังงานแสงอาทิตย์ผ่านระบบ Virtual Reality บนคลาวด์ ใช้เป็นแนวทางออกแบบแพลตฟอร์ม AR/VR ของ NT',
    note: 'ลิงก์อ้างอิงงานวิจัย ไม่ใช่ตัวจำลองที่เปิดทดลองได้ทันที'
  }
];
