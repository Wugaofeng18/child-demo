/**
 * API Integration Module
 * Handles communication with Nano Banana Pro API
 */

class ImageGenerator {
  constructor() {
    this.apiBaseUrl = 'https://api.kie.ai/api/v1';
    this.modelName = 'nano-banana-pro';
    this.pollingInterval = 2000; // 2 seconds
    this.maxPollingTime = 300000; // 5 minutes
    this.activeTasks = new Map(); // Track active generation tasks
  }

  /**
   * Create a new image generation task
   * @param {string} apiKey - API authentication key
   * @param {string} prompt - Text prompt for image generation
   * @param {Object} options - Additional generation options
   * @returns {Promise<Object>} Task creation response
   */
  async createTask(apiKey, prompt, options = {}) {
    const defaultOptions = {
      aspect_ratio: '3:4', // Portrait format for literacy images
      resolution: '2K',
      output_format: 'png',
      image_input: []
    };

    const requestBody = {
      model: this.modelName,
      input: {
        ...defaultOptions,
        ...options,
        prompt: prompt
      },
      callBackUrl: null // 明确设置为null
    };

    try {
      console.log('🔗 创建API任务...');
      console.log('请求URL:', `${this.apiBaseUrl}/jobs/createTask`);
      console.log('请求体:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.apiBaseUrl}/jobs/createTask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 API响应状态:', response.status, response.statusText);

      const data = await response.json();
      console.log('📋 API响应数据:', data);

      if (!response.ok) {
        const error = this.handleApiError(response.status, data);
        console.error('❌ API请求失败:', error);
        throw error;
      }

      if (!data.data || !data.data.taskId) {
        throw new Error('API响应格式错误：缺少taskId');
      }

      console.log('✅ 任务创建成功:', data.data.taskId);
      return data;

    } catch (error) {
      console.error('❌ 创建图片生成任务时出错:', error);

      // 如果是网络错误，提供更友好的错误信息
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络连接或API地址是否正确');
      }

      throw error;
    }
  }

  /**
   * Query task status and results
   * @param {string} taskId - Task ID to query
   * @returns {Promise<Object>} Task status and results
   */
  async queryTaskStatus(taskId) {
    try {
      console.log(`🔍 查询任务状态: ${taskId}`);
      const response = await fetch(`${this.apiBaseUrl}/jobs/recordInfo?taskId=${taskId}`);
      const data = await response.json();

      console.log('📊 任务状态响应:', data);

      if (!response.ok) {
        const error = this.handleApiError(response.status, data);
        console.error('❌ 查询任务状态失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ 查询任务状态时出错:', error);
      throw error;
    }
  }

  /**
   * Poll task status until completion or timeout
   * @param {string} taskId - Task ID to poll
   * @param {Function} onUpdate - Callback for status updates
   * @returns {Promise<Object>} Final task result
   */
  async pollTaskUntilComplete(taskId, onUpdate = null) {
    const startTime = Date.now();
    let lastStatus = null;

    while (true) {
      try {
        const result = await this.queryTaskStatus(taskId);
        const currentStatus = result.data.state;

        // Call update callback if status changed
        if (onUpdate && currentStatus !== lastStatus) {
          onUpdate(result.data);
          lastStatus = currentStatus;
        }

        // Check if task is complete
        if (currentStatus === 'success') {
          return result;
        }

        // Check if task failed
        if (currentStatus === 'fail') {
          throw new Error(`Task failed: ${result.data.failMsg || 'Unknown error'}`);
        }

        // Check for timeout
        if (Date.now() - startTime > this.maxPollingTime) {
          throw new Error('Task polling timeout');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, this.pollingInterval));

      } catch (error) {
        console.error('Error during task polling:', error);
        throw error;
      }
    }
  }

  /**
   * Generate complete image with polling
   * @param {string} apiKey - API authentication key
   * @param {string} prompt - Text prompt for generation
   * @param {Object} options - Generation options
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(apiKey, prompt, options = {}, onProgress = null) {
    let taskId = null;

    try {
      // Create task
      if (onProgress) onProgress({ status: 'creating', message: '正在创建生成任务...' });

      const createResult = await this.createTask(apiKey, prompt, options);
      taskId = createResult.data.taskId;

      // Track active task
      this.activeTasks.set(taskId, {
        startTime: Date.now(),
        prompt: prompt
      });

      // Poll for completion
      if (onProgress) onProgress({ status: 'waiting', message: '任务已创建，等待处理...' });

      const result = await this.pollTaskUntilComplete(taskId, (data) => {
        if (onProgress) {
          const message = this.getStatusMessage(data.state);
          onProgress({
            status: data.state,
            message: message,
            taskId: data.taskId,
            createTime: data.createTime,
            costTime: data.costTime
          });
        }
      });

      // Process successful result
      const imageData = JSON.parse(result.data.resultJson);

      return {
        success: true,
        taskId: taskId,
        imageUrl: imageData.resultUrls[0],
        generationTime: result.data.costTime,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Image generation failed:', error);

      return {
        success: false,
        error: error.message,
        taskId: taskId
      };
    } finally {
      // Clean up active task tracking
      if (taskId) {
        this.activeTasks.delete(taskId);
      }
    }
  }

  /**
   * Cancel active task
   * @param {string} taskId - Task ID to cancel
   */
  cancelTask(taskId) {
    this.activeTasks.delete(taskId);
    // Note: API doesn't seem to have a cancel endpoint, so we just stop tracking
  }

  /**
   * Get status message for display
   * @param {string} status - API status
   * @returns {string} User-friendly message
   */
  getStatusMessage(status) {
    const messages = {
      'waiting': '任务排队中，请稍候...',
      'running': 'AI正在绘制图片，这需要一些时间...',
      'processing': '正在处理生成的图片...',
      'success': '图片生成成功！',
      'fail': '生成失败，请重试'
    };

    return messages[status] || `任务状态: ${status}`;
  }

  /**
   * Handle API errors and return appropriate error objects
   * @param {number} status - HTTP status code
   * @param {Object} data - Response data
   * @returns {Error} Formatted error
   */
  handleApiError(status, data) {
    const errorMessages = {
      400: '请求参数格式错误，请检查输入内容',
      401: 'API密钥无效或已过期，请检查密钥是否正确',
      402: '账户余额不足，请充值后重试',
      404: '请求的资源不存在或已被删除',
      422: '请求参数验证失败，请检查输入内容是否符合要求',
      429: '请求频率过高，请稍后再试',
      500: '服务器内部错误，请稍后重试',
      502: '网关错误，请稍后重试',
      503: '服务暂时不可用，请稍后重试',
      504: '网关超时，请稍后重试'
    };

    // 尝试从响应中获取更详细的错误信息
    let message = data.msg || data.message || errorMessages[status] || `未知错误 (${status})`;

    // 如果有详细的错误信息，添加到消息中
    if (data.failMsg) {
      message += ` (${data.failMsg})`;
    }

    // 如果有错误代码，添加到消息中
    if (data.failCode) {
      message += ` [错误代码: ${data.failCode}]`;
    }

    const error = new Error(message);
    error.status = status;
    error.code = data.code || data.failCode;
    error.data = data;

    console.error('🚨 API错误详情:', {
      status: status,
      message: message,
      code: error.code,
      data: data
    });

    return error;
  }

  /**
   * Build comprehensive prompt from template and vocabulary
   * @param {string} theme - Selected theme
   * @param {string} title - User title
   * @param {Object} vocabulary - Theme vocabulary data
   * @param {Object} themeInfo - Theme information including name
   * @returns {string} Complete prompt for API
   */
  buildPrompt(theme, title, vocabulary, themeInfo = null) {
    const themeName = themeInfo?.name || theme;
    const coreVocabulary = vocabulary.core.map(item => `${item.pinyin} ${item.chinese}`).join(', ');
    const itemsVocabulary = vocabulary.items.map(item => `${item.pinyin} ${item.chinese}`).join(', ');
    const environmentVocabulary = vocabulary.environment.map(item => `${item.pinyin} ${item.chinese}`).join(', ');

    // 使用中文提示词，直接要求生成中文内容
    const prompt = `一张中国儿童识字海报：标题《${title}》，主题：${themeName}

适合5-9岁儿童学习中文汉字的教育插图。

要求：
- 风格：简洁明快的卡通插画，儿童绘本风格
- 格式：竖版海报
- 语言：纯中文，包含拼音标注

必须包含的词汇：
${vocabulary.core.slice(0, 5).map(item => `${item.chinese}(${item.pinyin})`).join('、')}
${vocabulary.items.slice(0, 5).map(item => `${item.chinese}(${item.pinyin})`).join('、')}

每个物品都要有中文标签：
第一行：拼音
第二行：汉字

色彩明亮，教育风格，清晰标注，适合教室使用。`;

    console.log('📝 生成的提示词长度:', prompt.length);
    console.log('📝 主题名称:', themeName);
    console.log('📝 使用词汇数量:', selectedCore.length + selectedItems.length + selectedEnvironment.length);
    console.log('📝 提示词预览:', prompt.substring(0, 100) + '...');

    return prompt;
  }

  /**
   * Get active tasks count
   * @returns {number} Number of active tasks
   */
  getActiveTasksCount() {
    return this.activeTasks.size;
  }

  /**
   * Check if API key is valid format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} True if format appears valid
   */
  validateApiKeyFormat(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    const trimmedKey = apiKey.trim();
    // Basic validation - adjust based on actual API key format
    return trimmedKey.length >= 10 && /^[a-zA-Z0-9\-_]+$/.test(trimmedKey);
  }

  /**
   * Test API connection
   * @param {string} apiKey - API key to test
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection(apiKey) {
    try {
      // Create a minimal test task to validate API key
      const testPrompt = 'Test connection';
      const result = await this.createTask(apiKey, testPrompt);

      // If we get a task ID, the API key is valid
      return result.data && result.data.taskId;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
window.imageGenerator = new ImageGenerator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageGenerator;
}