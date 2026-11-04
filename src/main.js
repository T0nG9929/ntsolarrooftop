import './style.css';
import { modules } from './data/modules.js';
import { simulators } from './data/simulators.js';
import { getCalculatorTemplate, CalculatorController } from './modules/calculator/calculator-view.js';
import { getOffgridTemplate, OffgridController } from './modules/offgrid/offgrid-view.js';
import { getQuizTemplate, QuizController } from './modules/quiz/quiz-view.js';
import { initThreeViewer } from './modules/three-viewer/viewer.js';
import { solar3DModels, solarModelExplorer } from './data/solar-3d-models.js';
import { AppRouter } from './router/router.js';

const $ = (s, root = document) => {
  if (typeof s === 'string' && s.startsWith('#') && /^[0-9]/.test(s.slice(1))) {
    const id = s.slice(1);
    return root.getElementById ? root.getElementById(id) : root.querySelector(`[id="${id}"]`);
  }
  return root.querySelector(s);
};
const BASE = import.meta.env.BASE_URL;
const asset = p => `${BASE}${String(p).replace(/^\/+/, '')}`;
const progressKey = 'nt-solar-academy-progress-v2';

let completed = new Set(JSON.parse(localStorage.getItem(progressKey) || '[]'));
let activeFilter = 'ทั้งหมด';
let threeViewerCleanup = null;
let calculatorInstance = null;
let offgridInstance = null;
let quizInstance = null;

const categories = ['ทั้งหมด', ...new Set(modules.slice(0, 11).map(m => m.category || 'บทเรียน'))];

function moduleIcon(id) {
  return ['▦', '☀', 'ϟ', '⌁', '⇄', '◈', '▰', '⏻', '⌂', '🔧', '↻', '◇'][id - 1] || '•';
}

