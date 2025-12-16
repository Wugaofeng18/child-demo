/**
 * Image Processing Module
 * Handles post-processing of generated images to add Chinese labels
 */

class ImageProcessor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Initialize canvas for image processing
   */
  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Add Chinese labels to generated image
   * @param {string} imageUrl - Original image URL
   * @param {Object} vocabulary - Vocabulary data
   * @param {string} title - Image title
   * @returns {Promise<string>} Processed image data URL
   */
  async addChineseLabels(imageUrl, vocabulary, title) {
    try {
      console.log('🔄 开始处理图片...');
      this.initCanvas();

      // Load original image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('✅ 原始图片加载成功，尺寸:', img.width, 'x', img.height);
          resolve();
        };
        img.onerror = (error) => {
          console.error('❌ 原始图片加载失败:', error);
          reject(error);
        };
        // 移除crossOrigin设置，因为这可能导致问题
        img.src = imageUrl;
      });

      // 保持原始图片尺寸
      this.canvas.width = img.width;
      this.canvas.height = img.height;

      // 首先绘制原始图片
      this.ctx.drawImage(img, 0, 0);

      // 在图片上添加半透明白色背景的标题区域
      const titleHeight = 80;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      this.ctx.fillRect(0, 0, this.canvas.width, titleHeight);

      // 添加标题
      this.addTitle(title, titleHeight);

      // 在图片底部添加标签区域
      const labelHeight = 120;
      const labelY = this.canvas.height - labelHeight;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      this.ctx.fillRect(0, labelY, this.canvas.width, labelHeight);

      // 添加中文标签
      this.addVocabularyLabels(vocabulary, labelY);

      console.log('✅ 图片处理完成');
      return this.canvas.toDataURL('image/png');

    } catch (error) {
      console.error('❌ 图片处理错误:', error);
      throw new Error('图片处理失败: ' + error.message);
    }
  }

  /**
   * Add title to image
   * @param {string} title - Title text
   * @param {number} titleHeight - Title area height
   */
  addTitle(title, titleHeight = 80) {
    this.ctx.save();
    this.ctx.fillStyle = '#FF6B9D';
    this.ctx.font = `bold ${Math.min(titleHeight / 2, 40)}px "Comic Neue", "Noto Sans SC", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText(title, this.canvas.width / 2, titleHeight / 2);
    this.ctx.restore();
  }

  /**
   * Add vocabulary labels
   * @param {Object} vocabulary - Vocabulary data
   * @param {number} labelY - Starting Y position for labels
   */
  addVocabularyLabels(vocabulary, labelY) {
    const allItems = [
      ...vocabulary.core.slice(0, 3),
      ...vocabulary.items.slice(0, 4),
      ...vocabulary.environment.slice(0, 2)
    ];

    const positions = this.generateLabelPositions(allItems.length, labelY);

    allItems.forEach((item, index) => {
      if (positions[index]) {
        this.addLabel(item, positions[index]);
      }
    });
  }

  /**
   * Generate positions for labels
   * @param {number} count - Number of labels
   * @param {number} labelY - Starting Y position for labels
   * @returns {Array} Array of positions
   */
  generateLabelPositions(count, labelY) {
    const positions = [];
    const margin = 40;
    const labelHeight = 120;
    const cols = Math.min(count, 4); // 最多4列
    const itemWidth = (this.canvas.width - margin * 2) / cols;
    const itemHeight = 50;

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      positions.push({
        x: margin + col * itemWidth + itemWidth / 2,
        y: labelY + 20 + row * (itemHeight + 10)
      });
    }

    return positions;
  }

  /**
   * Add single label
   * @param {Object} item - Vocabulary item
   * @param {Object} position - Label position
   */
  addLabel(item, position) {
    const { x, y } = position;

    // Draw label background
    this.ctx.save();

    // 设置字体大小以适应图片尺寸
    const fontSize = Math.min(this.canvas.width / 40, 16);
    const chineseFontSize = fontSize * 1.4;

    // 计算文本尺寸
    this.ctx.font = `${fontSize}px "Noto Sans SC", sans-serif`;
    const pinyinWidth = this.ctx.measureText(item.pinyin).width;
    this.ctx.font = `bold ${chineseFontSize}px "Noto Sans SC", sans-serif`;
    const chineseWidth = this.ctx.measureText(item.chinese).width;

    const maxTextWidth = Math.max(pinyinWidth, chineseWidth);
    const padding = 10;
    const width = maxTextWidth + padding * 2;
    const height = fontSize + chineseFontSize + padding;

    // 绘制背景
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.strokeStyle = '#4A90E2';
    this.ctx.lineWidth = 2;

    // 圆角矩形
    this.roundRect(x - width/2, y - height/2, width, height, 10);
    this.ctx.fill();
    this.ctx.stroke();

    // 绘制文本
    this.ctx.fillStyle = '#333333';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Pinyin (top)
    this.ctx.font = `${fontSize}px "Noto Sans SC", sans-serif`;
    this.ctx.fillText(item.pinyin, x, y - chineseFontSize/2 - 2);

    // Chinese characters (bottom)
    this.ctx.font = `bold ${chineseFontSize}px "Noto Sans SC", sans-serif`;
    this.ctx.fillText(item.chinese, x, y + fontSize/2 + 2);

    this.ctx.restore();
  }

  /**
   * Draw rounded rectangle
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} radius - Corner radius
   */
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}

// Create singleton instance
window.imageProcessor = new ImageProcessor();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageProcessor;
}