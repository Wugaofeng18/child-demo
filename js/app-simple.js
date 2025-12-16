/**
 * Simplified Main Application - Disney Style
 * Direct initialization without complex module dependencies
 */

console.log('🏰 魔法识字乐园启动中...');

// Global variables
let appData = {
    selectedTheme: null,
    currentResult: null,
    isGenerating: false,
    themesData: null
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

async function initializeApp() {
    console.log('🎨 开始初始化应用...');

    try {
        // Hide loading screen immediately
        hideLoadingScreen();

        // Initialize components
        await loadThemes();
        bindEvents();

        console.log('✨ 魔法识字乐园启动完成！');

        // Show welcome message
        setTimeout(() => {
            showToast('欢迎来到魔法识字乐园！选择一个主题开始创建你的第一张识字图片吧！', 'info');
        }, 1000);

    } catch (error) {
        console.error('❌ 应用初始化失败:', error);
        handleInitializationError(error);
    }
}

async function loadThemes() {
    try {
        console.log('🔄 加载主题数据...');

        const response = await fetch('data/themes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        appData.themesData = data.themes;
        console.log('✅ 主题数据加载成功:', Object.keys(appData.themesData));

        renderThemes();

    } catch (error) {
        console.error('❌ 主题数据加载失败:', error);

        // Use default themes
        appData.themesData = getDefaultThemes();
        console.log('🔄 使用默认主题数据');
        renderThemes();

        showToast('主题数据加载失败，使用默认主题', 'warning');
    }
}

function getDefaultThemes() {
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
        },
        "hospital": {
            "name": "医院",
            "icon": "🏥",
            "description": "Hospital and medical center",
            "vocabulary": {
                "core": [
                    {"chinese": "医生", "pinyin": "yī shēng"},
                    {"chinese": "护士", "pinyin": "hù shi"},
                    {"chinese": "病人", "pinyin": "bìng rén"},
                    {"chinese": "药物", "pinyin": "yào wù"}
                ],
                "items": [
                    {"chinese": "病床", "pinyin": "bìng chuáng"},
                    {"chinese": "听诊器", "pinyin": "tīng zhěn qì"},
                    {"chinese": "体温计", "pinyin": "tǐ wēn jì"},
                    {"chinese": "针筒", "pinyin": "zhēn tǒng"},
                    {"chinese": "药片", "pinyin": "yào piàn"}
                ],
                "environment": [
                    {"chinese": "挂号处", "pinyin": "guà hào chù"},
                    {"chinese": "急诊室", "pinyin": "jí zhěn shì"}
                ]
            }
        },
        "school": {
            "name": "学校",
            "icon": "🏫",
            "description": "School and educational center",
            "vocabulary": {
                "core": [
                    {"chinese": "老师", "pinyin": "lǎo shī"},
                    {"chinese": "学生", "pinyin": "xué shēng"},
                    {"chinese": "教室", "pinyin": "jiào shì"},
                    {"chinese": "书包", "pinyin": "shū bāo"}
                ],
                "items": [
                    {"chinese": "铅笔", "pinyin": "qiān bǐ"},
                    {"chinese": "课桌", "pinyin": "kè zhuō"},
                    {"chinese": "黑板", "pinyin": "hēi bǎn"},
                    {"chinese": "书本", "pinyin": "shū běn"},
                    {"chinese": "橡皮", "pinyin": "xiàng pí"}
                ],
                "environment": [
                    {"chinese": "操场", "pinyin": "cāo chǎng"},
                    {"chinese": "校门", "pinyin": "xiào mén"}
                ]
            }
        },
        "home": {
            "name": "家庭",
            "icon": "🏠",
            "description": "Home and family life",
            "vocabulary": {
                "core": [
                    {"chinese": "爸爸", "pinyin": "bà ba"},
                    {"chinese": "妈妈", "pinyin": "mā ma"},
                    {"chinese": "孩子", "pinyin": "hái zi"},
                    {"chinese": "家", "pinyin": "jiā"}
                ],
                "items": [
                    {"chinese": "桌子", "pinyin": "zhuō zi"},
                    {"chinese": "椅子", "pinyin": "yǐ zi"},
                    {"chinese": "床", "pinyin": "chuáng"},
                    {"chinese": "沙发", "pinyin": "shā fā"},
                    {"chinese": "电视", "pinyin": "diàn shì"}
                ],
                "environment": [
                    {"chinese": "厨房", "pinyin": "chú fáng"},
                    {"chinese": "客厅", "pinyin": "kè tīng"}
                ]
            }
        },
        "zoo": {
            "name": "动物园",
            "icon": "🦁",
            "description": "Zoo and animal encounters",
            "vocabulary": {
                "core": [
                    {"chinese": "狮子", "pinyin": "shī zi"},
                    {"chinese": "大象", "pinyin": "dà xiàng"},
                    {"chinese": "猴子", "pinyin": "hóu zi"},
                    {"chinese": "熊猫", "pinyin": "xióng māo"}
                ],
                "items": [
                    {"chinese": "老虎", "pinyin": "lǎo hǔ"},
                    {"chinese": "长颈鹿", "pinyin": "cháng jǐng lù"},
                    {"chinese": "斑马", "pinyin": "bān mǎ"},
                    {"chinese": "袋鼠", "pinyin": "dài shǔ"},
                    {"chinese": "企鹅", "pinyin": "qǐ é"}
                ],
                "environment": [
                    {"chinese": "鸟笼", "pinyin": "niǎo lóng"},
                    {"chinese": "水池", "pinyin": "shuǐ chí"}
                ]
            }
        },
        "restaurant": {
            "name": "餐厅",
            "icon": "🍴",
            "description": "Restaurant and dining experience",
            "vocabulary": {
                "core": [
                    {"chinese": "服务员", "pinyin": "fú wù yuán"},
                    {"chinese": "菜单", "pinyin": "cài dān"},
                    {"chinese": "餐桌", "pinyin": "cān zhuō"},
                    {"chinese": "厨房", "pinyin": "chú fáng"}
                ],
                "items": [
                    {"chinese": "米饭", "pinyin": "mǐ fàn"},
                    {"chinese": "面条", "pinyin": "miàn tiáo"},
                    {"chinese": "饺子", "pinyin": "jiǎo zi"},
                    {"chinese": "汤", "pinyin": "tāng"},
                    {"chinese": "筷子", "pinyin": "kuài zi"}
                ],
                "environment": [
                    {"chinese": "收银台", "pinyin": "shōu yín tái"},
                    {"chinese": "洗手间", "pinyin": "xǐ shǒu jiān"}
                ]
            }
        },
        "playground": {
            "name": "游乐场",
            "icon": "🎠",
            "description": "Playground and fun activities",
            "vocabulary": {
                "core": [
                    {"chinese": "旋转木马", "pinyin": "xuán zhuǎn mù mǎ"},
                    {"chinese": "摩天轮", "pinyin": "mó tiān lún"},
                    {"chinese": "过山车", "pinyin": "guò shān chē"},
                    {"chinese": "碰碰车", "pinyin": "pèng pèng chē"}
                ],
                "items": [
                    {"chinese": "秋千", "pinyin": "qiū qiān"},
                    {"chinese": "滑梯", "pinyin": "huá tī"},
                    {"chinese": "跷跷板", "pinyin": "qiāo qiāo bǎn"},
                    {"chinese": "沙坑", "pinyin": "shā kēng"},
                    {"chinese": "秋千", "pinyin": "qiū qiān"}
                ],
                "environment": [
                    {"chinese": "入口", "pinyin": "rù kǒu"},
                    {"chinese": "出口", "pinyin": "chū kǒu"}
                ]
            }
        }
    };
}

