/**
 * UI Interaction Handler Module
 * Manages user interface interactions and DOM manipulation
 */

class UIManager {
  constructor() {
    this.currentPage = 'generate';
    this.selectedTheme = null;
    this.isGenerating = false;
    this.themesData = null;

    // DOM element references
    this.elements = {};

    // 等待DOM完全加载后再初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      setTimeout(() => this.init(), 0);
    }
  }

  /**
   * Initialize UI components and event listeners
   */
  init() {
    console.log('🎨 UI管理器初始化开始...');

    // 延迟一点时间确保DOM完全渲染
    setTimeout(() => {
      try {
        this.cacheElements();
        console.log('✅ DOM元素缓存完成');

        this.bindEvents();
        console.log('✅ 事件监听器绑定完成');

        this.loadThemes();
        console.log('✅ 主题数据加载开始...');

        this.hideLoadingScreen();
        console.log('✅ UI管理器初始化完成');
      } catch (error) {
        console.error('❌ UI初始化失败:', error);
        this.showToast('页面初始化失败，请刷新页面', 'error');
      }
    }, 200);
  }

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    const elements = {
      // Navigation
      navButtons: document.querySelectorAll('.nav-btn'),
      pages: document.querySelectorAll('.page'),

      // Generate page
      themeGrid: document.getElementById('themeGrid'),
      titleInput: document.getElementById('titleInput'),
      titleCounter: document.getElementById('titleCounter'),
      apiKeyInput: document.getElementById('apiKeyInput'),
      toggleApiKey: document.getElementById('toggleApiKey'),
      generateBtn: document.getElementById('generateBtn'),
      suggestionButtons: document.querySelectorAll('.suggestion-btn'),

      // Result section
      resultSection: document.getElementById('resultSection'),
      resultImage: document.getElementById('resultImage'),
      downloadBtn: document.getElementById('downloadBtn'),
      saveHistoryBtn: document.getElementById('saveHistoryBtn'),
      generateAnotherBtn: document.getElementById('generateAnotherBtn'),

      // History page
      historyGrid: document.getElementById('historyGrid'),
      emptyHistory: document.getElementById('emptyHistory'),
      clearHistoryBtn: document.getElementById('clearHistoryBtn'),
      exportHistoryBtn: document.getElementById('exportHistoryBtn'),

      // Containers
      modalContainer: document.getElementById('modalContainer'),
      toastContainer: document.getElementById('toastContainer'),
      loadingScreen: document.getElementById('loadingScreen')
    };

    // 验证关键元素是否存在
    const criticalElements = ['resultSection', 'resultImage', 'themeGrid', 'generateBtn'];
    const missingElements = [];

    criticalElements.forEach(elementName => {
      if (!elements[elementName]) {
        missingElements.push(elementName);
      }
    });

    if (missingElements.length > 0) {
      console.warn('⚠️ 以下元素未找到:', missingElements);
    } else {
      console.log('✅ 所有关键元素都已找到');
    }

    console.log('✅ DOM元素缓存完成');
    console.log('📋 找到的元素数量:', Object.keys(elements).filter(key => elements[key]).length);

    this.elements = elements;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Navigation
    this.elements.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        this.switchPage(page);
      });
    });

    // Theme selection
    this.elements.themeGrid.addEventListener('click', (e) => {
      const themeCard = e.target.closest('.theme-card');
      if (themeCard) {
        this.selectTheme(themeCard.dataset.theme);
      }
    });

    // Title input
    this.elements.titleInput.addEventListener('input', (e) => {
      this.updateTitleCounter(e.target.value);
      this.validateForm();
    });

    // API key input
    this.elements.apiKeyInput.addEventListener('input', () => {
      this.validateForm();
    });

    // Toggle API key visibility
    this.elements.toggleApiKey.addEventListener('click', () => {
      this.toggleApiKeyVisibility();
    });

    // Suggestion buttons
    this.elements.suggestionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const suggestion = btn.dataset.suggestion;
        this.elements.titleInput.value = suggestion;
        this.updateTitleCounter(suggestion);
        this.validateForm();
      });
    });

    // Generate button
    this.elements.generateBtn.addEventListener('click', () => {
      this.handleGenerate();
    });

    // Result buttons
    this.elements.downloadBtn?.addEventListener('click', () => {
      this.downloadCurrentImage();
    });

    this.elements.saveHistoryBtn?.addEventListener('click', () => {
      this.saveCurrentToHistory();
    });

    this.elements.generateAnotherBtn?.addEventListener('click', () => {
      this.resetForm();
    });

    // History page buttons
    this.elements.clearHistoryBtn?.addEventListener('click', () => {
      this.confirmClearHistory();
    });

    this.elements.exportHistoryBtn?.addEventListener('click', () => {
      this.exportHistory();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Connection status
    Utils.setupConnectionListeners((isOnline) => {
      this.handleConnectionChange(isOnline);
    });
  }

  /**
   * Load themes from JSON file
   */
  async loadThemes() {
    try {
      console.log('开始加载主题数据...');
      const response = await fetch('data/themes.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('主题数据加载成功:', data);

      if (!data || !data.themes) {
        throw new Error('主题数据格式错误');
      }

      this.themesData = data.themes;
      console.log('✅ 主题数据加载成功:', this.themesData);
      console.log('✅ 可用的主题:', Object.keys(this.themesData));

      this.renderThemes();
      console.log('✅ 主题渲染完成');

    } catch (error) {
      console.error('❌ 主题数据加载失败:', error);

      // 使用默认主题数据
      this.themesData = this.getDefaultThemes();
      console.log('🔄 使用默认主题数据:', this.themesData);
      this.renderThemes();

      this.showToast('主题数据加载失败，使用默认主题', 'warning');
    }
  }

  /**
   * 获取默认主题数据（备用方案）
   */
  getDefaultThemes() {
    return {
      "supermarket": {
        "name": "超市",
        "icon": "🛒",
        "description": "Supermarket shopping experience",
        "vocabulary": {
          "core": [
            {"chinese": "收银员", "pinyin": "shōu yín yuán"},
            {"chinese": "货架", "pinyin": "huò jià"}
          ],
          "items": [
            {"chinese": "苹果", "pinyin": "píng guǒ"},
            {"chinese": "牛奶", "pinyin": "niú nǎi"}
          ],
          "environment": [
            {"chinese": "出口", "pinyin": "chū kǒu"},
            {"chinese": "灯", "pinyin": "dēng"}
          ]
        }
      },
      "park": {
        "name": "公园",
        "icon": "🌳",
        "description": "Park and recreational area",
        "vocabulary": {
          "core": [
            {"chinese": "大树", "pinyin": "dà shù"},
            {"chinese": "草地", "pinyin": "cǎo dì"}
          ],
          "items": [
            {"chinese": "秋千", "pinyin": "qiū qiān"},
            {"chinese": "滑梯", "pinyin": "huá tī"}
          ],
          "environment": [
            {"chinese": "小路", "pinyin": "xiǎo lù"},
            {"chinese": "长椅", "pinyin": "cháng yǐ"}
          ]
        }
      }
    };
  }

  /**
   * Render theme cards
   */
  renderThemes() {
    if (!this.themesData) return;

    const themeGrid = this.elements.themeGrid;
    themeGrid.innerHTML = '';

    Object.entries(this.themesData).forEach(([key, theme]) => {
      const themeCard = document.createElement('div');
      themeCard.className = 'theme-card';
      themeCard.dataset.theme = key;

      themeCard.innerHTML = `
        <span class="theme-icon">${theme.icon}</span>
        <span class="theme-name">${theme.name}</span>
      `;

      themeGrid.appendChild(themeCard);
    });
  }

  /**
   * Switch between pages
   * @param {string} page - Page name ('generate', 'history', 'about')
   */
  switchPage(page) {
    // Update navigation
    this.elements.navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Update pages
    this.elements.pages.forEach(pageElement => {
      pageElement.classList.toggle('active', pageElement.id === `${page}Page`);
    });

    this.currentPage = page;

    // Load page-specific data
    if (page === 'history') {
      this.loadHistory();
    }
  }

  /**
   * Select theme
   * @param {string} themeKey - Theme key
   */
  selectTheme(themeKey) {
    console.log('🎯 选择主题:', themeKey);
    console.log('📚 当前主题数据:', this.themesData);

    // Check if themes data is loaded
    if (!this.themesData) {
      console.warn('⚠️ 主题数据尚未加载');
      this.showToast('主题数据正在加载中，请稍候', 'warning');
      return;
    }

    // Check if theme exists
    if (!this.themesData[themeKey]) {
      console.warn('⚠️ 主题不存在:', themeKey);
      this.showToast(`主题 "${themeKey}" 不存在`, 'error');
      return;
    }

    // Update UI
    this.elements.themeGrid.querySelectorAll('.theme-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.theme === themeKey);
    });

    this.selectedTheme = themeKey;
    console.log('✅ 主题选择成功:', themeKey, '-', this.themesData[themeKey].name);
    this.validateForm();
  }

  /**
   * Update title counter
   * @param {string} value - Current title value
   */
  updateTitleCounter(value) {
    const length = value.length;
    this.elements.titleCounter.textContent = `${length}/30`;
    this.elements.titleCounter.style.color = length > 25 ? 'var(--disney-red)' : 'var(--stone-gray)';
  }

  /**
   * Toggle API key visibility
   */
  toggleApiKeyVisibility() {
    const input = this.elements.apiKeyInput;
    const icon = this.elements.toggleApiKey.querySelector('.eye-icon');

    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = '🙈';
    } else {
      input.type = 'password';
      icon.textContent = '👁️';
    }
  }

  /**
   * Validate form and enable/disable generate button
   */
  validateForm() {
    const title = this.elements.titleInput.value.trim();
    const apiKey = this.elements.apiKeyInput.value.trim();

    // 详细验证状态
    const validation = {
      theme: { valid: !!this.selectedTheme, value: this.selectedTheme || '未选择' },
      title: { valid: title.length > 0, value: title || '未输入', length: title.length },
      apiKey: { valid: apiKey.length > 0, value: apiKey ? '已输入' : '未输入', length: apiKey.length }
    };

    const isValid = validation.theme.valid && validation.title.valid && validation.apiKey.valid && !this.isGenerating;

    // 调试日志
    console.log('表单验证状态:', validation, '最终结果:', isValid);

    this.elements.generateBtn.disabled = !isValid;

    // 更新按钮文本以提供反馈
    if (!isValid) {
      const reasons = [];
      if (!validation.theme.valid) reasons.push('选择主题');
      if (!validation.title.valid) reasons.push('输入标题');
      if (!validation.apiKey.valid) reasons.push('输入API密钥');

      const btnText = this.elements.generateBtn.querySelector('.btn-text');
      const btnIcon = this.elements.generateBtn.querySelector('.btn-icon');

      if (btnText && btnIcon) {
        btnText.textContent = `请${reasons.join('、')}`;
        btnIcon.textContent = '⚠️';
      }
    } else {
      const btnText = this.elements.generateBtn.querySelector('.btn-text');
      const btnIcon = this.elements.generateBtn.querySelector('.btn-icon');

      if (btnText && btnIcon) {
        btnText.textContent = '开始生成魔法图片';
        btnIcon.textContent = '🪄';
      }
    }
  }

  /**
   * Handle image generation
   */
  async handleGenerate() {
    if (this.isGenerating) return;

    const title = this.elements.titleInput.value.trim();
    const apiKey = this.elements.apiKeyInput.value.trim();

    if (!this.selectedTheme || !title || !apiKey) {
      this.showToast('请填写所有必填项', 'warning');
      return;
    }

    // Check network connection
    if (!Utils.checkInternetConnection()) {
      this.showToast('网络连接已断开，请检查网络后重试', 'error');
      return;
    }

    // Validate inputs
    const titleValidation = Utils.validateChineseText(title, 1, 30);
    if (!titleValidation.valid) {
      this.showToast(titleValidation.message, 'warning');
      return;
    }

    const apiValidation = Utils.validateApiKey(apiKey);
    if (!apiValidation.valid) {
      this.showToast(apiValidation.message, 'warning');
      return;
    }

    // Wait for themes data to load
    if (!this.themesData) {
      this.showToast('主题数据正在加载中，请稍候...', 'warning');
      // Wait for themes to load (with timeout)
      let attempts = 0;
      const maxAttempts = 10;
      while (!this.themesData && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      if (!this.themesData) {
        this.showToast('主题数据加载失败，请刷新页面重试', 'error');
        return;
      }
    }

    // Check if selected theme exists
    if (!this.themesData[this.selectedTheme]) {
      this.showToast(`主题 "${this.selectedTheme}" 不存在，请重新选择主题`, 'error');
      console.error('❌ 主题不存在:', this.selectedTheme);
      console.error('❌ 可用主题:', Object.keys(this.themesData));
      return;
    }

    this.isGenerating = true;
    this.updateGenerateButton(true);

    try {
      console.log('🎨 开始生成图片...');
      console.log('主题:', this.selectedTheme);
      console.log('标题:', title);

      // Get theme vocabulary
      const theme = this.themesData[this.selectedTheme];
      console.log('主题词汇:', theme.vocabulary);

      // Build prompt
      const prompt = window.imageGenerator.buildPrompt(this.selectedTheme, title, theme.vocabulary, theme);
      console.log('生成的提示词长度:', prompt.length);

      // Show progress
      this.showProgressModal();

      // Generate image
      const result = await window.imageGenerator.generateImage(apiKey, prompt, {}, (progress) => {
        this.updateProgress(progress);
      });

      if (result.success) {
        console.log('✅ 原始图片生成成功:', result);

        // 由于跨域限制，暂时不进行图片处理
        console.log('📝 跳过图片处理，直接显示原始图片');
        this.displayResult(result, title, this.selectedTheme);
        Utils.createConfetti();
        this.showToast('图片生成成功！', 'success');
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ 图片生成失败:', error);

      // 提供更具体的错误处理
      let errorMessage = error.message;

      if (error.message.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络连接';
      } else if (error.message.includes('API密钥')) {
        errorMessage = 'API密钥无效，请检查密钥是否正确';
      } else if (error.message.includes('余额')) {
        errorMessage = '账户余额不足，请充值后重试';
      } else if (error.message.includes('频率')) {
        errorMessage = '请求过于频繁，请稍后重试';
      }

      this.showToast(`生成失败：${errorMessage}`, 'error');

      // 显示调试建议
      setTimeout(() => {
        this.showToast('💡 提示：可以打开 api-test.html 进行详细测试', 'info');
      }, 3000);

    } finally {
      this.isGenerating = false;
      this.updateGenerateButton(false);
      this.hideProgressModal();
    }
  }

  /**
   * Update generate button state
   * @param {boolean} isGenerating - Whether currently generating
   */
  updateGenerateButton(isGenerating) {
    const btn = this.elements.generateBtn;
    const btnText = btn.querySelector('.btn-text');
    const btnIcon = btn.querySelector('.btn-icon');

    if (isGenerating) {
      btn.disabled = true;
      btnText.textContent = 'AI正在绘制中...';
      btnIcon.textContent = '⏳';
      btn.classList.add('generating');
    } else {
      btn.disabled = false;
      btnText.textContent = '开始生成魔法图片';
      btnIcon.textContent = '🪄';
      btn.classList.remove('generating');
      this.validateForm();
    }
  }

  /**
   * Display generated result
   * @param {Object} result - Generation result
   * @param {string} title - Image title
   * @param {string} theme - Image theme
   */
  displayResult(result, title, theme) {
    console.log('🎨 开始显示结果');
    console.log('📊 生成结果:', result);
    console.log('📝 标题:', title);
    console.log('🎯 主题:', theme);

    // Store current result data
    this.currentResult = {
      ...result,
      title: title,
      theme: theme,
      themeName: this.themesData && this.themesData[theme] ? this.themesData[theme].name : theme
    };

    console.log('✅ 当前结果已保存:', this.currentResult);

    const resultSection = this.elements.resultSection;
    const resultImage = this.elements.resultImage;

    // 检查元素是否存在
    if (!resultSection || !resultImage) {
      console.error('❌ 关键元素缺失，尝试动态查找...');
      resultSection = resultSection || document.getElementById('resultSection');
      resultImage = resultImage || document.getElementById('resultImage');

      if (!resultSection || !resultImage) {
        console.error('❌ 最终仍缺少关键元素');
        this.showToast('页面元素加载失败，请刷新页面', 'error');
        return;
      }
    }

    // Display image
    const imageUrl = result.imageUrl;
    console.log('🖼️ 图片URL:', imageUrl);

    if (!imageUrl) {
      console.error('❌ 图片URL为空');
      this.showToast('图片URL无效', 'error');
      return;
    }

    resultImage.src = imageUrl;
    resultImage.onload = () => {
      console.log('✅ 图片加载成功');

      // 图片加载成功后，创建词汇显示
      this.createVocabularyDisplay();

      resultSection.classList.remove('hidden');
      Utils.scrollToElement(resultSection, 100);
    };

    resultImage.onerror = (error) => {
      console.error('❌ 图片加载失败:', error);
      this.showToast('图片加载失败', 'error');
    };
  }

  /**
   * Create vocabulary display
   */
  createVocabularyDisplay() {
    console.log('🔄 创建词汇显示，当前结果:', this.currentResult);
    console.log('🔄 主题数据:', this.themesData);

    if (!this.currentResult) {
      console.error('❌ currentResult 未定义');
      return;
    }

    if (!this.currentResult.theme) {
      console.error('❌ currentResult.theme 未定义');
      return;
    }

    if (!this.themesData || !this.themesData[this.currentResult.theme]) {
      console.error('❌ 主题数据不存在:', this.currentResult.theme);
      return;
    }

    const theme = this.themesData[this.currentResult.theme];
    const vocabulary = theme.vocabulary;

    console.log('✅ 开始创建词汇显示');

    // Remove existing vocabulary display
    const existingVocab = document.querySelector('.vocabulary-display');
    if (existingVocab) {
      existingVocab.remove();
    }

    // Create vocabulary section
    const vocabSection = document.createElement('div');
    vocabSection.className = 'vocabulary-display';
    vocabSection.innerHTML = `
      <h3 style="color: #9B59B6; margin: 20px 0; font-family: 'Comic Neue', 'Noto Sans SC', cursive; font-size: 1.5rem;">
        📚 ${this.currentResult.title || ''} - 词汇表
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
        ${this.createVocabularyCards(vocabulary)}
      </div>
      <p style="color: #666; font-style: italic; margin-top: 15px;">
        💡 提示：可以将上面的图片和词汇表一起使用来学习中文汉字
      </p>
    `;

    // Insert vocabulary section
    const resultSection = this.elements.resultSection;
    const generateAnotherBtn = document.getElementById('generateAnotherBtn');

    if (resultSection && generateAnotherBtn) {
      resultSection.insertBefore(vocabSection, generateAnotherBtn);
      console.log('✅ 词汇显示创建完成');
    } else {
      console.error('❌ 找不到结果区域或按钮元素');
    }
  }

  /**
   * Create vocabulary cards HTML
   * @param {Object} vocabulary - Vocabulary data
   * @returns {string} HTML string
   */
  createVocabularyCards(vocabulary) {
    console.log('🔄 创建词汇卡片，词汇数据:', vocabulary);

    if (!vocabulary) {
      console.error('❌ 词汇数据为空');
      return '<div>暂无词汇数据</div>';
    }

    const allItems = [
      ...(vocabulary.core || []),
      ...(vocabulary.items || []),
      ...(vocabulary.environment || [])
    ];

    console.log('📝 所有词汇项目:', allItems);

    if (allItems.length === 0) {
      return '<div>暂无词汇项目</div>';
    }

    return allItems.map((item, index) => {
      if (!item || !item.pinyin || !item.chinese) {
        console.warn('⚠️ 词汇项目不完整:', item);
        return '';
      }

      return `
      <div style="
        background: linear-gradient(135deg, #FFE66D, #FFF);
        border: 2px solid #4A90E2;
        border-radius: 15px;
        padding: 15px;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
      "
      onmouseover="this.style.transform='translateY(-5px)'"
      onmouseout="this.style.transform='translateY(0)'"
      >
        <div style="font-size: 14px; color: #666; margin-bottom: 5px; font-family: 'Comic Neue', cursive;">
          ${item.pinyin}
        </div>
        <div style="font-size: 20px; font-weight: bold; color: #333; font-family: 'Noto Sans SC', sans-serif;">
          ${item.chinese}
        </div>
      </div>
    `;
    }).filter(Boolean).join('');
  }

  /**
   * Download current image
   */
  downloadCurrentImage() {
    if (!this.currentResult) {
      this.showToast('没有可下载的图片', 'warning');
      return;
    }

    const filename = `识字图片_${this.currentResult.title}_${Date.now()}.png`;
    const imageUrl = this.currentResult.processedImage || this.currentResult.imageUrl;
    Utils.downloadImage(imageUrl, filename);
    this.showToast('图片下载中...', 'success');
  }

  /**
   * Save current image to history
   */
  saveCurrentToHistory() {
    if (!this.currentResult) {
      this.showToast('没有可保存的图片', 'warning');
      return;
    }

    const historyItem = {
      title: this.currentResult.title,
      theme: this.currentResult.theme,
      themeName: this.currentResult.themeName,
      imageUrl: this.currentResult.processedImage || this.currentResult.imageUrl,
      generationTime: this.currentResult.generationTime,
      timestamp: this.currentResult.timestamp,
      hasChineseLabels: !!this.currentResult.processedImage
    };

    const success = storageManager.addToHistory(historyItem);
    if (success) {
      this.showToast('已保存到历史记录', 'success');
    } else {
      this.showToast('保存失败，请重试', 'error');
    }
  }

  /**
   * Reset form for new generation
   */
  resetForm() {
    this.elements.resultSection.classList.add('hidden');
    this.elements.titleInput.value = '';
    this.elements.titleCounter.textContent = '0/30';
    this.selectedTheme = null;
    this.elements.themeGrid.querySelectorAll('.theme-card').forEach(card => {
      card.classList.remove('selected');
    });
    this.validateForm();
    Utils.scrollToElement(document.querySelector('.generate-form'), 100);
  }

  /**
   * Load and display history
   */
  loadHistory() {
    const history = storageManager.getHistory();
    const historyGrid = this.elements.historyGrid;
    const emptyHistory = this.elements.emptyHistory;

    historyGrid.innerHTML = '';

    if (history.length === 0) {
      emptyHistory.style.display = 'block';
      historyGrid.style.display = 'none';
      return;
    }

    emptyHistory.style.display = 'none';
    historyGrid.style.display = 'grid';

    // Sort by timestamp (newest first)
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

    sortedHistory.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.title}" class="history-item-image" loading="lazy">
        <div class="history-item-info">
          <h4 class="history-item-title">${Utils.sanitizeHTML(item.title)}</h4>
          <p class="history-item-date">${Utils.formatDate(item.timestamp)}</p>
          <p class="history-item-theme">${item.themeName || item.theme}</p>
        </div>
      `;

      historyItem.addEventListener('click', () => {
        this.showHistoryItemModal(item);
      });

      historyGrid.appendChild(historyItem);
    });
  }

  /**
   * Show modal for history item
   * @param {Object} item - History item
   */
  showHistoryItemModal(item) {
    const modal = this.createModal({
      title: item.title,
      content: `
        <div style="text-align: center;">
          <img src="${item.imageUrl}" alt="${item.title}" style="max-width: 100%; border-radius: 10px; margin-bottom: 20px;">
          <p><strong>主题：</strong>${item.themeName || item.theme}</p>
          <p><strong>生成时间：</strong>${Utils.formatFullDate(item.timestamp)}</p>
          ${item.generationTime ? `<p><strong>生成耗时：</strong>${Math.round(item.generationTime / 1000)}秒</p>` : ''}
        </div>
      `,
      buttons: [
        {
          text: '下载',
          icon: '💾',
          class: 'magic-btn',
          action: () => {
            const filename = `识字图片_${item.title}_${item.timestamp}.png`;
            Utils.downloadImage(item.imageUrl, filename);
            this.showToast('图片下载中...', 'success');
          }
        },
        {
          text: '删除',
          icon: '🗑️',
          class: 'secondary-btn',
          action: () => {
            this.confirmDeleteHistoryItem(item.id);
          }
        },
        {
          text: '关闭',
          icon: '❌',
          class: 'secondary-btn',
          action: null
        }
      ]
    });

    this.showModal(modal);
  }

  /**
   * Confirm delete history item
   * @param {string} itemId - Item ID to delete
   */
  confirmDeleteHistoryItem(itemId) {
    const modal = this.createModal({
      title: '确认删除',
      content: '确定要删除这张识字图片吗？此操作无法撤销。',
      buttons: [
        {
          text: '取消',
          icon: '❌',
          class: 'secondary-btn',
          action: null
        },
        {
          text: '删除',
          icon: '🗑️',
          class: 'secondary-btn',
          action: () => {
            const success = storageManager.removeFromHistory(itemId);
            if (success) {
              this.showToast('图片已删除', 'success');
              this.loadHistory(); // Refresh history
            } else {
              this.showToast('删除失败，请重试', 'error');
            }
            this.hideModal();
          }
        }
      ]
    });

    this.showModal(modal);
  }

  /**
   * Confirm clear all history
   */
  confirmClearHistory() {
    const modal = this.createModal({
      title: '清空历史记录',
      content: '确定要清空所有历史记录吗？此操作无法撤销。',
      buttons: [
        {
          text: '取消',
          icon: '❌',
          class: 'secondary-btn',
          action: null
        },
        {
          text: '清空',
          icon: '🗑️',
          class: 'secondary-btn',
          action: () => {
            const success = storageManager.clearHistory();
            if (success) {
              this.showToast('历史记录已清空', 'success');
              this.loadHistory(); // Refresh history
            } else {
              this.showToast('清空失败，请重试', 'error');
            }
            this.hideModal();
          }
        }
      ]
    });

    this.showModal(modal);
  }

  /**
   * Export history data
   */
  exportHistory() {
    const data = storageManager.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `识字图片历史记录_${Utils.formatFullDate(Date.now()).replace(/[\/\s:]/g, '_')}.json`;

    Utils.downloadImage(url, filename);
    URL.revokeObjectURL(url);

    this.showToast('历史记录导出成功', 'success');
  }

  /**
   * Show progress modal
   */
  showProgressModal() {
    const progressHtml = `
      <div class="progress-container">
        <div class="progress-content">
          <div class="progress-icon">🪄</div>
          <h3 class="progress-title">AI正在绘制魔法图片</h3>
          <p class="progress-message" id="progressMessage">正在创建生成任务...</p>
          <div class="progress-bar-container">
            <div class="progress-bar" id="progressBar" style="width: 0%"></div>
          </div>
          <div class="progress-steps">
            <div class="progress-step active"></div>
            <div class="progress-step"></div>
            <div class="progress-step"></div>
          </div>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      ${progressHtml}
    `;

    document.body.appendChild(modal);
  }

  /**
   * Update progress modal
   * @param {Object} progress - Progress data
   */
  updateProgress(progress) {
    const messageElement = document.getElementById('progressMessage');
    const barElement = document.getElementById('progressBar');
    const steps = document.querySelectorAll('.progress-step');

    if (messageElement) {
      messageElement.textContent = progress.message || '处理中...';
    }

    if (barElement && progress.status) {
      const progressMap = {
        'creating': 20,
        'waiting': 40,
        'running': 60,
        'processing': 80,
        'success': 100
      };

      const width = progressMap[progress.status] || 0;
      barElement.style.width = `${width}%`;
    }

    // Update steps
    const stepMap = {
      'creating': 0,
      'waiting': 1,
      'running': 1,
      'processing': 2,
      'success': 2
    };

    const activeStep = stepMap[progress.status] || 0;
    steps.forEach((step, index) => {
      step.classList.toggle('active', index <= activeStep);
      step.classList.toggle('completed', index < activeStep);
    });
  }

  /**
   * Hide progress modal
   */
  hideProgressModal() {
    const modal = document.querySelector('.modal .progress-container');
    if (modal) {
      const modalElement = modal.closest('.modal');
      if (modalElement) {
        modalElement.remove();
      }
    }
  }

  /**
   * Create modal element
   * @param {Object} options - Modal options
   * @returns {Object} Modal element
   */
  createModal(options) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const buttonsHtml = options.buttons ? options.buttons.map(btn => `
      <button class="${btn.class}" data-action="${btn.action ? 'true' : 'false'}">
        <span class="btn-icon">${btn.icon}</span>
        <span>${btn.text}</span>
      </button>
    `).join('') : '';

    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            ${options.title}
          </h3>
          <button class="modal-close" data-action="false">❌</button>
        </div>
        <div class="modal-body">
          ${options.content}
        </div>
        ${buttonsHtml ? `<div class="modal-footer">${buttonsHtml}</div>` : ''}
      </div>
    `;

    // Add event listeners
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const shouldClose = btn.dataset.action === 'false';
        const action = options.buttons?.find(b => b.text === btn.textContent.trim())?.action;

        if (action) {
          action();
        } else if (shouldClose) {
          this.hideModal();
        }
      });
    });

    return modal;
  }

  /**
   * Show modal
   * @param {HTMLElement} modal - Modal element
   */
  showModal(modal) {
    const container = this.elements.modalContainer;
    container.innerHTML = '';
    container.appendChild(modal);
    container.classList.remove('hidden');

    // Add backdrop click handler
    const backdrop = modal.querySelector('.modal-backdrop');
    backdrop.addEventListener('click', () => {
      this.hideModal();
    });

    // Trigger animation
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  /**
   * Hide modal
   */
  hideModal() {
    const container = this.elements.modalContainer;
    const modal = container.querySelector('.modal');

    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        container.innerHTML = '';
        container.classList.add('hidden');
      }, 300);
    }
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
   */
  showToast(message, type = 'info') {
    const container = this.elements.toastContainer;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${Utils.sanitizeHTML(message)}</span>
      <button class="toast-close">❌</button>
    `;

    // Add close handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.hideToast(toast);
    });

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto hide after 5 seconds
    setTimeout(() => {
      this.hideToast(toast);
    }, 5000);
  }

  /**
   * Hide toast notification
   * @param {HTMLElement} toast - Toast element
   */
  hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (this.currentPage === 'generate' && !this.elements.generateBtn.disabled) {
        e.preventDefault();
        this.handleGenerate();
      }
    }

    // Escape to close modals
    if (e.key === 'Escape') {
      this.hideModal();
    }

    // Ctrl/Cmd + S to save current image
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      if (this.currentResult) {
        e.preventDefault();
        this.saveCurrentToHistory();
      }
    }
  }

  /**
   * Handle connection status change
   * @param {boolean} isOnline - Whether online
   */
  handleConnectionChange(isOnline) {
    if (!isOnline) {
      this.showToast('网络连接已断开', 'warning');
    } else {
      this.showToast('网络连接已恢复', 'success');
    }
  }

  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    const loadingScreen = this.elements.loadingScreen;
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          if (loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
          }
        }, 500);
      }, 1000);
    }
  }

  /**
   * Load saved API key and preferences
   */
  loadSavedData() {
    // Load API key
    const savedApiKey = storageManager?.getApiKey();
    if (savedApiKey) {
      this.elements.apiKeyInput.value = savedApiKey;
      console.log('已加载保存的API密钥');
    }

    // Load preferences
    const preferences = storageManager?.getPreferences();
    if (preferences) {
      console.log('已加载用户偏好设置');
      // Apply preferences as needed
    }

    // 初始验证状态
    this.validateForm();
  }
}

// Create singleton instance
window.uiManager = new UIManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}