export default function debounce(func, options = {}) {
  const { wait = 200, immediate = false } = options;
  let timer = null;

  return function executedFunction() {
    const context = this;
    const callNow = immediate && !timer;

    clearTimeout(timer);  // 总是清除旧定时器

    if (callNow) {
      func.apply(context, arguments);
      // 设置定时器重置状态（代替lastExecTime）
      timer = setTimeout(() => {
        timer = null;
      }, wait);
    } else {
      timer = setTimeout(() => {
        func.apply(context, arguments);
        timer = null;
      }, wait);
    }
  };
}