function renderThemes() {
    const themeGrid = document.getElementById('themeGrid');
    if (!themeGrid) return;

    themeGrid.innerHTML = '';

    Object.entries(appData.themesData).forEach(([key, theme]) => {
        const themeCard = document.createElement('div');
        themeCard.className = 'theme-card';
        themeCard.dataset.theme = key;

        themeCard.innerHTML = `
            <div class="theme-icon">${theme.icon}</div>
            <div class="theme-name">${theme.name}</div>
        `;

        themeCard.addEventListener('click', () => selectTheme(key));
        themeGrid.appendChild(themeCard);
    });
}

function selectTheme(themeKey) {
    console.log('🎯 选择主题:', themeKey);

    if (!appData.themesData[themeKey]) {
        console.warn('⚠️ 主题不存在:', themeKey);
        showToast(`主题 "${themeKey}" 不存在`, 'error');
        return;
    }

    // Update UI
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.theme === themeKey);
    });

    appData.selectedTheme = themeKey;
    console.log('✅ 主题选择成功:', themeKey, '-', appData.themesData[themeKey].name);
    validateForm();
}

function validateForm() {
    const title = document.getElementById('titleInput')?.value?.trim() || '';
    const apiKey = document.getElementById('apiKeyInput')?.value?.trim() || '';
    const isValid = appData.selectedTheme && title.length > 0 && apiKey.length > 0;

    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.disabled = !isValid || appData.isGenerating;
    }

    // Update button text
    const btnText = generateBtn?.querySelector('.btn-text');
    const btnIcon = generateBtn?.querySelector('.btn-icon');

    if (btnText && btnIcon) {
        if (!isValid) {
            const reasons = [];
            if (!appData.selectedTheme) reasons.push('选择主题');
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

function bindEvents() {
    console.log('🔗 绑定事件监听器...');

    // Navigation
    document.querySelectorAll('.nav-btn')?.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            switchPage(page);
        });
    });

    // Title input
    const titleInput = document.getElementById('titleInput');
    if (titleInput) {
        titleInput.addEventListener('input', (e) => {
            updateTitleCounter(e.target.value);
            validateForm();
        });
    }

    // API key input
    const apiKeyInput = document.getElementById('apiKeyInput');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', () => {
            validateForm();
        });
    }

    // Toggle API key visibility
    const toggleApiKey = document.getElementById('toggleApiKey');
    if (toggleApiKey) {
        toggleApiKey.addEventListener('click', toggleApiKeyVisibility);
    }

    // Suggestion buttons
    document.querySelectorAll('.suggestion-btn')?.forEach(btn => {
        btn.addEventListener('click', () => {
            const suggestion = btn.dataset.suggestion;
            if (titleInput) {
                titleInput.value = suggestion;
                updateTitleCounter(suggestion);
                validateForm();
            }
        });
    });

    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerate);
    }

    // Result buttons
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadCurrentImage);
    }

    const saveHistoryBtn = document.getElementById('saveHistoryBtn');
    if (saveHistoryBtn) {
        saveHistoryBtn.addEventListener('click', saveCurrentToHistory);
    }

    const generateAnotherBtn = document.getElementById('generateAnotherBtn');
    if (generateAnotherBtn) {
        generateAnotherBtn.addEventListener('click', resetForm);
    }

    // History page buttons
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', confirmClearHistory);
    }

    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', exportHistory);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAllModals();
        }
    });

    console.log('✅ 事件绑定完成');
}

