/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

// Generate unique ID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Format date to readable string
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (diffDays === 2) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (diffDays <= 7) {
    return diffDays + '天前';
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}

// Format full date with time
function formatFullDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Validate Chinese text input
function validateChineseText(text, minLength = 1, maxLength = 100) {
  if (!text || typeof text !== 'string') {
    return { valid: false, message: '请输入文本' };
  }

  const trimmedText = text.trim();
  if (trimmedText.length < minLength) {
    return { valid: false, message: `至少需要输入${minLength}个字符` };
  }

  if (trimmedText.length > maxLength) {
    return { valid: false, message: `最多只能输入${maxLength}个字符` };
  }

  // Check for valid characters (Chinese, numbers, letters, and common punctuation)
  const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9\s\.,\!?;:，。！？；：""''（）【】《》\-_]+$/;
  if (!validPattern.test(trimmedText)) {
    return { valid: false, message: '包含无效字符，请输入中文、英文、数字或常用标点符号' };
  }

  return { valid: true, message: '输入有效' };
}

// Validate API key format (basic validation)
function validateApiKey(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, message: '请输入API密钥' };
  }

  const trimmedKey = key.trim();
  if (trimmedKey.length < 10) {
    return { valid: false, message: 'API密钥长度不正确' };
  }

  // Basic pattern check - adjust based on actual API key format
  const validPattern = /^[a-zA-Z0-9\-_]+$/;
  if (!validPattern.test(trimmedKey)) {
    return { valid: false, message: 'API密钥格式不正确' };
  }

  return { valid: true, message: 'API密钥格式正确' };
}

// Download image from URL
function downloadImage(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Convert image to base64
function imageToBase64(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL('image/png');
}

// Compress image if needed
async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
}

// Debounce function for search inputs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Check if device is mobile
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Check if device is tablet
function isTablet() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isiPad = /ipad/.test(userAgent);
  const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;
  return isiPad || (isMobile() && isTabletSize);
}

// Get viewport size
function getViewportSize() {
  return {
    width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  };
}

// Smooth scroll to element
function scrollToElement(element, offset = 0) {
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Generate random color for UI elements
function generateRandomColor() {
  const colors = [
    '#4A90E2', '#FF6B9D', '#FFE66D', '#6BCF7F',
    '#9B59B6', '#FF6600', '#39B54A', '#FFD700',
    '#0066CC', '#FF0000', '#FF69B4', '#8B4789'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Calculate file size in human readable format
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check internet connection
function checkInternetConnection() {
  return navigator.onLine;
}

// Add event listeners for connection status
function setupConnectionListeners(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// Validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Get MIME type from file extension
function getMimeTypeFromExtension(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

// Retry function for API calls
async function retry(fn, options = {}) {
  const {
    retries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry = null
  } = options;

  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i === retries) {
        throw lastError;
      }

      const delay = exponentialBackoff
        ? retryDelay * Math.pow(2, i)
        : retryDelay;

      if (onRetry) {
        onRetry(error, i + 1, delay);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Create confetti effect
function createConfetti() {
  const colors = ['#FFE66D', '#FF6B9D', '#4A90E2', '#6BCF7F', '#9B59B6'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';

      document.body.appendChild(confetti);

      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 4000);
    }, i * 30);
  }
}

// Export utilities for use in other modules
window.Utils = {
  generateUUID,
  formatDate,
  formatFullDate,
  sanitizeHTML,
  validateChineseText,
  validateApiKey,
  downloadImage,
  imageToBase64,
  compressImage,
  debounce,
  isMobile,
  isTablet,
  getViewportSize,
  scrollToElement,
  copyToClipboard,
  generateRandomColor,
  formatFileSize,
  checkInternetConnection,
  setupConnectionListeners,
  extractDomain,
  isValidUrl,
  getMimeTypeFromExtension,
  retry,
  createConfetti
};