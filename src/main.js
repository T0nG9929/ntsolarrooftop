import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { modules } from './data/modules.js';
import { simulators } from './data/simulators.js';

const $ = (s, root=document) => root.querySelector(s);
const BASE = import.meta.env.BASE_URL;
const asset = (p) => `${BASE}${String(p).replace(/^\/+/, '')}`;
const progressKey = 'nt-solar-academy-progress-v1';
let completed = new Set(JSON.parse(localStorage.getItem(progressKey) || '[]'));
let activeFilter = 'ทั้งหมด';
const categories = ['ทั้งหมด', ...new Set(modules.slice(0,10).map(m=>m.category || 'บทเรียน'))];

const icon = (name) => ({sun:'☀', panels:'▦', bolt:'ϟ', wire:'⌁', battery:'▰', cube:'◇', book:'▤', arrow:'↗', check:'✓', play:'▶', vr:'◉'}[name] || '•');
function moduleIcon(id){ return ['▦','☀','ϟ','⌁','⇄','◈','▰','⏻','⌂','🔧','◇'][id-1] || '•'; }
function render(){
  const percent = Math.round(completed.size/modules.length*100);
  $('#app').innerHTML = `
    <section class="welcome-screen" id="welcomeScreen" aria-labelledby="welcomeTitle">
      <div class="welcome-top"><a class="brand" href="#welcomeScreen" aria-label="NT Solar Academy"><span class="brand-mark">NT</span><span><b>Solar Academy</b><small>National Telecom Public Company Limited</small></span></a><span class="welcome-tag"><i></i> NT ACADEMY · DIGITAL LEARNING</span></div>
      <div class="welcome-content">
        <div class="welcome-copy"><div class="eyebrow"><span class="eyebrow-dot"></span> SOLAR ROOFTOP LEARNING PLATFORM</div>
          <h1 id="welcomeTitle">เปิดประตูสู่โลก<br><span>Solar Rooftop</span></h1>
          <p class="welcome-lead">พื้นที่เรียนรู้ที่ช่วยให้เข้าใจระบบผลิตไฟฟ้าจากพลังงานแสงอาทิตย์ ตั้งแต่รู้จักอุปกรณ์ การออกแบบ ไปจนถึงแนวคิดการติดตั้งและการสำรวจระบบผ่านแบบจำลอง 3 มิติ</p>
          <div class="welcome-actions"><button class="btn btn-dark" id="enterAcademy">เข้าสู่แพลตฟอร์มการเรียนรู้ <span>↗</span></button><a class="btn btn-ar-welcome" href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer">เปิด LLK_SolarAR <span>↗</span></a><span class="welcome-time">11 MODULES · เรียนรู้ตามจังหวะของคุณ</span></div>
          <div class="welcome-purpose"><span class="purpose-icon">◎</span><div><b>เว็บนี้มีไว้เพื่ออะไร?</b><p>รวบรวมบทเรียนและแหล่งทดลองไว้ในจุดเดียว เพื่อช่วยปูพื้นฐานและเชื่อมโยงความรู้ให้เห็นภาพระบบ Solar Rooftop มากขึ้น ไม่ใช่สิ่งทดแทนการฝึกปฏิบัติจริงหรือมาตรฐานความปลอดภัย</p></div></div>
        </div>
        <div class="welcome-visual welcome-photo-visual"><img class="welcome-photo" src="${asset('/images/nt-solar-rooftop-station.jpg')}" alt="สถานี NT ที่ติดตั้งแผง Solar Rooftop บนหลังคา"><div class="welcome-photo-shade"></div><div class="welcome-chip chip-panels"><b>NT SOLAR ROOFTOP</b><small>REAL SITE · LEARNING CONTEXT</small></div><a class="welcome-chip chip-3d welcome-ar-chip" href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer"><b>OPEN LLK_SolarAR ↗</b><small>3D MODEL · AUGMENTED REALITY</small></a><div class="welcome-visual-caption">LEARN FROM A REAL NT SOLAR ROOFTOP SITE</div></div>
      </div>
      <div class="welcome-info-grid">
        <article><span class="welcome-info-icon">⌘</span><div><h2>วัตถุประสงค์</h2><p>เข้าใจหน้าที่ของอุปกรณ์ หลักการทำงาน และความสัมพันธ์ของส่วนต่าง ๆ ในระบบโซลาร์รูฟท็อป</p></div></article>
        <article><span class="welcome-info-icon">◉</span><div><h2>รูปแบบการเรียนรู้</h2><p>อ่านบทเรียนตามลำดับ เปิดเอกสารประกอบ สำรวจโมเดล 3 มิติ และทดลองเครื่องมือจำลองจากเว็บไซต์ภายนอก</p></div></article>
        <article><span class="welcome-info-icon">♧</span><div><h2>เหมาะกับใคร</h2><p>ผู้เริ่มต้น ผู้สนใจพลังงานแสงอาทิตย์ บุคลากรที่เกี่ยวข้องกับงานเทคนิค และผู้ที่ต้องการทบทวนภาพรวมของระบบ</p></div></article>
        <article><span class="welcome-info-icon">✦</span><div><h2>สิ่งที่น่าสนใจ</h2><p>บทเรียน 10 หัวข้อ และโมดูล 11 ที่เน้นสำรวจระบบสามมิติ พร้อมลิงก์ไปยังเครื่องมือจำลองที่แก้ไขเพิ่มได้ในอนาคต</p></div></article>
      </div>
      <div class="welcome-bottom"><span>LEARN · EXPLORE · CONNECT</span><span>แพลตฟอร์มเพื่อการเรียนรู้เบื้องต้น โดย NT Academy</span></div>
    </section>
    <div id="academyContent">
    <header class="topbar">
      <a class="brand" href="#home" aria-label="NT Solar Academy หน้าแรก"><span class="brand-mark">NT</span><span><b>Solar Academy</b><small>National Telecom Public Company Limited</small></span></a>
      <nav class="desktop-nav"><a href="#path">เส้นทางการเรียนรู้</a><a href="#module11">3D / AR / VR Lab</a><a href="#articles">คลังบทความ</a><a href="#resources">เครื่องมือจำลอง</a></nav>
      <button class="menu-button" id="mobileMenu" aria-label="เปิดเมนู">☰</button>
      <a class="header-cta" href="#path">เริ่มเรียน <span>↗</span></a>
    </header>
    <main id="home">
      <section class="hero wrap">
        <div class="hero-copy"><div class="eyebrow"><span class="eyebrow-dot"></span> NT ACADEMY · SOLAR ROOFTOP LEARNING</div>
          <h1>เรียนรู้พลังงานแสงอาทิตย์<br><span>จากพื้นฐานสู่โลก 3 มิติ</span></h1>
          <p class="hero-lead">แพลตฟอร์มการเรียนรู้ Solar Rooftop สำหรับทำความเข้าใจอุปกรณ์ การออกแบบ และการติดตั้ง พร้อมเส้นทางต่อยอดสู่แบบจำลอง 3 มิติ AR / VR</p>
          <div class="hero-actions"><a class="btn btn-dark" href="#path">สำรวจ 10 โมดูล <span>↓</span></a><a class="btn btn-outline" href="#module11">เข้าสู่ 3D Learning Lab <span>↗</span></a></div>
          <div class="hero-meta"><span><i class="meta-check">✓</i> เรียนรู้เป็นลำดับ</span><span><i class="meta-check">✓</i> ใช้ได้ทั้งคอมพิวเตอร์และมือถือ</span></div>
        </div>
        <div class="hero-art" aria-label="ภาพประกอบระบบโซลาร์บนหลังคา">
          <div class="sun-disc"></div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
          <div class="solar-house"><div class="roof"><div class="panel-grid">${Array.from({length:18},(_,i)=>'<span></span>').join('')}</div></div><div class="house-front"><div class="window"></div><div class="door"></div></div><div class="house-side"></div><div class="ground"></div></div>
          <div class="float-tag tag-energy"><span class="tag-icon">ϟ</span><span><b>Solar Energy</b><small>Clean · Smart · Future</small></span></div>
          <div class="float-tag tag-3d"><span class="tag-cube">◇</span><span><b>3D Learning Lab</b><small>AR / VR Ready</small></span></div>
          <div class="hero-art-label">POWERING KNOWLEDGE FOR A SUSTAINABLE FUTURE</div>
        </div>
      </section>
      <section class="stat-strip wrap"><div><strong>11</strong><span>โมดูลการเรียนรู้</span></div><div><strong>10 + 1</strong><span>พื้นฐานและห้องทดลอง 3 มิติ</span></div><div><strong>AR / VR</strong><span>เตรียมเชื่อมต่อแพลตฟอร์มจำลอง</span></div><div class="progress-stat"><div class="progress-label"><span>ความก้าวหน้าของคุณ</span><b>${percent}%</b></div><div class="progress-track"><span style="width:${percent}%"></span></div><small>${completed.size} จาก ${modules.length} โมดูลเสร็จแล้ว</small></div></section>
      <section class="learning-section wrap" id="path"><div class="section-heading"><div><div class="eyebrow">YOUR LEARNING JOURNEY</div><h2>เส้นทางการเรียนรู้</h2><p>เรียนรู้ทีละขั้น เชื่อมโยงความรู้จากอุปกรณ์สู่ระบบจริง</p></div><div class="path-tools"><label class="search-box"><span>⌕</span><input id="moduleSearch" type="search" placeholder="ค้นหาโมดูล..." aria-label="ค้นหาโมดูล"></label><select id="moduleFilter" aria-label="กรองหมวดหมู่">${categories.map(c=>`<option>${c}</option>`).join('')}</select></div></div>
        <div class="path-map"><span class="path-line"></span><div class="path-node active"><b>01–10</b><span>CORE KNOWLEDGE</span></div><div class="path-node future"><b>11</b><span>IMMERSIVE LAB</span></div></div>
        <div class="module-grid" id="moduleGrid">${modules.slice(0,10).map(m=>moduleCard(m)).join('')}</div>
      </section>
      ${module11Section()}
      <section class="resources-section wrap" id="resources"><div class="section-heading"><div><div class="eyebrow">LEARN BEYOND THE LESSONS</div><h2>แหล่งเรียนรู้และเครื่องมือจำลอง</h2><p>ต่อยอดจากบทเรียนด้วยคลังบทความและเครื่องมือจำลองจากแหล่งภายนอก</p></div><span class="resource-count">${simulators.length + 1} RESOURCES</span></div><article class="article-library-card" id="articles"><div class="article-library-icon" aria-hidden="true">▤</div><div class="article-library-copy"><span class="article-library-kicker">KNOWLEDGE LIBRARY · READ MORE</span><h3>คลังบทความและองค์ความรู้เพิ่มเติม</h3><p>เปิดอ่านบทความและเอกสารเพิ่มเติม เพื่อทบทวนความรู้และศึกษาประเด็นที่สนใจเกี่ยวกับ Solar Rooftop ได้ด้วยตนเอง</p><div class="article-library-meta"><span>อ่านเพิ่มเติมได้ตามความสนใจ</span><span>เปิดเว็บไซต์ภายนอก ↗</span></div></div><a class="article-library-button" href="https://ntacademy.ntcloudbox.com/s/aaGGok27SMAzMME" target="_blank" rel="noopener noreferrer" aria-label="เปิดคลังบทความและองค์ความรู้เพิ่มเติมในเว็บไซต์ NT Academy">เข้าสู่คลังบทความ <span>↗</span></a></article><div class="resource-grid">${simulators.slice(0,3).map((s,i)=>resourceCard(s,i)).join('')}</div><div class="resource-grid resource-grid-extra">${simulators.slice(3).map((s,i)=>resourceCard(s,i+3)).join('')}</div><p class="disclaimer"><b>หมายเหตุ:</b> เครื่องมือภายนอกแต่ละแห่งมีขอบเขตต่างกัน บางแห่งเป็นแบบจำลอง 3 มิติหรือจำลองวงจร ไม่ใช่ประสบการณ์ AR/VR ที่ใช้แว่นโดยตรง กรุณาทดลองและตรวจสอบข้อกำหนดก่อนนำไปใช้ฝึกอบรมจริง</p></section>
      <section class="next-step wrap"><div class="next-icon">◇</div><div><div class="eyebrow">THE NEXT LEARNING EXPERIENCE</div><h2>จากโมเดล 3D สู่ประสบการณ์ AR</h2><p>สำรวจโมเดลสถานี NT บนเว็บไซต์ แล้วเปิด LLK_SolarAR บนโทรศัพท์มือถือเพื่อทดลองประสบการณ์ Augmented Reality</p></div><a class="btn btn-dark" href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer">เปิด LLK_SolarAR ↗</a></section>
    </main>
    <footer><div class="footer-inner wrap"><a class="brand footer-brand" href="#home"><span class="brand-mark">NT</span><span><b>Solar Academy</b><small>National Telecom Public Company Limited</small></span></a><p>Learning today. Building a sustainable tomorrow.</p><span>NTPLC · Solar Rooftop Learning Platform</span></div></footer>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <dialog id="lessonDialog" class="lesson-dialog"><button class="dialog-close" id="dialogClose" aria-label="ปิด">×</button><div id="dialogContent"></div></dialog>`;
  bindEvents();
  initThreePreview();
}
function moduleCard(m){
  const isDone=completed.has(m.id);
  return `<article class="module-card ${isDone?'is-done':''}" data-id="${m.id}" data-category="${m.category||'บทเรียน'}" data-search="${(m.title+' '+m.subtitle+' '+m.goal).toLowerCase()}"><div class="module-card-top"><span class="module-number">MODULE ${String(m.id).padStart(2,'0')}</span><span class="module-icon">${moduleIcon(m.id)}</span></div><h3>${m.title}</h3><p class="module-subtitle">${m.subtitle||''}</p><p class="module-goal">${m.goal||''}</p><div class="module-card-bottom"><span class="module-state ${isDone?'done':''}">${isDone?'✓ เรียนแล้ว':'บทเรียน · '+(m.parts?.length||3)+' หัวข้อ'}</span><button class="card-arrow" data-open="${m.id}" aria-label="เปิดโมดูล ${m.id}">↗</button></div></article>`;
}
function module11Section(){
 const m=modules.find(x=>x.id===11);
 return `<section class="module11-section" id="module11"><div class="module11-inner wrap"><div class="module11-copy"><div class="eyebrow eyebrow-light"><span class="eyebrow-dot"></span> FEATURED · MODULE 11</div><div class="module11-title-line"><span class="big-module-number">11</span><div><h2>แบบจำลองระบบ 3 มิติ</h2><p class="module11-en">3D SOLAR SYSTEM · AR / VR LEARNING LAB</p></div></div><p class="module11-description">สำรวจโมเดลสถานี NT จากซอร์ส LLK_SolarAR ในมุมมองสามมิติ จากนั้นเปิดประสบการณ์ AR บนโทรศัพท์มือถือเพื่อหมุนและปรับขนาดโมเดลตามความสามารถของระบบต้นฉบับ</p><div class="module11-pills"><span>◉ LLK 3D Model</span><span>⌘ Mobile AR</span><span>↻ Rotate · Scale</span></div><div class="module11-actions"><a class="btn btn-yellow" href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer">เปิด LLK_SolarAR <span>↗</span></a><button class="btn btn-glass" id="openLesson11">เป้าหมายการเรียนรู้ <span>↗</span></button></div><div class="module11-note"><span>i</span><span>โมเดล 3D ที่แสดงในหน้านี้โหลดจากไฟล์ <code>public/models/LLK_exchange_site.glb</code> ส่วน AR เปิดผ่านเว็บไซต์ต้นฉบับ <code>solar-ar-llk.netlify.app</code></span></div></div><div class="module11-visual"><div class="visual-topline"><span><i></i> LLK_SOLARAR · SITE MODEL</span><span>GLB MODEL</span></div><div class="three-stage" id="threeStage"><div class="stage-placeholder"><div class="mini-sun"></div><div class="mini-roof"><div class="mini-panels"></div></div><span>กำลังโหลดโมเดลสถานี NT...</span></div></div><div class="scene-legend"><span><i class="legend-sun"></i> โมเดลสถานี NT</span><span><i class="legend-dc"></i> หมุนมุมมอง</span><span><i class="legend-ac"></i> ซูมเข้า–ออก</span></div><div class="scene-caption">ลากเมาส์เพื่อหมุน · ใช้ล้อเมาส์เพื่อซูม · โมเดลนี้เป็นตัวอย่างสำรวจ ไม่ใช่เครื่องมือออกแบบทางวิศวกรรม</div></div></div><div class="wrap external-launchers"><div class="launcher-heading"><div><b>เริ่มทดลองจากแพลตฟอร์มจริง</b><p>เลือกเครื่องมือที่เหมาะกับหัวข้อการเรียนรู้</p></div><span class="external-count">${simulators.length} LINKS</span></div><div class="launcher-grid">${simulators.map((s,i)=>`<a class="launcher-card" href="${s.url}" target="_blank" rel="noopener noreferrer"><span class="launcher-index">0${i+1}</span><span class="launcher-info"><b>${s.name}</b><small>${s.type}</small></span><span class="launcher-arrow">↗</span></a>`).join('')}</div></div></section>`;
}
function resourceCard(s,i){return `<article class="resource-card"><div class="resource-card-head"><span class="resource-symbol">${['◇','☼','⌁','⌂','▧','⟲','◉'][i%7]}</span><span class="resource-index">RESOURCE 0${i+1}</span></div><span class="resource-type">${s.type}</span><h3>${s.name}</h3><p>${s.description}</p><div class="resource-note">${s.note}</div><a href="${s.url}" target="_blank" rel="noopener noreferrer" class="resource-link">เปิดแพลตฟอร์ม <span>↗</span></a></article>`;}
function bindEvents(){
 $('#enterAcademy').addEventListener('click',()=>{const welcome=$('#welcomeScreen');welcome.classList.add('welcome-leaving');setTimeout(()=>{welcome.remove();window.scrollTo({top:0,behavior:'smooth'})},220)});
 $('#moduleSearch').addEventListener('input',filterModules); $('#moduleFilter').addEventListener('change',e=>{activeFilter=e.target.value;filterModules()});
 $('#moduleGrid').addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openLesson(Number(b.dataset.open))});
 $('#openLesson11').addEventListener('click',()=>openLesson(11)); $('#dialogClose').addEventListener('click',()=>$('#lessonDialog').close());
 $('#lessonDialog').addEventListener('click',e=>{if(e.target===$('#lessonDialog'))$('#lessonDialog').close()});
 $('#mobileMenu').addEventListener('click',()=>{document.querySelector('.desktop-nav').classList.toggle('nav-open')});
 document.querySelectorAll('.desktop-nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.desktop-nav').classList.remove('nav-open')));
}
function filterModules(){const q=$('#moduleSearch').value.trim().toLowerCase();let visible=0;document.querySelectorAll('.module-card').forEach(card=>{const ok=card.dataset.search.includes(q)&&(activeFilter==='ทั้งหมด'||card.dataset.category===activeFilter);card.hidden=!ok;if(ok)visible++});let empty=$('#emptySearch');if(!visible){if(!empty){empty=document.createElement('div');empty.id='emptySearch';empty.className='empty-search';empty.textContent='ไม่พบโมดูลที่ตรงกับคำค้นหา';$('#moduleGrid').append(empty)} }else if(empty)empty.remove();}
function openLesson(id){const m=modules.find(x=>x.id===id);if(!m)return;const isDone=completed.has(id);const parts=(m.parts||[]).map((p,i)=>`<div class="lesson-part"><span>${String(i+1).padStart(2,'0')}</span><div><b>${p[0]}</b><p>${p[1]}</p></div></div>`).join('');const links=id===11?`<div class="dialog-links">${simulators.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a>`).join('')}</div>`:'';$('#dialogContent').innerHTML=`<div class="dialog-eyebrow">MODULE ${String(id).padStart(2,'0')} · ${id===11?'3D LEARNING LAB':'CORE LEARNING'}</div><h2>${m.title}</h2><p class="dialog-subtitle">${m.subtitle||''}</p><div class="lesson-goal"><b>เป้าหมายการเรียนรู้</b><p>${m.goal||''}</p></div><div class="lesson-parts"><h3>หัวข้อการเรียนรู้</h3>${parts||'<p>โมดูลนี้เป็นพื้นที่เชื่อมต่อไปยังแบบจำลอง 3 มิติและแพลตฟอร์มภายนอก</p>'}</div>${m.practice?`<div class="practice-box"><b>กิจกรรมฝึกปฏิบัติ</b><p>${m.practice}</p></div>`:''}${m.note?`<div class="lesson-note"><b>ข้อควรจำ</b><p>${m.note}</p></div>`:''}${m.document?`<a class="lesson-document" href="${asset(m.document)}" target="_blank" rel="noopener noreferrer">เปิดเอกสารประกอบการเรียน (PDF) <span>↗</span></a>`:''}${links}<button class="btn ${isDone?'btn-outline':'btn-dark'} dialog-complete" id="toggleComplete">${isDone?'✓ ทำเครื่องหมายว่าเรียนแล้ว':'ทำเครื่องหมายว่าเรียนจบแล้ว'} </button>`;$('#lessonDialog').showModal();$('#toggleComplete').addEventListener('click',()=>{if(completed.has(id))completed.delete(id);else completed.add(id);localStorage.setItem(progressKey,JSON.stringify([...completed]));$('#lessonDialog').close();render();showToast(completed.has(id)?'บันทึกความก้าวหน้าแล้ว':'ปรับสถานะการเรียนแล้ว')});}
let toastTimer;function showToast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
function initThreePreview(){
 const stage=$('#threeStage'); if(!stage)return;
 try{
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#101f2d');
  const camera=new THREE.PerspectiveCamera(38,stage.clientWidth/Math.max(stage.clientHeight,1),.01,10000);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(stage.clientWidth,stage.clientHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
  stage.innerHTML=''; stage.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xe8f3ff,0x52606b,2.5));
  const keyLight=new THREE.DirectionalLight(0xfff0c7,3.1); keyLight.position.set(6,10,8); scene.add(keyLight);
  const fillLight=new THREE.DirectionalLight(0x80bce0,1.3); fillLight.position.set(-7,4,-5); scene.add(fillLight);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshStandardMaterial({color:0x182d3a,roughness:1})); ground.rotation.x=-Math.PI/2; ground.position.y=-.02; scene.add(ground);
  const grid=new THREE.GridHelper(200,40,0x3b5667,0x2a414f); grid.position.y=0; scene.add(grid);
  let model=null, target=new THREE.Vector3(0,0,0), theta=.7, phi=1.02, radius=12, dragging=false,lastX=0,lastY=0;
  const updateCamera=()=>{phi=Math.max(.12,Math.min(Math.PI-.12,phi));camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(target)};
  const loader=new GLTFLoader();
  loader.load(asset('/models/LLK_exchange_site.glb'),gltf=>{
   model=gltf.scene; model.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(model); const size=box.getSize(new THREE.Vector3()); const center=box.getCenter(new THREE.Vector3());
   model.position.sub(center); scene.add(model);
   const maxDim=Math.max(size.x,size.y,size.z)||1;
   const fitScale=7/maxDim; model.scale.setScalar(fitScale);
   // Recenter after scale and place model just above the presentation floor.
   model.position.multiplyScalar(fitScale); model.position.y+=-(box.min.y-center.y)*fitScale+.08;
   model.traverse(obj=>{if(obj.isMesh){obj.castShadow=true;obj.receiveShadow=true;if(obj.material){obj.material.needsUpdate=true;}}});
   target.set(0,Math.max(.4,size.y*fitScale*.22),0); radius=Math.max(8,Math.min(25,maxDim*fitScale*1.65)); updateCamera();
   const loading=stage.querySelector('.model-loading'); if(loading)loading.remove();
  },xhr=>{
   let label=stage.querySelector('.model-loading'); if(!label){label=document.createElement('div');label.className='model-loading';label.textContent='กำลังโหลดโมเดลสถานี NT…';stage.appendChild(label)}
   if(xhr.total){label.textContent=`กำลังโหลดโมเดลสถานี NT… ${Math.round(xhr.loaded/xhr.total*100)}%`}
  },err=>{
   console.error('Unable to load LLK SolarAR GLB model',err);
   stage.innerHTML='<div class="stage-fallback"><b>ไม่สามารถโหลดโมเดล 3D ได้</b><p>ตรวจสอบว่าไฟล์ public/models/LLK_exchange_site.glb อยู่ในโฟลเดอร์โปรเจกต์ แล้วลองเปิดเว็บผ่าน npm run dev อีกครั้ง</p><a href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer">เปิด LLK_SolarAR ↗</a></div>';
  });
  renderer.domElement.setAttribute('aria-label','โมเดลสถานี NT แบบสามมิติ สามารถลากเพื่อหมุนและใช้ล้อเมาส์เพื่อซูม');
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;theta-=(e.clientX-lastX)*.008;phi+=(e.clientY-lastY)*.006;lastX=e.clientX;lastY=e.clientY;updateCamera()});
  const stopDrag=()=>dragging=false; renderer.domElement.addEventListener('pointerup',stopDrag);renderer.domElement.addEventListener('pointercancel',stopDrag);
  renderer.domElement.addEventListener('wheel',e=>{radius=Math.max(2,Math.min(100,radius+e.deltaY*.012));updateCamera()},{passive:true});
  let raf; const animate=()=>{raf=requestAnimationFrame(animate);renderer.render(scene,camera)};animate();
  const resize=()=>{if(!stage.isConnected)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)};
  const ro=new ResizeObserver(resize);ro.observe(stage);stage._cleanup=()=>{cancelAnimationFrame(raf);ro.disconnect();renderer.dispose()};
 }catch(err){console.error(err);stage.innerHTML='<div class="stage-fallback"><b>3D Preview</b><p>เบราว์เซอร์หรืออุปกรณ์นี้ยังไม่รองรับ WebGL โปรดลองเปิดผ่าน Chrome หรือ Edge รุ่นปัจจุบัน</p></div>';}
}
render();