function updateTitleCounter(value) {
    const counter = document.getElementById('titleCounter');
    if (counter) {
        const length = value.length;
        counter.textContent = `${length}/30`;
        counter.style.color = length > 25 ? '#dc3545' : '#666';
    }
}

function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const toggleBtn = document.getElementById('toggleApiKey');

    if (!apiKeyInput || !toggleBtn) return;

    const icon = toggleBtn.querySelector('.eye-icon');
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        if (icon) icon.textContent = '🙈';
    } else {
        apiKeyInput.type = 'password';
        if (icon) icon.textContent = '👁️';
    }
}

async function handleGenerate() {
    if (appData.isGenerating) return;

    const title = document.getElementById('titleInput')?.value?.trim() || '';
    const apiKey = document.getElementById('apiKeyInput')?.value?.trim() || '';

    if (!appData.selectedTheme || !title || !apiKey) {
        showToast('请填写所有必填项', 'warning');
        return;
    }

    appData.isGenerating = true;
    updateGenerateButton(true);

    try {
        console.log('🎨 开始生成图片...');
        console.log('主题:', appData.selectedTheme);
        console.log('标题:', title);

        const theme = appData.themesData[appData.selectedTheme];

        // Build prompt using tested format
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

        // Show progress
        showProgressModal();

        // Generate image using the API
        const result = await generateImage(apiKey, prompt);

        if (result.success) {
            console.log('✅ 图片生成成功:', result);
            displayResult(result, title, appData.selectedTheme);
            createConfetti();
            showToast('图片生成成功！', 'success');
        } else {
            throw new Error(result.error || '生成失败');
        }

    } catch (error) {
        console.error('❌ 图片生成失败:', error);
        showToast(`生成失败：${error.message}`, 'error');
    } finally {
        appData.isGenerating = false;
        updateGenerateButton(false);
        hideProgressModal();
    }
}

