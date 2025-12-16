/**
 * Main Application Logic
 * Coordinates all modules and initializes the application
 */

class LiteracyApp {
  constructor() {
    this.version = '1.0.0';
    this.isInitialized = false;
    this.modules = {};

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🏰 魔法识字乐园启动中...');

      // Show loading state
      this.showLoadingState();

      // Initialize modules in order
      await this.initializeModules();

      // Setup error handlers
      this.setupErrorHandlers();

      // Setup service worker if available
      this.setupServiceWorker();

      // Initialize user preferences
      this.initializeUserPreferences();

      // Check browser compatibility
      this.checkBrowserCompatibility();

      // Setup analytics if enabled
      this.setupAnalytics();

      // Application ready
      this.isInitialized = true;
      console.log('✨ 魔法识字乐园启动完成！');

      // Hide loading state
      this.hideLoadingState();

      // Show welcome message for new users
      this.showWelcomeMessage();

    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize all modules
   */
  async initializeModules() {
    console.log('📦 初始化模块...');

    // Initialize Storage Manager
    if (window.storageManager) {
      const storageInitialized = window.storageManager.initialize();
      if (storageInitialized) {
        this.modules.storage = window.storageManager;
        console.log('✅ 存储模块已初始化');
      } else {
        console.warn('⚠️ 存储模块初始化失败，某些功能可能受限');
      }
    }

    // Initialize UI Manager
    if (window.uiManager) {
      this.modules.ui = window.uiManager;
      this.modules.ui.loadSavedData();
      console.log('✅ UI模块已初始化');
    }

    // Initialize Image Generator
    if (window.imageGenerator) {
      this.modules.imageGenerator = window.imageGenerator;
      console.log('✅ 图片生成模块已初始化');
    }

    // Wait for any async operations
    await this.waitForAsyncOperations();
  }

  /**
   * Wait for async operations to complete
   */
  async waitForAsyncOperations() {
    // Wait for themes to load
    const maxWaitTime = 5000; // 5 seconds
    const startTime = Date.now();

    while (!this.modules.ui?.themesData && Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.modules.ui?.themesData) {
      console.warn('⚠️ 主题数据加载超时');
    }
  }

  /**
   * Setup global error handlers
   */
  setupErrorHandlers() {
    // Window error handler
    window.addEventListener('error', (event) => {
      console.error('全局错误:', event.error);
      this.logError('GlobalError', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未处理的Promise拒绝:', event.reason);
      this.logError('UnhandledPromiseRejection', {
        reason: event.reason
      });
    });

    // Image error handler
    document.addEventListener('error', (event) => {
      if (event.target.tagName === 'IMG') {
        this.handleImageError(event.target);
      }
    }, true);
  }

  /**
   * Setup service worker for offline support
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('📡 Service Worker 注册成功:', registration.scope);
        })
        .catch((error) => {
          console.log('📡 Service Worker 注册失败:', error);
        });
    }
  }

  /**
   * Initialize user preferences
   */
  initializeUserPreferences() {
    if (!this.modules.storage) return;

    const preferences = this.modules.storage.getPreferences();

    // Apply theme
    this.applyTheme(preferences.theme);

    // Apply other preferences
    document.body.classList.toggle('sound-enabled', preferences.soundEnabled);
  }

  /**
   * Apply theme to application
   * @param {string} theme - Theme name
   */
  applyTheme(theme) {
    if (theme === 'auto') {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    document.body.setAttribute('data-theme', theme);
  }

  /**
   * Check browser compatibility
   */
  checkBrowserCompatibility() {
    const issues = [];

    // Check for required APIs
    if (!window.fetch) {
      issues.push('您的浏览器不支持 Fetch API，请升级到最新版本');
    }

    if (!window.localStorage) {
      issues.push('您的浏览器不支持 LocalStorage，某些功能可能无法使用');
    }

    if (!window.File && !window.FileReader && !window.FileList && !window.Blob) {
      issues.push('您的浏览器不支持文件操作，下载功能可能无法使用');
    }

    // Check ES6 support
    try {
      eval('const test = () => {}');
    } catch (e) {
      issues.push('您的浏览器不支持现代 JavaScript，请升级到最新版本');
    }

    if (issues.length > 0) {
      console.warn('⚠️ 浏览器兼容性问题:', issues);
      this.showCompatibilityWarning(issues);
    }
  }

  /**
   * Setup analytics (placeholder for future implementation)
   */
  setupAnalytics() {
    // Analytics could be implemented here
    // For now, just log page views
    this.logEvent('page_view', {
      page: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  }

  /**
   * Show welcome message for new users
   */
  showWelcomeMessage() {
    if (!this.modules.storage) return;

    const hasVisited = localStorage.getItem('literacy_app_visited');
    if (!hasVisited) {
      setTimeout(() => {
        this.modules.ui.showToast(
          '欢迎来到魔法识字乐园！选择一个主题开始创建你的第一张识字图片吧！',
          'info'
        );
        localStorage.setItem('literacy_app_visited', 'true');
      }, 2000);
    }
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    // Loading state is handled by the loading screen in HTML
    console.log('⏳ 显示加载状态...');
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    // Loading state is hidden by UI manager
    console.log('✅ 隐藏加载状态');
  }

  /**
   * Handle initialization error
   * @param {Error} error - Initialization error
   */
  handleInitializationError(error) {
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }

    // Show error message
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: 'Noto Sans SC', sans-serif;
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #ffe66d, #ff6b9d);
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          max-width: 500px;
        ">
          <div style="font-size: 4rem; margin-bottom: 20px;">😢</div>
          <h1 style="color: #9b59b6; margin-bottom: 20px;">应用启动失败</h1>
          <p style="color: #666; margin-bottom: 30px;">
            很抱歉，魔法识字乐园遇到了一些问题。<br>
            请刷新页面重试，如果问题持续存在，请联系技术支持。
          </p>
          <button onclick="window.location.reload()" style="
            background: linear-gradient(135deg, #4a90e2, #ff6b9d);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
          ">
            🔄 重新加载
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Handle image loading errors
   * @param {HTMLImageElement} img - Failed image element
   */
  handleImageError(img) {
    img.style.display = 'none';

    // Show placeholder
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${img.offsetWidth || 300}px;
      height: ${img.offsetHeight || 200}px;
      background: #f5f5f5;
      border: 2px dashed #ddd;
      border-radius: 10px;
      color: #999;
      font-size: 14px;
      text-align: center;
      flex-direction: column;
      gap: 10px;
    `;
    placeholder.innerHTML = `
      <div style="font-size: 2rem;">🖼️</div>
      <div>图片加载失败</div>
    `;

    img.parentNode.insertBefore(placeholder, img);
  }

  /**
   * Show compatibility warning
   * @param {Array} issues - Compatibility issues
   */
  showCompatibilityWarning(issues) {
    const issuesList = issues.map(issue => `<li>${issue}</li>`).join('');

    const modal = this.modules.ui.createModal({
      title: '浏览器兼容性警告',
      content: `
        <p>您的浏览器可能无法完全支持所有功能：</p>
        <ul style="margin: 20px 0; padding-left: 20px;">
          ${issuesList}
        </ul>
        <p>建议您升级到最新版本的 Chrome、Firefox、Safari 或 Edge 浏览器。</p>
      `,
      buttons: [
        {
          text: '我已了解',
          icon: '✅',
          class: 'magic-btn',
          action: null
        }
      ]
    });

    this.modules.ui.showModal(modal);
  }

  /**
   * Log error for debugging
   * @param {string} type - Error type
   * @param {Object} data - Error data
   */
  logError(type, data) {
    const errorLog = {
      type: type,
      data: data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error logged:', errorLog);

    // Store error logs locally for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('literacy_error_logs') || '[]');
      logs.push(errorLog);

      // Keep only last 50 error logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }

      localStorage.setItem('literacy_error_logs', JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save error log:', e);
    }
  }

  /**
   * Log event for analytics
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  logEvent(eventName, data) {
    const eventLog = {
      event: eventName,
      data: data,
      timestamp: Date.now()
    };

    console.log('Event logged:', eventLog);

    // In a real application, this would send to analytics service
    // For now, just store locally
    try {
      const logs = JSON.parse(localStorage.getItem('literacy_event_logs') || '[]');
      logs.push(eventLog);

      // Keep only last 100 event logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      localStorage.setItem('literacy_event_logs', JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save event log:', e);
    }
  }

  /**
   * Get application version
   * @returns {string} Version string
   */
  getVersion() {
    return this.version;
  }

  /**
   * Get application status
   * @returns {Object} Application status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      version: this.version,
      modules: Object.keys(this.modules),
      storageAvailable: this.modules.storage?.isAvailable() || false,
      online: navigator.onLine
    };
  }

  /**
   * Restart application
   */
  restart() {
    console.log('🔄 重启应用...');
    window.location.reload();
  }

  /**
   * Get debug information
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      status: this.getStatus(),
      storage: this.modules.storage?.getStorageInfo(),
      errorLogs: JSON.parse(localStorage.getItem('literacy_error_logs') || '[]'),
      eventLogs: JSON.parse(localStorage.getItem('literacy_event_logs') || '[]'),
      preferences: this.modules.storage?.getPreferences(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      },
      viewport: Utils.getViewportSize()
    };
  }
}

// Global function to switch pages (called from HTML)
function switchPage(page) {
  if (window.uiManager) {
    window.uiManager.switchPage(page);
  }
}

// Global toast shortcut (called from HTML)
function showToast(message, type = 'info') {
  if (window.uiManager) {
    window.uiManager.showToast(message, type);
  }
}

// Initialize application
window.literacyApp = new LiteracyApp();

// Make app available globally for debugging
window.app = window.literacyApp;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiteracyApp;
}