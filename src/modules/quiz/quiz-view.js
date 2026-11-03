/**
 * NT Solar Academy - Interactive Knowledge Quiz Module
 */

import { quizQuestions } from '../../data/quiz-data.js';

export function getQuizTemplate() {
  return `
    <div class="quiz-wrapper" id="quizApp">
      <div class="calc-header-strip">
        <div class="calc-header-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> KNOWLEDGE EVALUATION</span>
          <h2>แบบทดสอบความเข้าใจ <span>Solar Rooftop</span></h2>
          <p>ทดสอบความรู้ความเข้าใจด้านวิศวกรรม ฟิสิกส์พลังงานแสงอาทิตย์ และความคุ้มค่าทางการเงิน</p>
        </div>
      </div>

      <div class="card quiz-card">
        <div class="card-header">
          <div class="card-title-group">
            <span class="eyebrow">QUESTION &amp; ANSWER</span>
            <h3 id="quizQuestionNum">คำถามข้อที่ 1</h3>
          </div>
          <div class="quiz-score-badge">
            คะแนน: <strong id="quizScoreDisplay">0</strong> / ${quizQuestions.length}
          </div>
        </div>

        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" id="quizProgressFill" style="width: 20%;"></div>
        </div>

        <div id="quizQuestionContainer">
          <h4 class="quiz-question-title" id="quizQuestionText">กำลังโหลดคำถาม...</h4>
          <div class="quiz-options" id="quizOptionsContainer"></div>
          <div class="quiz-feedback" id="quizFeedbackBox" style="display: none;"></div>
        </div>

        <div id="quizResultContainer" style="display: none; text-align: center; padding: 25px 15px;">
          <div class="quiz-completion-icon">🏆</div>
          <h3 style="font-size: 24px; color: var(--navy); margin-bottom: 8px;">ยินดีด้วย! คุณทำแบบทดสอบครบแล้ว</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">คุณได้คะแนนรวม <strong id="quizFinalScore" style="color: var(--blue); font-size: 26px;">0</strong> จาก ${quizQuestions.length} คะแนน</p>
          <div id="quizFeedbackSummary" style="margin-bottom: 25px; font-size: 13px; color: var(--text-dark);"></div>
          <button class="btn btn-dark" id="btnRestartQuizFinished" type="button">ทำแบบทดสอบใหม่อีกครั้ง ↺</button>
        </div>

        <div class="quiz-footer" id="quizFooterActions">
          <button class="btn btn-outline btn-sm" id="btnRestartQuiz" type="button">เริ่มทำใหม่</button>
          <button class="btn btn-dark btn-sm" id="btnNextQuiz" type="button" disabled>ข้อต่อไป →</button>
        </div>
      </div>
    </div>
  `;
}

export class QuizController {
  constructor(rootEl) {
    this.root = rootEl;
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderQuestion();
  }