async function generateImage(apiKey, prompt) {
    // Create task
    const createResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'nano-banana-pro',
            input: {
                prompt: prompt,
                aspect_ratio: '3:4',
                resolution: '2K',
                output_format: 'png'
            },
            callBackUrl: null
        })
    });

    const createData = await createResponse.json();

    if (!createResponse.ok || !createData.data?.taskId) {
        throw new Error(createData.msg || '创建任务失败');
    }

    const taskId = createData.data.taskId;
    console.log('✅ 任务创建成功:', taskId);

    // Poll for result
    return await pollTask(taskId, apiKey);
}

async function pollTask(taskId, apiKey) {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;

        const response = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('查询任务失败');
        }

        const state = data.data.state;

        if (state === 'success') {
            const resultJson = JSON.parse(data.data.resultJson);
            const imageUrl = resultJson.resultUrls[0];

            return {
                success: true,
                imageUrl: imageUrl,
                generationTime: attempts * 2000,
                timestamp: Date.now()
            };
        } else if (state === 'fail') {
            throw new Error(`生成失败: ${data.data.failMsg || '未知错误'}`);
        }

        // Update progress
        updateProgress({ state: state, message: `处理中... (${attempts}/${maxAttempts})` });
    }

    throw new Error('生成超时，请重试');
}

