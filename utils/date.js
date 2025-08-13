// 获取并设置当前日期、月份和星期几
export const getAndSetCurrentDate = () => {
  const date = new Date();
  const day = date.getDate(); // 获取日期 (1-31)
  const monthIndex = date.getMonth(); // 获取月份索引 (0-11)
  const dayOfWeek = date.getDay(); // 获取星期几 (0-6, 0是周日)
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const calendar = {
    currentDay: day < 10 ? "0" + day : day,
    currentMonth: months[monthIndex],
    currentWeekDay: weekDays[dayOfWeek],
  };
  return calendar;
};

/**
 * 将日期字符串格式化为"几月几日"格式
 * @param {string} dateStr - 日期字符串，格式如"1999-03-11 01:25:25"
 * @returns {string} 返回"几月几日"格式的字符串
 */
export function formatToMonthDay(dateStr) {
  // 创建Date对象
  const date = new Date(dateStr);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    throw new Error("无效的日期格式");
  }

  // 获取月份和日期
  const month = date.getMonth() + 1; // 月份从0开始，需要加1
  const day = date.getDate();

  // 返回"几月几日"格式
  return `${month}月${day}日`;
}
/**
 *   根据当前月份返回数据中对应的cn名称
 *
 */
export function getMonthNameByMonth() {
  const monthNames = [
    {
      month: 1,
      name: "一月",
    },
    {
      month: 2,
      name: "二月",
    },
    {
      month: 3,
      name: "三月",
    },
    {
      month: 4,
      name: "四月",
    },
    {
      month: 5,
      name: "五月",
    },
    {
      month: 6,
      name: "六月",
    },
    {
      month: 7,
      name: "七月",
    },
    {
      month: 8,
      name: "八月",
    },
    {
      month: 9,
      name: "九月",
    },
    {
      month: 10,
      name: "十月",
    },
    {
      month: 11,
      name: "十一月",
    },
    {
      month: 12,
      name: "十二月",
    },
  ];
  const date = new Date();
  const month = date.getMonth() + 1;
  let monthName = "";
  monthNames.forEach(item => {
    if (item.month === month) {
      monthName = item.name;
    }
  });
  return monthName;
}


// 获取当日日期字符串（YYYYMMDD格式）
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`; // 示例：20250710
}

/**
 * 检查当日首次访问（自然日周期）
 * @param {Function} triggerEvent - 触发埋点的方法
 * @param {String} pageKey - 页面唯一标识（如：'my_page'）
 */
export const checkFirstVisitToday = (key='last_visit_date') => {
  const today = getTodayDateString();
  const lastVisitKey = key;
  const lastVisitDate = tt.getStorageSync(lastVisitKey);

  if (lastVisitDate !== today) {
    tt.setStorageSync(lastVisitKey, today); // 更新访问日期
    return true; // 返回首次访问状态
  }
  return false;
}