function render() {
  if (threeViewerCleanup) {
    if (typeof threeViewerCleanup === 'function') threeViewerCleanup();
    else threeViewerCleanup.cleanup?.();
    threeViewerCleanup = null;
  }

  const percent = Math.round((completed.size / modules.length) * 100);

  $('#app').innerHTML = `
    <!-- Orientation / Welcome Screen -->
    <section class="welcome-screen" id="welcomeScreen" aria-labelledby="welcomeTitle">
      <div class="welcome-top">
        <a class="brand" href="#home" aria-label="NT Solar Academy">
          <span class="brand-mark">NT</span>
          <span><b>Solar Academy</b><small>National Telecom Public Company Limited</small></span>
        </a>
        <span class="welcome-tag"><i></i> NT ACADEMY · DIGITAL LEARNING PLATFORM</span>
      </div>
      <div class="welcome-content">
        <div class="welcome-copy">
          <div class="eyebrow"><span class="eyebrow-dot"></span> SOLAR ROOFTOP LEARNING PLATFORM</div>
          <h1 id="welcomeTitle">เปิดประตูสู่โลก<br><span>Solar Rooftop</span></h1>
          <p class="welcome-lead">พื้นที่เรียนรู้ระบบผลิตไฟฟ้าจากพลังงานแสงอาทิตย์ ตั้งแต่วิเคราะห์การใช้ไฟฟ้า ออกแบบขนาดระบบด้วย Solar Calculator สำรวจโมเดล 3 มิติ และศึกษาอุปกรณ์จริง</p>
          <div class="welcome-actions">
            <button class="btn btn-dark" id="enterAcademy">เข้าสู่แพลตฟอร์มการเรียนรู้ <span>↗</span></button>
            <a class="btn btn-yellow" href="#calculator">คำนวณขนาดโซลาร์ <span>⚡</span></a>
            <a class="btn btn-ar-welcome" href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer">เปิด LLK_SolarAR <span>↗</span></a>
          </div>
          <div class="welcome-purpose">
            <span class="purpose-icon">◎</span>
            <div>
              <b>แพลตฟอร์มนี้ครอบคลุมอะไรบ้าง?</b>
              <p>เครื่องคำนวณ Solar Rooftop Calculator ระดับ Preliminary Design, 12 โมดูลการเรียนรู้, แบบจำลอง 3 มิติ AR/VR, ห้องทดลองระบบ Off-grid, และแบบทดสอบความเข้าใจ</p>
            </div>
          </div>
        </div>
        <div class="welcome-visual welcome-video-visual" aria-label="Featured Video: NT Solar Rooftop สถานีจริง">
          <iframe class="welcome-video" src="https://www.youtube-nocookie.com/embed/TdkCg_ggN5o?autoplay=1&amp;mute=1&amp;loop=1&amp;playlist=TdkCg_ggN5o&amp;controls=0&amp;rel=0&amp;playsinline=1&amp;modestbranding=1" title="วิดีโอภาพบรรยากาศสถานี NT Solar Rooftop" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" aria-hidden="true" tabindex="-1"></iframe>
          <div class="welcome-photo-shade"></div>
          <div class="welcome-chip chip-panels">
            <b><span class="video-live-dot"></span>NT SOLAR ROOFTOP</b>
            <small>REAL SITE · LEARNING CONTEXT</small>
          </div>
          <a class="welcome-chip chip-3d welcome-ar-chip" href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer">
            <b>OPEN LLK_SolarAR ↗</b>
            <small>3D MODEL · AUGMENTED REALITY</small>
          </a>
          <div class="welcome-visual-caption"><span class="caption-dot"></span>LEARN FROM A REAL NT SOLAR ROOFTOP SITE</div>
        </div>
      </div>
      <div class="welcome-info-grid">
        <article><span class="welcome-info-icon">⚡</span><div><h2>Solar Calculator</h2><p>คำนวณขนาดแผง อินเวอร์เตอร์ พื้นที่หลังคา และจุดคืนทุน 25 ปี</p></div></article>
        <article><span class="welcome-info-icon">⌘</span><div><h2>12 โมดูลการเรียนรู้</h2><p>เจาะลึกอุปกรณ์ การออกแบบ การต่อวงจร และการบำรุงรักษา</p></div></article>
        <article><span class="welcome-info-icon">◇</span><div><h2>แบบจำลอง 3 มิติ</h2><p>สำรวจสถานีจริงแบบหมุนซูมอิสระและเชื่อมต่อเทคโนโลยี AR</p></div></article>
        <article><span class="welcome-info-icon">✦</span><div><h2>แบบทดสอบและ Off-grid</h2><p>ทดลองคำนวณแบตเตอรี่และวัดระดับความรู้ทางวิศวกรรม</p></div></article>
      </div>
      <div class="welcome-bottom">
        <span>LEARN · CALCULATE · EXPLORE · CONNECT</span>
        <span>NT Solar Academy · National Telecom Public Company Limited</span>
      </div>
    </section>

    <!-- Main Platform Shell -->
    <div id="academyContent">
      <!-- Unified Topbar Navigation -->
      <header class="topbar">
        <a class="brand" href="#home" aria-label="NT Solar Academy หน้าแรก">
          <span class="brand-mark">NT</span>
          <span><b>Solar Academy</b><small>National Telecom Public Company Limited</small></span>
        </a>
        <nav class="desktop-nav" aria-label="เมนูหลัก">
          <a href="#home">Home</a>
          <a href="#learning-lab">Solar Learning Lab</a>
          <a href="#3d-learning">3D Learning</a>
          <a href="#quiz">Knowledge Test</a>
          <a href="#articles">Articles</a>
          <a href="#calculator">Solar Calculator</a>
          <a href="#offgrid">Battery Design</a>
        </nav>
        <button class="menu-button" id="mobileMenu" aria-label="เปิดเมนูมือถือ">☰</button>
        <a class="header-cta" href="#calculator">คำนวณโซลาร์ <span>⚡</span></a>
      </header>

      <main>
        <!-- 1. Hero Section -->
        <section class="hero wrap" id="home">
          <div class="hero-copy">
            <div class="eyebrow"><span class="eyebrow-dot"></span> NT ACADEMY · SOLAR ROOFTOP PLATFORM</div>
            <h1>เรียนรู้พลังงานแสงอาทิตย์<br><span>จากพื้นฐานสู่การคำนวณจริง</span></h1>
            <p class="hero-lead">ศูนย์กลางการเรียนรู้ระบบ Solar Rooftop สำหรับบุคลากรและผู้สนใจ ครอบคลุมเครื่องมือคำนวณวิศวกรรมเบื้องต้น 12 โมดูลบทเรียน และแบบจำลองสถานี 3 มิติ AR/VR</p>
            <div class="hero-actions">
              <a class="btn btn-dark" href="#learning-lab">เริ่มเส้นทางการเรียนรู้ <span>↓</span></a>
              <a class="btn btn-yellow" href="#calculator">คำนวณขนาดโซลาร์ <span>⚡</span></a>
              <a class="btn btn-outline" href="#3d-learning">3D Learning Lab <span>◇</span></a>
            </div>
            <div class="hero-meta">
              <span><i class="meta-check">✓</i> 12 โมดูลพร้อมเอกสาร PDF</span>
              <span><i class="meta-check">✓</i> 3D WebGL &amp; AR พร้อมใช้งาน</span>
              <span><i class="meta-check">✓</i> คำนวณตามมาตรฐานวิศวกรรม</span>
            </div>
          </div>
          <div class="hero-art hero-video-art" aria-label="Featured Video: ระบบ Solar Rooftop พลังงานแสงอาทิตย์">
            <iframe class="hero-video" src="https://www.youtube-nocookie.com/embed/B2DFtpRicgY?autoplay=1&amp;mute=1&amp;loop=1&amp;playlist=B2DFtpRicgY&amp;controls=0&amp;rel=0&amp;playsinline=1&amp;modestbranding=1" title="วิดีโอระบบ Solar Rooftop" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" aria-hidden="true" tabindex="-1"></iframe>
            <div class="hero-video-shade"></div>
            <div class="float-tag tag-energy">
              <span class="tag-icon">ϟ</span>
              <span><b>Solar Energy</b><small>Clean · Smart · Future</small></span>
            </div>
            <div class="float-tag tag-3d">
              <span class="tag-cube">◇</span>
              <span><b>3D Learning Lab</b><small>AR / VR Ready</small></span>
            </div>
            <div class="hero-art-label"><span class="hero-label-dot"></span>POWERING KNOWLEDGE FOR A SUSTAINABLE FUTURE</div>
          </div>
        </section>

        <!-- Stat Strip -->
        <section class="stat-strip wrap">
          <div><strong>12</strong><span>โมดูลการเรียนรู้</span></div>
          <div><strong>4 Steps</strong><span>เครื่องคำนวณโซลาร์รูฟ</span></div>
          <div><strong>3D &amp; AR</strong><span>แบบจำลองสถานีสามมิติ</span></div>
          <div class="progress-stat">
            <div class="progress-label"><span>ความก้าวหน้าของคุณ</span><b>${percent}%</b></div>
            <div class="progress-track"><span style="width:${percent}%"></span></div>
            <small>${completed.size} จาก ${modules.length} โมดูลเสร็จแล้ว</small>
          </div>
        </section>

        <!-- Section 1: Solar Learning Lab (Modules 01–11) -->
        <section class="learning-section wrap" id="learning-lab" style="padding-top: 30px; margin-bottom: 70px;">
          <div class="section-heading">
            <div>
              <div class="eyebrow">YOUR LEARNING JOURNEY</div>
              <h2>เส้นทางการเรียนรู้ (Solar Learning Lab)</h2>
              <p>เรียนรู้ทีละขั้น เชื่อมโยงความรู้จากอุปกรณ์สู่ระบบจริง พร้อมเอกสารประกอบการศึกษา</p>
            </div>
            <div class="path-tools">
              <label class="search-box"><span>⌕</span><input id="moduleSearch" type="search" placeholder="ค้นหาโมดูล..." aria-label="ค้นหาโมดูล"></label>
              <select id="moduleFilter" aria-label="กรองหมวดหมู่">${categories.map(c => `<option>${c}</option>`).join('')}</select>
            </div>
          </div>
          <div class="path-map">
            <span class="path-line"></span>
            <div class="path-node active"><b>01–11</b><span>CORE KNOWLEDGE</span></div>
            <div class="path-node future"><b>12</b><span>IMMERSIVE LAB</span></div>
          </div>
          <div class="module-grid" id="moduleGrid">
            ${modules.slice(0, 11).map(m => moduleCard(m)).join('')}
          </div>
        </section>

        <!-- Section 2: NT Solar Rooftop — Interactive 3D Featured — Module 12 -->
        ${module12Section()}

        <!-- Section 3: Solar Rooftop Knowledge Test & Satisfaction Survey (NT HRD Platform) -->
        <section class="knowledge-test-section wrap" id="quiz" style="margin-bottom: 70px; padding-top: 30px;">
          <div class="knowledge-test-card">
            <div class="knowledge-test-visual" aria-hidden="true">
              <span class="test-symbol">✦</span>
              <span class="test-badge">NT HRD PLATFORM</span>
            </div>
            <div class="knowledge-test-body">
              <div class="eyebrow eyebrow-light"><span class="eyebrow-dot"></span> EVALUATION &amp; FEEDBACK · NT HRD</div>
              <h2>แบบทดสอบความเข้าใจและแบบสอบถามความพึงพอใจ</h2>
              <p>
                ประเมินผลสัมฤทธิ์ทางการเรียนรู้หลังจากศึกษาโมดูล 01–12 ผ่านระบบพัฒนาทรัพยากรบุคคล (HRD / KM4U) ของ NT พร้อมร่วมทำแบบสอบถามเพื่อนำข้อคิดเห็นไปพัฒนาและปรับปรุงแพลตฟอร์มการเรียนรู้
              </p>
              <div class="knowledge-test-actions">
                <a class="btn btn-yellow" href="https://km4u.ntplc.co.th/content/6aeab958e4a1dc09ee891a31" target="_blank" rel="noopener noreferrer">
                  <span>แบบทดสอบความเข้าใจ Solar Rooftop</span> <span>↗</span>
                </a>
                <a class="btn btn-glass" href="https://km4u.ntplc.co.th/content/6aeabbc3e4a1dc09ee891cab" target="_blank" rel="noopener noreferrer">
                  <span>แบบสอบถามความพึงพอใจการใช้งานระบบ</span> <span>↗</span>
                </a>
              </div>
              <div class="knowledge-test-meta">
                <span><i>ℹ</i> ลิงก์เชื่อมต่อไปยังระบบ NT KM4U โดยตรง (เปิดในแท็บใหม่)</span>
                <span><i>✓</i> ข้อมูลการทดสอบจะถูกบันทึกในระบบพัฒนาบุคลากร NT</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4: Learn Beyond the Lessons — Articles & Knowledge Library -->
        <section class="resources-section wrap" id="articles" style="padding-top: 30px; margin-bottom: 70px;">
          <div class="section-heading">
            <div>
              <div class="eyebrow">LEARN BEYOND THE LESSONS</div>
              <h2>คลังบทความและแหล่งเรียนรู้ (Articles)</h2>
              <p>ต่อยอดจากบทเรียนด้วยคลังบทความและเครื่องมือจำลองจากแหล่งความรู้ภายนอก</p>
            </div>
            <span class="resource-count">${simulators.length + 1} RESOURCES</span>
          </div>
          
          <article class="article-library-card">
            <div class="article-library-icon" aria-hidden="true">▤</div>
            <div class="article-library-copy">
              <span class="article-library-kicker">KNOWLEDGE LIBRARY · READ MORE</span>
              <h3>คลังบทความและองค์ความรู้เพิ่มเติม NT Academy</h3>
              <p>เปิดอ่านบทความ เอกสารมาตรฐาน และคู่มือเทคนิคเพิ่มเติม เพื่อทบทวนความรู้และศึกษาประเด็นที่สนใจเกี่ยวกับระบบ Solar Rooftop ได้ด้วยตนเอง</p>
              <div class="article-library-meta">
                <span>อ่านเพิ่มเติมได้ตามความสนใจ</span>
                <span>เปิดเว็บไซต์ภายนอก ↗</span>
              </div>
            </div>
            <a class="article-library-button" href="https://ntacademy.ntcloudbox.com/s/aaGGok27SMAzMME" target="_blank" rel="noopener noreferrer" aria-label="เปิดคลังบทความและองค์ความรู้เพิ่มเติมในเว็บไซต์ NT Academy">
              เข้าสู่คลังบทความ <span>↗</span>
            </a>
          </article>

          <div class="resource-grid">
            ${simulators.slice(0, 3).map((s, i) => resourceCard(s, i)).join('')}
          </div>
          <div class="resource-grid resource-grid-extra">
            ${simulators.slice(3).map((s, i) => resourceCard(s, i + 3)).join('')}
          </div>
          <p class="disclaimer">
            <b>หมายเหตุ:</b> เครื่องมือภายนอกแต่ละแห่งมีขอบเขตต่างกัน บางแห่งเป็นแบบจำลอง 3 มิติหรือจำลองวงจร ไม่ใช่ประสบการณ์ AR/VR ที่ใช้แว่นโดยตรง กรุณาทดลองและตรวจสอบข้อกำหนดก่อนนำไปใช้ฝึกอบรมจริง
          </p>
        </section>

        <!-- Next Step / AR Call to Action -->
        <section class="next-step wrap" style="margin-bottom: 80px;">
          <div class="next-icon">◇</div>
          <div>
            <div class="eyebrow">THE NEXT LEARNING EXPERIENCE</div>
            <h2>จากโมเดล 3D สู่ประสบการณ์ AR</h2>
            <p>สำรวจโมเดลสถานี NT บนเว็บไซต์ แล้วเปิด LLK_SolarAR บนโทรศัพท์มือถือเพื่อทดลองประสบการณ์ Augmented Reality</p>
          </div>
          <a class="btn btn-dark" href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer">เปิด LLK_SolarAR ↗</a>
        </section>

        <!-- Section 5: Preliminary Solar PV Sizing Engine -->
        <section class="wrap" id="calculator" style="padding-top: 20px; margin-bottom: 80px;">
          <div id="calculatorMount"></div>
        </section>

        <!-- Section 6: Standalone Battery Storage Design -->
        <section class="wrap" id="offgrid" style="margin-bottom: 80px; padding-top: 20px;">
          <div id="offgridMount"></div>
        </section>
      </main>

      <!-- Footer -->
      <footer>
        <div class="footer-inner wrap">
          <a class="brand footer-brand" href="#home">
            <span class="brand-mark">NT</span>
            <span><b>Solar Academy</b><small>National Telecom Public Company Limited</small></span>
          </a>
          <p>Learning today. Building a sustainable tomorrow · Solar Rooftop Integrated Platform</p>
          <span>NTPLC · Preliminary Engineering Design &amp; Learning Platform</span>
        </div>
      </footer>
    </div>

    <!-- Lesson Dialog Modal -->
    <dialog id="lessonDialog" class="lesson-dialog">
      <button class="dialog-close" id="dialogClose" aria-label="ปิด">×</button>
      <div id="dialogContent"></div>
    </dialog>

    <!-- Toast Notification -->
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  // Initialize Native Module Views
  const calcMount = $('#calculatorMount');
  if (calcMount) {
    calcMount.innerHTML = getCalculatorTemplate(BASE);
    calculatorInstance = new CalculatorController(calcMount, BASE);
  }

  const offgridMount = $('#offgridMount');
  if (offgridMount) {
    offgridMount.innerHTML = getOffgridTemplate();
    offgridInstance = new OffgridController(offgridMount);
  }

  bindAcademyEvents();
  initThreePreview();

  // Initialize SPA Hash Router
  new AppRouter({
    onRouteChanged: routeKey => {
      // Re-trigger chart rendering or resize if navigating to calculator
      if (routeKey === 'calculator' && calculatorInstance) {
        calculatorInstance.recalculate();
      }
    }
  });
}

function moduleCard(m) {
  const isDone = completed.has(m.id);
  return `
    <article class="module-card ${isDone ? 'is-done' : ''}" data-id="${m.id}" data-category="${m.category || 'บทเรียน'}" data-search="${(m.title + ' ' + (m.subtitle || '') + ' ' + (m.goal || '')).toLowerCase()}">
      <div class="module-card-top">
        <span class="module-number">MODULE ${String(m.id).padStart(2, '0')}</span>
        <span class="module-icon">${moduleIcon(m.id)}</span>
      </div>
      <h3>${m.title}</h3>
      <p class="module-subtitle">${m.subtitle || ''}</p>
      <p class="module-goal">${m.goal || ''}</p>
      <div class="module-card-bottom">
        <span class="module-state ${isDone ? 'done' : ''}">
          ${isDone ? '✓ เรียนแล้ว' : 'บทเรียน · ' + (m.parts?.length || 3) + ' หัวข้อ'}
        </span>
        <button class="card-arrow" data-open="${m.id}" aria-label="เปิดโมดูล ${m.id}">↗</button>
      </div>
    </article>
  `;
}

function module12Section() {
  const cards = solarModelExplorer.map(model => `
    <button class="explorer-card" type="button" data-model-key="${model.key}" aria-label="เปิดโมเดล 3 มิติ ${model.title}">
      <div class="explorer-card-visual">
        ${modelExplorerThumbnail(model.thumbnail)}
        <span class="explorer-status">3D GLB</span>
      </div>
      <div class="explorer-card-copy">
        <div class="explorer-card-heading">
          <span class="explorer-model-number">${model.badge}</span>
          <span class="explorer-external" aria-hidden="true">⌖</span>
        </div>
        <h3>${model.english}</h3>
        <b>${model.title}</b>
        <p>${model.description}</p>
        <span class="explorer-open">EXPLORE 3D <span aria-hidden="true">↗</span></span>
      </div>
    </button>
  `).join('');

  return `
    <section class="module11-section module12-lab" id="3d-learning">
      <div class="module12-shell">
        <header class="module12-intro">
          <div class="module12-intro-copy">
            <div class="eyebrow eyebrow-light"><span class="eyebrow-dot"></span> NT SOLAR ROOFTOP · INTERACTIVE 3D</div>
            <div class="module12-heading">
              <span class="module12-feature-tag">FEATURED · MODULE 12</span>
              <h2>Solar Rooftop <em>3D Explorer</em></h2>
              <p>3D SOLAR SYSTEM · AR / VR LEARNING LAB</p>
            </div>
            <p class="module12-lead">สำรวจโมเดลสถานี NT ผ่านการหมุนและซูมอย่างอิสระ ใช้ปุ่ม Focus Model เพื่อจัดโมเดลให้อยู่กลางมุมมอง หรือเลือกโมเดลเจาะลึกจากรายการด้านขวา</p>
          </div>
          <div class="module12-intro-actions">
            <a class="btn btn-yellow" href="https://solar-ar-llk.netlify.app/" target="_blank" rel="noopener noreferrer">เปิด LLK_SolarAR <span>↗</span></a>
            <button class="btn btn-glass" id="openLesson12">เป้าหมายการเรียนรู้ <span>↗</span></button>
          </div>
        </header>

        <div class="module12-workspace">
          <div class="module11-visual module12-visual">
            <div class="visual-topline">
              <span><i></i> NT SOLAR ROOFTOP · INTERACTIVE 3D</span>
              <span class="module12-model-label">GLB MODEL · LIVE VIEW</span>
            </div>
            <div class="three-stage module12-stage" id="threeStage" aria-label="พื้นที่สำรวจโมเดลสถานี NT" tabindex="0">
              <div class="stage-placeholder">
                <div class="mini-sun"></div>
                <div class="mini-roof"><div class="mini-panels"></div></div>
                <span>กำลังเตรียม Interactive 3D Explorer…</span>
              </div>
              <div class="model-loading" id="modelStatus" role="status" aria-live="polite">กำลังโหลดโมเดลสถานี NT…</div>
              <div class="model-controls" aria-label="ตัวควบคุมโมเดล 3 มิติ">
                <button class="model-control model-control-back" id="backToSite" type="button" title="กลับสู่แบบจำลองสถานีหลัก (LLK Exchange)" style="display:none;">
                  <span aria-hidden="true">⟵</span><span>ภาพรวมสถานี</span>
                </button>
                <button class="model-control model-control-toggle" id="autoRotateToggle" type="button" aria-pressed="true" title="ปิดการหมุนอัตโนมัติ">
                  <span class="control-indicator"></span><span>Auto Rotate</span><b>ON</b>
                </button>
                <button class="model-control model-control-toggle is-active" id="hotspotsToggle" type="button" aria-pressed="true" title="เปิด/ปิดจุดชี้ระบุอุปกรณ์ (Hotspots)">
                  <span class="control-indicator"></span><span>Hotspots</span><b>ON</b>
                </button>
                <div class="model-control-group">
                  <button class="model-control model-control-icon" id="zoomOut" type="button" aria-label="ซูมออก" title="ซูมออก (−)">−</button>
                  <button class="model-control model-control-icon" id="zoomIn" type="button" aria-label="ซูมเข้า" title="ซูมเข้า (+)">+</button>
                </div>
                <button class="model-control" id="resetView" type="button" title="คืนมุมมองเริ่มต้น (R)">
                  <span aria-hidden="true">⟳</span><span>Reset View</span>
                </button>
                <button class="model-control" id="exploreMode" type="button" aria-pressed="true" title="โหมดสำรวจ: ลากเพื่อหมุนและซูม">
                  <span aria-hidden="true">◎</span><span>Explore</span>
                </button>
                <button class="model-control" id="focusMode" type="button" title="จัดโมเดลให้อยู่กลางมุมมอง">
                  <span aria-hidden="true">⌖</span><span>Focus Model</span>
                </button>
                <button class="model-control model-control-fullscreen" id="fullscreenModel" type="button" aria-label="แสดงโมเดลเต็มจอ (F)" title="เต็มจอ (F)">⛶</button>
              </div>
            </div>
            <div class="module12-guidance">
              <b>วิธีควบคุมโมเดล</b>
              <span>ลากเพื่อหมุน</span>
              <span>Scroll เพื่อซูม</span>
              <span>ดับเบิลคลิกเพื่อโฟกัส</span>
              <span>Reset View เพื่อคืนมุมมอง</span>
            </div>
            <p class="module12-viewer-hint">ใช้เมาส์ ล้อเลื่อน หรือปุ่มควบคุมด้านบน · แตะลาก / บีบสองนิ้วบนจอสัมผัส · คีย์บอร์ด: ปุ่มลูกศร, + / −, R, F</p>
          </div>

          <aside class="model-explorer" aria-labelledby="explorerTitle">
            <header class="model-explorer-heading">
              <span class="explorer-heading-icon" aria-hidden="true">▱</span>
              <div>
                <h2 id="explorerTitle">EXPLORE SOLAR COMPONENTS</h2>
                <p>เลือกโมเดลเฉพาะทางเพื่อเปิดดูโมเดล 3D จริง</p>
              </div>
              <span class="explorer-count">03</span>
            </header>
            <div class="model-explorer-list">${cards}</div>
            <p class="model-explorer-footnote"><span>i</span> คลิกการ์ดอุปกรณ์เพื่อเปิดดูโมเดล 3 มิติเจาะลึกแบบสมจริง</p>
          </aside>
        </div>

        <div class="module12-note">
          <span>i</span>
          <span>โมเดล GLB เดิมคงสภาพต้นฉบับ การควบคุมกล้องทำงานใน Viewer เท่านั้น</span>
        </div>
      </div>

      <div class="wrap external-launchers">
        <div class="launcher-heading">
          <div>
            <b>เริ่มทดลองจากแพลตฟอร์มจริง</b>
            <p>เลือกเครื่องมือที่เหมาะกับหัวข้อการเรียนรู้</p>
          </div>
          <span class="external-count">${simulators.length} LINKS</span>
        </div>
        <div class="launcher-grid">
          ${simulators.map((s, i) => `
            <a class="launcher-card" href="${s.url}" target="_blank" rel="noopener noreferrer">
              <span class="launcher-index">0${i + 1}</span>
              <span class="launcher-info">
                <b>${s.name}</b>
                <small>${s.type}</small>
              </span>
              <span class="launcher-arrow">↗</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function modelExplorerThumbnail(type) {
  const drawings = {
    panels: '<svg viewBox="0 0 180 100" aria-hidden="true"><path class="thumb-frame" d="M38 65 93 34l58 27-58 33z"/><path class="thumb-panel" d="M43 63 94 35l50 24-51 29z"/><path class="thumb-grid" d="m59 55 49 24M76 45l49 23M61 73l49-27m-33 35 48-28"/><path class="thumb-stand" d="m59 73-3 16m52-7 2 12m29-35 5 23"/></svg>',
    structure: '<svg viewBox="0 0 180 100" aria-hidden="true"><path class="thumb-structure" d="m30 67 55-34 66 30-56 34zM30 67l65 30m-10-64 10 64m56-34L95 97M42 60v19m30-38v38m31-30v38m32-29v34m-91-8 20-13 18 20 18-12 17 20 22-13"/><path class="thumb-accent" d="m48 53 37-22 55 24"/></svg>',
    cabinet: '<svg viewBox="0 0 180 100" aria-hidden="true"><path class="thumb-cabinet" d="M61 16h57v73H61zM61 16l14-8h57l-14 8m0 0v73m-57 0 14-8h57"/><path class="thumb-detail" d="M71 26h13v9H71zm20 0h20v9H91zM71 43h40v2H71zm0 8h40v2H71zm0 8h13v15H71zm20 0h20v15H91z"/><circle class="thumb-led" cx="111" cy="80" r="2"/></svg>'
  };
  return `<div class="explorer-thumb explorer-thumb-${type}">${drawings[type] || drawings.panels}</div>`;
}

function resourceCard(s, i) {
  return `
    <article class="resource-card">
      <div class="resource-card-head">
        <span class="resource-symbol">${['◇', '☼', '⌁', '⌂', '▧', '⟲', '◉'][i % 7]}</span>
        <span class="resource-index">RESOURCE 0${i + 1}</span>
      </div>
      <span class="resource-type">${s.type}</span>
      <h3>${s.name}</h3>
      <p>${s.description}</p>
      <div class="resource-note">${s.note}</div>
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="resource-link">เปิดแพลตฟอร์ม <span>↗</span></a>
    </article>
  `;
}

function bindAcademyEvents() {
  $('#enterAcademy')?.addEventListener('click', () => {
    const welcome = $('#welcomeScreen');
    if (!welcome) return;
    welcome.classList.add('welcome-leaving');
    setTimeout(() => {
      welcome.remove();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 220);
  });

  $('#moduleSearch')?.addEventListener('input', filterModules);
  $('#moduleFilter')?.addEventListener('change', e => {
    activeFilter = e.target.value;
    filterModules();
  });

  $('#moduleGrid')?.addEventListener('click', e => {
    const b = e.target.closest('[data-open]');
    if (b) openLesson(Number(b.dataset.open));
  });

  $('#openLesson12')?.addEventListener('click', () => openLesson(12));
  $('#dialogClose')?.addEventListener('click', () => $('#lessonDialog')?.close());
  $('#lessonDialog')?.addEventListener('click', e => {
    if (e.target === $('#lessonDialog')) $('#lessonDialog').close();
  });

  $('#mobileMenu')?.addEventListener('click', () => {
    $('.desktop-nav')?.classList.toggle('nav-open');
  });

  document.querySelectorAll('.desktop-nav a').forEach(a => {
    a.addEventListener('click', () => {
      $('.desktop-nav')?.classList.remove('nav-open');
    });
  });
}

function filterModules() {
  const searchInput = $('#moduleSearch');
  if (!searchInput) return;
  const q = searchInput.value.trim().toLowerCase();
  let visible = 0;

  document.querySelectorAll('.module-card').forEach(card => {
    const ok = card.dataset.search.includes(q) && (activeFilter === 'ทั้งหมด' || card.dataset.category === activeFilter);
    card.hidden = !ok;
    if (ok) visible++;
  });

  let empty = $('#emptySearch');
  if (!visible) {
    if (!empty) {
      empty = document.createElement('div');
      empty.id = 'emptySearch';
      empty.className = 'empty-search';
      empty.textContent = 'ไม่พบโมดูลที่ตรงกับคำค้นหา';
      $('#moduleGrid')?.append(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

function openLesson(id) {
  const m = modules.find(x => x.id === id);
  if (!m) return;
  const isDone = completed.has(id);
  const parts = (m.parts || []).map((p, i) => `
    <div class="lesson-part">
      <span>${String(i + 1).padStart(2, '0')}</span>
      <div><b>${p[0]}</b><p>${p[1]}</p></div>
    </div>
  `).join('');

  const links = id === 12
    ? `<div class="dialog-links">${simulators.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a>`).join('')}</div>`
    : '';

  const video = m.videoId
    ? `<div class="lesson-video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(m.videoId)}?rel=0" title="วิดีโอการเรียนรู้ ${m.title}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`
    : '';

  const download = m.formUrl
    ? `<a class="lesson-download" href="${m.formUrl}" target="_blank" rel="noopener noreferrer"><span>ดาวน์โหลดแบบฟอร์ม</span><span aria-hidden="true">↓</span></a>`
    : '';

  const documentLink = m.document
    ? `<a class="lesson-document" href="${asset(m.document)}" target="_blank" rel="noopener noreferrer">เปิดเอกสารประกอบการเรียน (PDF) <span>↗</span></a>`
    : '';

  $('#dialogContent').innerHTML = `
    <div class="dialog-eyebrow">MODULE ${String(id).padStart(2, '0')} · ${id === 12 ? '3D LEARNING LAB' : 'CORE LEARNING'}</div>
    <h2>${m.title}</h2>
    <p class="dialog-subtitle">${m.subtitle || ''}</p>
    <div class="lesson-goal">
      <b>เป้าหมายการเรียนรู้</b>
      <p>${m.goal || ''}</p>
    </div>
    <div class="lesson-parts">
      <h3>หัวข้อการเรียนรู้</h3>
      ${parts || '<p>โมดูลนี้เป็นพื้นที่เชื่อมต่อไปยังแบบจำลอง 3 มิติและแพลตฟอร์มภายนอก</p>'}
    </div>
    ${m.practice ? `<div class="practice-box"><b>กิจกรรมฝึกปฏิบัติ</b><p>${m.practice}</p></div>` : ''}
    ${m.note ? `<div class="lesson-note"><b>ข้อควรจำ</b><p>${m.note}</p></div>` : ''}
    ${video}
    ${download}
    ${documentLink}
    ${links}
    <button class="btn ${isDone ? 'btn-outline' : 'btn-dark'} dialog-complete" id="toggleComplete">
      ${isDone ? '✓ ทำเครื่องหมายว่าเรียนแล้ว' : 'ทำเครื่องหมายว่าเรียนจบแล้ว'}
    </button>
  `;

  $('#lessonDialog')?.showModal();

  $('#toggleComplete')?.addEventListener('click', () => {
    if (completed.has(id)) completed.delete(id);
    else completed.add(id);

    localStorage.setItem(progressKey, JSON.stringify([...completed]));
    const card = $(`.module-card[data-id="${id}"]`);
    if (card) {
      const done = completed.has(id);
      card.classList.toggle('is-done', done);
      const state = card.querySelector('.module-state');
      if (state) {
        state.classList.toggle('done', done);
        state.textContent = done ? '✓ เรียนแล้ว' : 'บทเรียน · ' + (m.parts?.length || 3) + ' หัวข้อ';
      }
    }
    updateProgressUI();
    $('#lessonDialog')?.close();
    showToast(completed.has(id) ? 'บันทึกความก้าวหน้าแล้ว' : 'ปรับสถานะการเรียนแล้ว');
  });
}

function updateProgressUI() {
  const percent = Math.round((completed.size / modules.length) * 100);
  const value = $('.progress-label b');
  const bar = $('.progress-track span');
  const detail = $('.progress-stat small');
  if (value) value.textContent = `${percent}%`;
  if (bar) bar.style.width = `${percent}%`;
  if (detail) detail.textContent = `${completed.size} จาก ${modules.length} โมดูลเสร็จแล้ว`;
}

let toastTimer;
function showToast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function initThreePreview() {
  const stage = $('#threeStage');
  if (!stage) return;

  const modelUrl = new URL(asset('/models/LLK_exchange_site.glb'), document.baseURI).href;
  const status = $('#modelStatus');
  const backBtn = $('#backToSite');
  const controls = {
    auto: $('#autoRotateToggle'),
    hotspots: $('#hotspotsToggle'),
    zoomIn: $('#zoomIn'),
    zoomOut: $('#zoomOut'),
    reset: $('#resetView'),
    explore: $('#exploreMode'),
    focus: $('#focusMode'),
    fullscreen: $('#fullscreenModel'),
    back: backBtn
  };

  const updateExplorerState = (activeKey) => {
    document.querySelectorAll('.explorer-card').forEach(card => {
      const isMatch = card.dataset.modelKey === activeKey;
      card.classList.toggle('is-active', isMatch);
      card.setAttribute('aria-pressed', String(isMatch));
      if (isMatch) card.classList.remove('is-focused');
    });
    if (backBtn) {
      backBtn.style.display = activeKey === 'site' ? 'none' : 'inline-flex';
    }
  };

  threeViewerCleanup = initThreeViewer({
    stage,
    status,
    controls,
    section: document.getElementById('3d-learning') || document.getElementById('module12'),
    modelUrl,
    onModelChanged: (modelKey, meta) => {
      updateExplorerState(modelKey);
    }
  });

  // Link side explorer cards to inspect individual 3D component models
  document.querySelectorAll('.explorer-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.modelKey;
      if (threeViewerCleanup?.loadModel && key) {
        threeViewerCleanup.loadModel(key);
      }
    });
  });

  backBtn?.addEventListener('click', () => {
    if (threeViewerCleanup?.loadModel) {
      threeViewerCleanup.loadModel('site');
    }
  });
}

render();
