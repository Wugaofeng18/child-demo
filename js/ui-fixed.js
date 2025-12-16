/**
 * Fixed UI Manager - Simple and Direct Approach
 */

class UIManagerFixed {
  constructor() {
    this.currentPage = 'generate';
    this.selectedTheme = null;
    this.isGenerating = false;
    this.themesData = null;

    // 等待DOM加载
    this.waitForDOM();
  }

  async waitForDOM() {
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    // 额外延迟确保DOM完全加载
    await new Promise(resolve => setTimeout(resolve, 100));

    this.init();
  }

  init() {
    console.log('🎨 UI Manager 初始化开始');
    try {
      this.cacheElements();
      console.log('✅ 元素缓存完成');

      this.bindEvents();
      console.log('✅ 事件绑定完成');

      this.loadThemes();
      console.log('✅ 主题加载完成');

      this.hideLoadingScreen();
      console.log('✅ UI Manager 初始化完成');
    } catch (error) {
      console.error('❌ UI Manager 初始化失败:', error);
      alert('页面初始化失败，请刷新页面');
    }
  }

  cacheElements() {
    // 直接查找所有需要的元素
    this.elements = {
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

    // 验证关键元素
    const criticalElements = ['themeGrid', 'generateBtn', 'resultSection', 'resultImage'];
    const missing = criticalElements.filter(name => !this.elements[name]);

    if (missing.length > 0) {
      console.warn('⚠️ 缺少关键元素:', missing);
    } else {
      console.log('✅ 所有关键元素都已找到');
    }

    console.log('📋 缓存的元素数量:', Object.keys(this.elements).filter(key => this.elements[key]).length);
  }

  bindEvents() {
    // Navigation
    this.elements.navButtons?.forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        this.switchPage(page);
      });
    });

    // Theme selection
    this.elements.themeGrid?.addEventListener('click', (e) => {
      const themeCard = e.target.closest('.theme-card');
      if (themeCard) {
        this.selectTheme(themeCard.dataset.theme);
      }
    });

    // Title input
    this.elements.titleInput?.addEventListener('input', (e) => {
      this.updateTitleCounter(e.target.value);
      this.validateForm();
    });

    // API key input
    this.elements.apiKeyInput?.addEventListener('input', () => {
      this.validateForm();
    });

    // Toggle API key visibility
    this.elements.toggleApiKey?.addEventListener('click', () => {
      this.toggleApiKeyVisibility();
    });

    // Suggestion buttons
    this.elements.suggestionButtons?.forEach(btn => {
      btn.addEventListener('click', () => {
        const suggestion = btn.dataset.suggestion;
        this.elements.titleInput.value = suggestion;
        this.updateTitleCounter(suggestion);
        this.validateForm();
      });
    });

    // Generate button
    this.elements.generateBtn?.addEventListener('click', () => {
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
      if (e.key === 'Escape') {
        this.hideAllModals();
      }
    });
  }

  async loadThemes() {
    try {
      console.log('🔄 开始加载主题数据...');
      const response = await fetch('data/themes.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.themes) {
        throw new Error('主题数据格式错误');
      }

      this.themesData = data.themes;
      console.log('✅ 主题数据加载成功:', Object.keys(this.themesData));

      this.renderThemes();
      console.log('✅ 主题渲染完成');

    } catch (error) {
      console.error('❌ 主题数据加载失败:', error);

      // 使用默认主题数据
      this.themesData = this.getDefaultThemes();
      console.log('🔄 使用默认主题数据');
      this.renderThemes();

      this.showToast('主题数据加载失败，使用默认主题', 'warning');
    }
  }

  getDefaultThemes() {
    return {
      "supermarket": {
        "name": "超市",
        "icon": "🛒",
        "description": "Supermarket shopping experience",
        "vocabulary": {
          "core": [
            {"chinese": "收银员", "pinyin": "shōu yín yuán"},
            {"chinese": "货架", "pinyin": "huò jià"},
            {"chinese": "购物车", "pinyin": "gòu wù chē"},
            {"chinese": "收银台", "pinyin": "shōu yín tái"},
            {"chinese": "入口", "pinyin": "rù kǒu"}
          ],
          "items": [
            {"chinese": "苹果", "pinyin": "píng guǒ"},
            {"chinese": "牛奶", "pinyin": "niú nǎi"},
            {"chinese": "面包", "pinyin": "miàn bāo"},
            {"chinese": "鸡蛋", "pinyin": "jī dàn"},
            {"chinese": "香蕉", "pinyin": "xiāng jiāo"}
          ],
          "environment": [
            {"chinese": "出口", "pinyin": "chū kǒu"},
            {"chinese": "灯", "pinyin": "dēng"},
            {"chinese": "墙", "pinyin": "qiáng"}
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
            {"chinese": "草地", "pinyin": "cǎo dì"},
            {"chinese": "长椅", "pinyin": "cháng yǐ"},
            {"chinese": "小路", "pinyin": "xiǎo lù"}
          ],
          "items": [
            {"chinese": "秋千", "pinyin": "qiū qiān"},
            {"chinese": "滑梯", "pinyin": "huá tī"},
            {"chinese": "跷跷板", "pinyin": "qiāo qiāo bǎn"},
            {"chinese": "沙坑", "pinyin": "shā kēng"},
            {"chinese": "喷泉", "pinyin": "pēn quán"}
          ],
          "environment": [
            {"chinese": "湖泊", "pinyin": "hú pō"},
            {"chinese": "小桥", "pinyin": "xiǎo qiáo"}
          ]
        }
      }
    };
  }

  renderThemes() {
    if (!this.elements.themeGrid) return;

    const themeGrid = this.elements.themeGrid;
    themeGrid.innerHTML = '';

    Object.entries(this.themesData).forEach(([key, theme]) => {
      const themeCard = document.createElement('div');
      themeCard.className = 'theme-card';
      themeCard.dataset.theme = key;

      themeCard.innerHTML = `
        <div class="theme-icon">${theme.icon}</div>
        <div class="theme-name">${theme.name}</div>
      `;

      themeGrid.appendChild(themeCard);
    });
  }

  switchPage(page) {
    // Update navigation
    this.elements.navButtons?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Update pages
    this.elements.pages?.forEach(pageElement => {
      pageElement.classList.toggle('active', pageElement.id === `${page}Page`);
    });

    this.currentPage = page;

    // Load page-specific data
    if (page === 'history') {
      this.loadHistory();
    }
  }

  selectTheme(themeKey) {
    if (!this.elements.themeGrid) return;

    console.log('🎯 选择主题:', themeKey);
    console.log('📚 可用主题:', Object.keys(this.themesData || {}));

    // 验证主题
    if (!this.themesData || !this.themesData[themeKey]) {
      console.warn('⚠️ 主题不存在:', themeKey);
      this.showToast(`主题 "${themeKey}" 不存在`, 'error');
      return;
    }

    // 更新UI
    this.elements.themeGrid.querySelectorAll('.theme-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.theme === themeKey);
    });

    this.selectedTheme = themeKey;
    console.log('✅ 主题选择成功:', themeKey, '-', this.themesData[themeKey].name);
    this.validateForm();
  }

  updateTitleCounter(value) {
    if (!this.elements.titleCounter) return;

    const length = value.length;
    this.elements.titleCounter.textContent = `${length}/30`;
    this.elements.titleCounter.style.color = length > 25 ? '#dc3545' : '#666';
  }

  toggleApiKeyVisibility() {
    if (!this.elements.apiKeyInput) return;

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

  validateForm() {
    const title = this.elements.titleInput?.value?.trim() || '';
    const apiKey = this.elements.apiKeyInput?.value?.trim() || '';
    const isValid = this.selectedTheme && title.length > 0 && apiKey.length > 0;

    if (this.elements.generateBtn) {
      this.elements.generateBtn.disabled = !isValid || this.isGenerating;
    }

    // 更新按钮文本
    if (this.elements.generateBtn) {
      const btnText = this.elements.generateBtn.querySelector('.btn-text');
      const btnIcon = this.elements.generateBtn.querySelector('.btn-icon');

      if (btnText && btnIcon) {
        if (!isValid) {
          const reasons = [];
          if (!this.selectedTheme) reasons.push('选择主题');
          if (!title) reasons.push('输入标题');
          if (!apiKey) reasons.push('输入API密钥');

          btnText.textContent = `请${reasons.join('、')}`;
          btnIcon.textContent = '⚠️';
        } else {
          btnText.textContent = '开始生成魔法图片';
          btnIcon.textContent = '🪄';
        }
      }
    }
  }

  async handleGenerate() {
    if (this.isGenerating) return;

    const title = this.elements.titleInput?.value?.trim() || '';
    const apiKey = this.elements.apiKeyInput?.value?.trim() || '';

    if (!this.selectedTheme || !title || !apiKey) {
      this.showToast('请填写所有必填项', 'warning');
      return;
    }

    // 验证
    const titleValidation = Utils?.validateChineseText?.(title, 1, 30);
    if (titleValidation && !titleValidation.valid) {
      this.showToast(titleValidation.message, 'warning');
      return;
    }

    // 等待主题数据
    if (!this.themesData) {
      this.showToast('主题数据正在加载中，请稍候...', 'warning');
      let attempts = 0;
      while (!this.themesData && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      if (!this.themesData) {
        this.showToast('主题数据加载失败，请刷新页面', 'error');
        return;
      }
    }

    // 验证主题
    if (!this.themesData[this.selectedTheme]) {
      this.showToast(`主题 "${this.selectedTheme}" 不存在，请重新选择`, 'error');
      return;
    }

    this.isGenerating = true;
    this.updateGenerateButton(true);

    try {
      console.log('🎨 开始生成图片...');
      console.log('主题:', this.selectedTheme);
      console.log('标题:', title);

      const theme = this.themesData[this.selectedTheme];

      // 构建提示词 - 使用测试工具中验证过的格式
      const prompt = `一张中国儿童识字海报：标题《${title}》，主题：${theme.name}

适合5-9岁儿童学习中文汉字的教育插图。

要求：
- 风格：简洁明快的卡通插画，儿童绘本风格
- 格式：竖版海报
- 语言：纯中文，包含拼音标注

必须包含的词汇：
${theme.vocabulary.core.slice(0, 5).map(item => `${item.chinese}(${item.pinyin})`).join('、')}
${theme.vocabulary.items.slice(0, 5).map(item => `${item.chinese}(${item.pinyin})`).join('、')}

每个物品都要有中文标签：
第一行：拼音
第二行：汉字

色彩明亮，教育风格，清晰标注，适合教室使用。`;

      console.log('生成的提示词长度:', prompt.length);

      // 显示进度
      this.showProgressModal();

      // 生成图片
      const result = await window.imageGenerator.generateImage(apiKey, prompt, {}, (progress) => {
        this.updateProgress(progress);
      });

      if (result.success) {
        console.log('✅ 图片生成成功:', result);
        this.displayResult(result, title, this.selectedTheme);
        Utils?.createConfetti?.();
        this.showToast('图片生成成功！', 'success');
      } else {
        throw new Error(result.error || '生成失败');
      }

    } catch (error) {
      console.error('❌ 图片生成失败:', error);
      this.showToast(`生成失败：${error.message}`, 'error');
    } finally {
      this.isGenerating = false;
      this.updateGenerateButton(false);
      this.hideProgressModal();
    }
  }

  updateGenerateButton(isGenerating) {
    if (!this.elements.generateBtn) return;

    const btn = this.elements.generateBtn;
    const btnText = btn.querySelector('.btn-text');
    const btnIcon = btn.querySelector('.btn-icon');

    if (btnText && btnIcon) {
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
  }

  displayResult(result, title, theme) {
    console.log('🎨 开始显示结果');
    console.log('📊 生成结果:', result);
    console.log('📝 标题:', title);
    console.log('🎯 主题:', theme);

    // 存储当前结果
    this.currentResult = {
      ...result,
      title: title,
      theme: theme,
      themeName: this.themesData[theme]?.name || theme
    };

    // 创建词汇显示
    this.createVocabularyDisplay();

    // 显示图片
    const resultSection = this.elements.resultSection;
    const resultImage = this.elements.resultImage;

    if (!resultSection || !resultImage) {
      console.error('❌ 结果区域元素缺失');
      this.showToast('页面元素缺失，请刷新页面', 'error');
      return;
    }

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
      resultSection.classList.remove('hidden');
      Utils?.scrollToElement?.(resultSection, 100);
    };

    resultImage.onerror = (error) => {
      console.error('❌ 图片加载失败:', error);
      this.showToast('图片加载失败', 'error');
    };
  }

  createVocabularyDisplay() {
    if (!this.currentResult || !this.themesData[this.currentResult.theme]) {
      console.error('❌ 无法创建词汇显示：数据不完整');
      return;
    }

    const theme = this.themesData[this.currentResult.theme];
    const vocabulary = theme.vocabulary;

    // 移除现有的词汇显示
    const existingVocab = document.querySelector('.vocabulary-display');
    if (existingVocab) {
      existingVocab.remove();
    }

    // 创建词汇显示
    const vocabSection = document.createElement('div');
    vocabSection.className = 'vocabulary-display';
    vocabSection.innerHTML = `
      <h3 style="color: #9B59B6; margin: 20px 0; font-size: 1.5rem;">
        📚 ${this.currentResult.title} - 词汇表
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
        ${this.createVocabularyCards(vocabulary)}
      </div>
      <p style="color: #666; font-style: italic; margin-top: 15px;">
        💡 提示：可以将上面的图片和词汇表一起使用来学习中文汉字
      </p>
    `;

    // 在结果区域中添加词汇显示
    const resultSection = this.elements.resultSection;
    const generateAnotherBtn = document.getElementById('generateAnotherBtn');
    if (resultSection && generateAnotherBtn) {
      resultSection.insertBefore(vocabSection, generateAnotherBtn);
    }
  }

  createVocabularyCards(vocabulary) {
    if (!vocabulary) {
      return '<div>暂无词汇数据</div>';
    }

    const allItems = [
      ...(vocabulary.core || []),
      ...(vocabulary.items || []),
      ...(vocabulary.environment || [])
    ];

    return allItems.map(item => {
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
        cursor: pointer;
      "
      onmouseover="this.style.transform='translateY(-5px)'"
      onmouseout="this.style.transform='translateY(0)'"
      >
        <div style="font-size: 14px; color: #666; margin-bottom: 5px; font-family: Arial, sans-serif;">
          ${item.pinyin}
        </div>
        <div style="font-size: 20px; font-weight: bold; color: #333; font-family: 'Microsoft YaHei', sans-serif;">
          ${item.chinese}
        </div>
      </div>
    `;
    }).filter(Boolean).join('');
  }

  downloadCurrentImage() {
    if (!this.currentResult || !this.currentResult.imageUrl) {
      this.showToast('没有可下载的图片', 'warning');
      return;
    }

    const filename = `识字图片_${this.currentResult.title}_${Date.now()}.png`;
    const imageUrl = this.currentResult.imageUrl;

    Utils?.downloadImage?.(imageUrl, filename);
    this.showToast('图片下载中...', 'success');
  }

  saveCurrentToHistory() {
    if (!this.currentResult || !window.storageManager) {
      this.showToast('没有可保存的图片', 'warning');
      return;
    }

    const historyItem = {
      title: this.currentResult.title,
      theme: this.currentResult.theme,
      themeName: this.currentResult.themeName,
      imageUrl: this.currentResult.imageUrl,
      generationTime: this.currentResult.generationTime,
      timestamp: this.currentResult.timestamp
    };

    const success = window.storageManager.addToHistory(historyItem);
    if (success) {
      this.showToast('已保存到历史记录', 'success');
    } else {
      this.showToast('保存失败，请重试', 'error');
    }
  }

  resetForm() {
    if (this.elements.resultSection) {
      this.elements.resultSection.classList.add('hidden');
    }

    if (this.elements.titleInput) {
      this.elements.titleInput.value = '';
    }

    if (this.elements.titleCounter) {
      this.elements.titleCounter.textContent = '0/30';
    }

    this.selectedTheme = null;
    this.elements.themeGrid?.querySelectorAll('.theme-card').forEach(card => {
      card.classList.remove('selected');
    });

    this.validateForm();
    Utils?.scrollToElement?.(document.querySelector('.generate-form'), 100);
  }

  async loadHistory() {
    if (!window.storageManager) return;

    const history = window.storageManager.getHistory();
    const historyGrid = this.elements.historyGrid;
    const emptyHistory = this.elements.emptyHistory;

    if (!historyGrid || !emptyHistory) return;

    if (history.length === 0) {
      emptyHistory.style.display = 'block';
      historyGrid.style.display = 'none';
      return;
    }

    emptyHistory.style.display = 'none';
    historyGrid.style.display = 'grid';

    historyGrid.innerHTML = '';

    // 显示历史记录
    history.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.style.cssText = `
        background: white;
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
      `;

      historyItem.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.title}" style="max-width: 100%; border-radius: 5px;">
        <div style="margin-top: 10px;">
          <h4 style="margin: 0; color: #333;">${item.title}</h4>
          <p style="margin: 0; color: #666; font-size: 14px;">${Utils.formatDate?.(item.timestamp) || item.timestamp}</p>
        </div>
      `;

      historyItem.addEventListener('click', () => {
        this.showHistoryItemModal(item);
      });

      historyGrid.appendChild(historyItem);
    });
  }

  showHistoryItemModal(item) {
    const modal = this.createModal({
      title: item.title,
      content: `
        <div style="text-align: center;">
          <img src="${item.imageUrl}" alt="${item.title}" style="max-width: 100%; border-radius: 10px; margin-bottom: 20px;">
          <p><strong>主题：</strong>${item.themeName || item.theme}</p>
          <p><strong>生成时间：</strong>${Utils.formatFullDate?.(item.timestamp) || item.timestamp}</p>
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
            if (window.storageManager) {
              const success = window.storageManager.removeFromHistory(item.id);
              if (success) {
                this.showToast('图片已删除', 'success');
                this.loadHistory(); // Refresh history
              } else {
                this.showToast('删除失败，请重试', 'error');
              }
            }
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
            if (window.storageManager) {
              const success = window.storageManager.removeFromHistory(itemId);
              if (success) {
                this.showToast('图片已删除', 'success');
                this.loadHistory(); // Refresh history
              } else {
                this.showToast('删除失败，请重试', 'error');
              }
            }
          }
        }
      ]
    });

    this.showModal(modal);
  }

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
            if (window.storageManager) {
              const success = window.storageManager.clearHistory();
              if (success) {
                this.showToast('历史记录已清空', 'success');
                this.loadHistory(); // Refresh history
              } else {
                this.showToast('清空失败，请重试', 'error');
              }
            }
          }
        }
      ]
    });

    this.showModal(modal);
  }

  exportHistory() {
    if (!window.storageManager) {
      alert('存储管理器未初始化');
      return;
    }

    const data = window.storageManager.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `识字图片历史记录_${Utils.formatFullDate?.(Date.now()).replace(/[\/\s:]/g, '_')}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('历史记录导出成功', 'success');
  }

  showProgressModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="progress-container">
          <div class="progress-content">
            <div class="progress-icon">🪄</div>
            <h3 class="progress-title">AI正在绘制魔法图片</h3>
            <p class="progress-message">正在创建生成任务...</p>
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
      </div>
    `;

    document.body.appendChild(modal);

    // 添加关闭处理
    modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      this.hideProgressModal();
    });

    // 显示动画
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  hideProgressModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.classList.remove('remove');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    }
  }

  updateProgress(progress) {
    const bar = document.getElementById('progressBar');
    const message = document.querySelector('.progress-message');
    const steps = document.querySelectorAll('.progress-step');

    if (bar && progress.state) {
      const progressMap = {
        'creating': 20,
        'waiting': 40,
        'running': 60,
        'processing': 80,
        'success': 100,
        'fail': 100
      };

      const width = progressMap[progress.state] || 0;
      bar.style.width = `${width}%`;

      if (message && progress.message) {
        message.textContent = progress.message;
      }

      steps.forEach((step, index) => {
        step.classList.toggle('active', index <= (progressMap[progress.state] || 0));
        step.classList.toggle('completed', index < (progressMap[progress.state] || 0));
      });
    }
  }

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
          <h3 class="modal-title">${options.title}</h3>
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

    // Add close button handler
    modal.querySelector('.modal-close')?.addEventListener('click', () => {
      this.hideModal();
    });

    return modal;
  }

  showModal(modal) {
      const container = this.elements.modalContainer;
      container.innerHTML = '';
      container.appendChild(modal);
      container.classList.remove('hidden');

      // Add backdrop click handler
      modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
        this.hideModal();
      });

      // Trigger animation
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
    }

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

    hideAllModals() {
      this.hideModal();
    }

    hideLoadingScreen() {
      console.log('🔄 隐藏加载屏幕...');
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        console.log('✅ 加载屏幕已隐藏');
        setTimeout(() => {
          if (loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
            console.log('✅ 加载屏幕已从DOM中移除');
          }
        }, 500);
      } else {
        console.warn('⚠️ 未找到加载屏幕元素');
      }
    }

    showToast(message, type = 'info') {
      const container = this.elements.toastContainer;
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 15px;
        margin-bottom: 10px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
        font-family: Arial, sans-serif;
      `;

      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };

      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
      `;

      container.appendChild(toast);

      // 触发动画
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);

      // Auto hide after 5 seconds
      setTimeout(() => {
        this.hideToast(toast);
      }, 5000);
    }

    hideToast(toast) {
      if (toast && toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    }
  }
}

// 创建实例
window.uiManager = new UIManagerFixed();
window.uiManagerFixed = window.uiManager;