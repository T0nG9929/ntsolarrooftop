/**
 * NT Solar Academy - Native SPA Hash Router
 * Handles direct routes, browser back/forward, smooth scrolling, and active nav states.
 */

export class AppRouter {
  constructor({ routes, onRouteChanged }) {
    this.routes = routes || {};
    this.onRouteChanged = onRouteChanged || (() => {});
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  getCurrentHash() {
    return window.location.hash.replace(/^#\/?/, '').trim() || 'home';
  }

  navigate(hash) {
    const cleanHash = hash.replace(/^#\/?/, '');
    window.location.hash = `#${cleanHash}`;
  }

  handleRoute() {
    const raw = this.getCurrentHash();
    // Normalize aliases
    let routeKey = raw;
    if (raw === '' || raw === 'welcome' || raw === 'welcomeScreen') routeKey = 'home';
    else if (raw === 'path' || raw === 'learning' || raw === 'modules') routeKey = 'learning-lab';
    else if (raw === 'module12' || raw === '3d' || raw === '3d-explorer') routeKey = '3d-learning';
    else if (raw === 'test' || raw === 'exam' || raw === 'hrd' || raw === 'survey') routeKey = 'quiz';
    else if (raw === 'resources' || raw === 'library') routeKey = 'articles';
    else if (raw === 'calc' || raw === 'sizing') routeKey = 'calculator';
    else if (raw === 'battery' || raw === 'storage') routeKey = 'offgrid';

    // Update active nav class
    document.querySelectorAll('.desktop-nav a').forEach(a => {
      const hrefHash = (a.getAttribute('href') || '').replace(/^#\/?/, '');
      const isActive = hrefHash === routeKey ||
        (routeKey === 'home' && hrefHash === 'home') ||
        (routeKey === 'learning-lab' && (hrefHash === 'learning-lab' || hrefHash === 'path')) ||
        (routeKey === '3d-learning' && (hrefHash === '3d-learning' || hrefHash === 'module12')) ||
        (routeKey === 'calculator' && (hrefHash === 'calculator' || hrefHash === 'calc')) ||
        (routeKey === 'articles' && (hrefHash === 'articles' || hrefHash === 'resources')) ||
        (routeKey === 'quiz' && (hrefHash === 'quiz' || hrefHash === 'test')) ||
        (routeKey === 'offgrid' && (hrefHash === 'offgrid' || hrefHash === 'battery'));
      a.classList.toggle('nav-active', isActive);
    });

    // Close mobile nav drawer if open
    document.querySelector('.desktop-nav')?.classList.remove('nav-open');

    // Scroll to target element or execute route handler
    this.scrollToSection(routeKey);
    this.onRouteChanged(routeKey);
  }

  scrollToSection(routeKey) {
    const welcome = document.getElementById('welcomeScreen');
    if (welcome && routeKey !== 'home') {
      welcome.remove();
    }

    const targetEl = document.getElementById(routeKey) ||
      (routeKey === 'learning-lab' ? document.getElementById('learning-lab') || document.getElementById('path') : null) ||
      (routeKey === '3d-learning' ? document.getElementById('3d-learning') || document.getElementById('module12') : null) ||
      (routeKey === 'calculator' ? document.getElementById('calculator') : null) ||
      (routeKey === 'articles' ? document.getElementById('articles') : null) ||
      (routeKey === 'quiz' ? document.getElementById('quiz') : null) ||
      (routeKey === 'offgrid' ? document.getElementById('offgrid') : null);

    if (targetEl) {
      setTimeout(() => {
        const topbarHeight = 78;
        const rect = targetEl.getBoundingClientRect();
        const top = window.pageYOffset + rect.top - topbarHeight - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }, 50);
    }
  }
}

export default AppRouter;