function displayResult(result, title, theme) {
    console.log('🎨 开始显示结果');

    // Store current result
    appData.currentResult = {
        ...result,
        title: title,
        theme: theme,
        themeName: appData.themesData[theme]?.name || theme
    };

    // Create vocabulary display
    createVocabularyDisplay();

    // Show image
    const resultSection = document.getElementById('resultSection');
    const resultImage = document.getElementById('resultImage');

    if (!resultSection || !resultImage) {
        console.error('❌ 结果区域元素缺失');
        showToast('页面元素缺失，请刷新页面', 'error');
        return;
    }

    const imageUrl = result.imageUrl;
    console.log('🖼️ 图片URL:', imageUrl);

    if (!imageUrl) {
        console.error('❌ 图片URL为空');
        showToast('图片URL无效', 'error');
        return;
    }

    resultImage.src = imageUrl;
    resultImage.onload = () => {
        console.log('✅ 图片加载成功');
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    resultImage.onerror = (error) => {
        console.error('❌ 图片加载失败:', error);
        showToast('图片加载失败', 'error');
    };
}

function createVocabularyDisplay() {
    if (!appData.currentResult || !appData.themesData[appData.currentResult.theme]) {
        console.error('❌ 无法创建词汇显示：数据不完整');
        return;
    }

    const theme = appData.themesData[appData.currentResult.theme];
    const vocabulary = theme.vocabulary;

    // Remove existing vocabulary display
    const existingVocab = document.querySelector('.vocabulary-display');
    if (existingVocab) {
        existingVocab.remove();
    }

    // Create vocabulary display
    const vocabSection = document.createElement('div');
    vocabSection.className = 'vocabulary-display';
    vocabSection.innerHTML = `
      <h3 style="color: #9B59B6; margin: 20px 0; font-size: 1.5rem;">
        📚 ${appData.currentResult.title} - 词汇表
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
        ${createVocabularyCards(vocabulary)}
      </div>
      <p style="color: #666; font-style: italic; margin-top: 15px;">
        💡 提示：可以将上面的图片和词汇表一起使用来学习中文汉字
      </p>
    `;

    // Insert before generate another button
    const resultSection = document.getElementById('resultSection');
    const generateAnotherBtn = document.getElementById('generateAnotherBtn');
    if (resultSection && generateAnotherBtn) {
        resultSection.insertBefore(vocabSection, generateAnotherBtn);
    }
}

function createVocabularyCards(vocabulary) {
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

function updateGenerateButton(isGenerating) {
    const generateBtn = document.getElementById('generateBtn');
    if (!generateBtn) return;

    const btnText = generateBtn.querySelector('.btn-text');
    const btnIcon = generateBtn.querySelector('.btn-icon');

    if (btnText && btnIcon) {
        if (isGenerating) {
            generateBtn.disabled = true;
            btnText.textContent = 'AI正在绘制中...';
            btnIcon.textContent = '⏳';
            generateBtn.classList.add('generating');
        } else {
            generateBtn.disabled = false;
            btnText.textContent = '开始生成魔法图片';
            btnIcon.textContent = '🪄';
            generateBtn.classList.remove('generating');
            validateForm();
        }
    }
}

function downloadCurrentImage() {
    if (!appData.currentResult || !appData.currentResult.imageUrl) {
        showToast('没有可下载的图片', 'warning');
        return;
    }

    const filename = `识字图片_${appData.currentResult.title}_${Date.now()}.png`;
    const imageUrl = appData.currentResult.imageUrl;

    downloadImage(imageUrl, filename);
    showToast('图片下载中...', 'success');
}

function downloadImage(imageUrl, filename) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function saveCurrentToHistory() {
    if (!appData.currentResult) {
        showToast('没有可保存的图片', 'warning');
        return;
    }

    // Simple localStorage implementation
    try {
        const history = JSON.parse(localStorage.getItem('literacy_history') || '[]');
        const historyItem = {
            id: Date.now().toString(),
            title: appData.currentResult.title,
            theme: appData.currentResult.theme,
            themeName: appData.currentResult.themeName,
            imageUrl: appData.currentResult.imageUrl,
            generationTime: appData.currentResult.generationTime,
            timestamp: appData.currentResult.timestamp
        };

        history.unshift(historyItem);

        // Keep only last 50 items
        if (history.length > 50) {
            history.splice(50);
        }

        localStorage.setItem('literacy_history', JSON.stringify(history));
        showToast('已保存到历史记录', 'success');
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败，请重试', 'error');
    }
}

function resetForm() {
    const resultSection = document.getElementById('resultSection');
    if (resultSection) {
        resultSection.classList.add('hidden');
    }

    const titleInput = document.getElementById('titleInput');
    if (titleInput) {
        titleInput.value = '';
    }

    const titleCounter = document.getElementById('titleCounter');
    if (titleCounter) {
        titleCounter.textContent = '0/30';
    }

    appData.selectedTheme = null;
    document.querySelectorAll('.theme-card')?.forEach(card => {
        card.classList.remove('selected');
    });

    validateForm();
    document.querySelector('.generate-form')?.scrollIntoView({ behavior: 'smooth' });
}

function switchPage(page) {
    // Update navigation
    document.querySelectorAll('.nav-btn')?.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Update pages
    document.querySelectorAll('.page')?.forEach(pageElement => {
        pageElement.classList.toggle('active', pageElement.id === `${page}Page`);
    });

    // Load page-specific data
    if (page === 'history') {
        loadHistory();
    }
}

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('literacy_history') || '[]');
        const historyGrid = document.getElementById('historyGrid');
        const emptyHistory = document.getElementById('emptyHistory');

        if (!historyGrid || !emptyHistory) return;

        if (history.length === 0) {
            emptyHistory.style.display = 'block';
            historyGrid.style.display = 'none';
            return;
        }

        emptyHistory.style.display = 'none';
        historyGrid.style.display = 'grid';
        historyGrid.innerHTML = '';

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
                    <p style="margin: 0; color: #666; font-size: 14px;">${formatDate(item.timestamp)}</p>
                </div>
            `;

            historyItem.addEventListener('click', () => {
                showHistoryItemModal(item);
            });

            historyGrid.appendChild(historyItem);
        });
    } catch (error) {
        console.error('加载历史记录失败:', error);
    }
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('zh-CN');
}

function showHistoryItemModal(item) {
    const modal = createModal({
        title: item.title,
        content: `
            <div style="text-align: center;">
                <img src="${item.imageUrl}" alt="${item.title}" style="max-width: 100%; border-radius: 10px; margin-bottom: 20px;">
                <p><strong>主题：</strong>${item.themeName || item.theme}</p>
                <p><strong>生成时间：</strong>${formatDate(item.timestamp)}</p>
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
                    downloadImage(item.imageUrl, filename);
                    showToast('图片下载中...', 'success');
                }
            },
            {
                text: '删除',
                icon: '🗑️',
                class: 'secondary-btn',
                action: () => {
                    deleteHistoryItem(item.id);
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

    showModal(modal);
}

function deleteHistoryItem(itemId) {
    try {
        const history = JSON.parse(localStorage.getItem('literacy_history') || '[]');
        const updatedHistory = history.filter(item => item.id !== itemId);
        localStorage.setItem('literacy_history', JSON.stringify(updatedHistory));
        showToast('图片已删除', 'success');
        loadHistory();
    } catch (error) {
        console.error('删除失败:', error);
        showToast('删除失败，请重试', 'error');
    }
}

function confirmClearHistory() {
    const modal = createModal({
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
                    try {
                        localStorage.removeItem('literacy_history');
                        showToast('历史记录已清空', 'success');
                        loadHistory();
                    } catch (error) {
                        console.error('清空失败:', error);
                        showToast('清空失败，请重试', 'error');
                    }
                }
            }
        ]
    });

    showModal(modal);
}

function exportHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('literacy_history') || '[]');
        const data = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            history: history
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const filename = `识字图片历史记录_${new Date().toISOString().replace(/[\/\s:]/g, '_')}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        showToast('历史记录导出成功', 'success');
    } catch (error) {
        console.error('导出失败:', error);
        showToast('导出失败，请重试', 'error');
    }
}

function showProgressModal() {
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

    // Add close handler
    modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
        hideProgressModal();
    });
}

function hideProgressModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

function updateProgress(progress) {
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
            step.classList.toggle('active', index <= (progressMap[progress.state] || 0) / 33);
            step.classList.toggle('completed', index < (progressMap[progress.state] || 0) / 33);
        });
    }
}

function createModal(options) {
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
                hideModal();
            }
        });
    });

    modal.querySelector('.modal-close')?.addEventListener('click', () => {
        hideModal();
    });

    return modal;
}

function showModal(modal) {
    const container = document.getElementById('modalContainer');
    if (!container) return;

    container.innerHTML = '';
    container.appendChild(modal);
    container.classList.remove('hidden');

    modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
        hideModal();
    });

    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function hideModal() {
    const container = document.getElementById('modalContainer');
    if (!container) return;

    const modal = container.querySelector('.modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            container.innerHTML = '';
            container.classList.add('hidden');
        }, 300);
    }
}

function hideAllModals() {
    hideModal();
    hideProgressModal();
}

function hideLoadingScreen() {
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

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
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

    // Auto hide after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

function createConfetti() {
    // Simple confetti effect
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                opacity: 1;
                transform: rotate(${Math.random() * 360}deg);
                transition: all 2s ease-out;
                pointer-events: none;
                z-index: 9999;
            `;

            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.style.top = '100%';
                confetti.style.opacity = '0';
                confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
            }, 10);

            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 2000);
        }, i * 30);
    }
}

function handleInitializationError(error) {
    console.error('应用初始化错误:', error);

    // Hide loading screen
    hideLoadingScreen();

    // Show error page
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

// Global functions for HTML access
window.switchPage = switchPage;
window.showToast = showToast;

console.log('🎯 简化版应用脚本加载完成');