  renderQuestion() {
    const $ = id => this.root.querySelector(`#${id}`);
    const q = quizQuestions[this.currentIndex];

    if (!q) {
      this.showFinalResults();
      return;
    }

    this.answered = false;
    $('quizQuestionContainer').style.display = 'block';
    $('quizResultContainer').style.display = 'none';
    $('quizFooterActions').style.display = 'flex';

    if ($('quizQuestionNum')) $('quizQuestionNum').textContent = `คำถามข้อที่ ${this.currentIndex + 1} จาก ${quizQuestions.length}`;
    if ($('quizScoreDisplay')) $('quizScoreDisplay').textContent = this.score;
    if ($('quizQuestionText')) $('quizQuestionText').textContent = q.q;

    // Progress bar
    const pct = Math.round(((this.currentIndex + 1) / quizQuestions.length) * 100);
    if ($('quizProgressFill')) $('quizProgressFill').style.width = `${pct}%`;

    // Options
    const optContainer = $('quizOptionsContainer');
    if (optContainer) {
      optContainer.innerHTML = q.options.map((opt, i) => `
        <button class="quiz-opt-btn" data-opt-idx="${i}" type="button">
          <span class="opt-letter">${['A', 'B', 'C', 'D'][i]}</span>
          <span class="opt-text">${opt}</span>
        </button>
      `).join('');
    }

    const feedback = $('quizFeedbackBox');
    if (feedback) {
      feedback.style.display = 'none';
      feedback.className = 'quiz-feedback';
      feedback.innerHTML = '';
    }

    const nextBtn = $('btnNextQuiz');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = this.currentIndex === quizQuestions.length - 1 ? 'ดูผลคะแนน →' : 'ข้อต่อไป →';
    }
  }

  handleOptionSelect(selectedIndex) {
    if (this.answered) return;
    this.answered = true;

    const q = quizQuestions[this.currentIndex];
    const isCorrect = selectedIndex === q.correct;
    if (isCorrect) this.score++;

    const $ = id => this.root.querySelector(`#${id}`);
    if ($('quizScoreDisplay')) $('quizScoreDisplay').textContent = this.score;

    // Highlight options
    this.root.querySelectorAll('.quiz-opt-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    // Show feedback
    const feedback = $('quizFeedbackBox');
    if (feedback) {
      feedback.style.display = 'block';
      feedback.classList.toggle('correct-feedback', isCorrect);
      feedback.classList.toggle('wrong-feedback', !isCorrect);
      feedback.innerHTML = `
        <div style="font-weight: 800; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          ${isCorrect ? '✓ ถูกต้อง!' : '✕ ยังไม่ถูกต้อง'}
        </div>
        <p style="font-size: 12px; line-height: 1.7; margin: 0;">${q.explanation}</p>
      `;
    }

    const nextBtn = $('btnNextQuiz');
    if (nextBtn) nextBtn.disabled = false;
  }

  showFinalResults() {
    const $ = id => this.root.querySelector(`#${id}`);
    $('quizQuestionContainer').style.display = 'none';
    $('quizResultContainer').style.display = 'block';
    $('quizFooterActions').style.display = 'none';

    if ($('quizFinalScore')) $('quizFinalScore').textContent = this.score;
    const summary = $('quizFeedbackSummary');
    if (summary) {
      const pct = (this.score / quizQuestions.length) * 100;
      if (pct === 100) {
        summary.innerHTML = '<span style="color: var(--green); font-weight: 700;">ยอดเยี่ยมมาก! คุณมีความเข้าใจหลักการ Solar Rooftop ในระดับวิศวกรเบื้องต้นอย่างสมบูรณ์แบบ</span>';
      } else if (pct >= 60) {
        summary.innerHTML = '<span style="color: var(--blue); font-weight: 700;">ทำได้ดีมาก! คุณมีความรู้พื้นฐานที่มั่นคง สามารถศึกษาต่อยอดในหัวข้อการออกแบบเชิงลึกได้</span>';
      } else {
        summary.innerHTML = '<span style="color: #947900; font-weight: 700;">สามารถทบทวนความรู้เพิ่มเติมได้จากเส้นทางบทเรียน Solar Learning Lab เพื่อความเข้าใจที่ดียิ่งขึ้น</span>';
      }
    }
  }

  restart() {
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.renderQuestion();
  }

  bindEvents() {
    this.root.querySelector('#quizOptionsContainer')?.addEventListener('click', e => {
      const btn = e.target.closest('.quiz-opt-btn');
      if (!btn) return;
      const idx = parseInt(btn.dataset.optIdx, 10);
      this.handleOptionSelect(idx);
    });

    this.root.querySelector('#btnNextQuiz')?.addEventListener('click', () => {
      this.currentIndex++;
      this.renderQuestion();
    });

    this.root.querySelector('#btnRestartQuiz')?.addEventListener('click', () => {
      this.restart();
    });

    this.root.querySelector('#btnRestartQuizFinished')?.addEventListener('click', () => {
      this.restart();
    });
  }
}
