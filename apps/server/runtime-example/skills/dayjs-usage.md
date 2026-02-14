---
name: dayjs-usage
description: 轻量、易用的日期处理库 Day.js 的常用方法和最佳实践。
active: false
---

## Day.js 日期处理库

Day.js 是一个轻量级的 JavaScript 日期处理库，具有与 Moment.js 兼容的 API，但体积更小，速度更快。它支持链式操作和丰富的插件系统，是处理日期和时间的推荐选择。

### 常用用法示例

以下是通过运行脚本探索到的 Day.js 常用功能：

```javascript
import dayjs from "dayjs";

// 1. 获取当前日期和时间
const now = dayjs();
console.log(`Current time: ${now.format("YYYY-MM-DD HH:mm:ss")}`);
// Output: Current time: 2026-02-13 20:23:47 (示例值)

// 2. 解析特定日期
const specificDate = dayjs("2024-01-01");
console.log(
  `Specific date (2024-01-01): ${specificDate.format("MMMM DD, YYYY")}`
);
// Output: Specific date (2024-01-01): January 01, 2024

// 3. 增加/减少时间
const inSevenDays = now.add(7, "day");
console.log(`7 days from now: ${inSevenDays.format("YYYY-MM-DD")}`);
// Output: 7 days from now: 2026-02-20 (示例值)

const twoHoursAgo = now.subtract(2, "hour");
console.log(`2 hours ago: ${twoHoursAgo.format("HH:mm:ss")}`);
// Output: 2 hours ago: 18:23:47 (示例值)

// 4. 计算日期差异
const date1 = dayjs("2023-01-01");
const date2 = dayjs("2023-01-31");
const daysDiff = date2.diff(date1, "day");
console.log(`Difference between 2023-01-01 and 2023-01-31: ${daysDiff} days`);
// Output: Difference between 2023-01-01 and 2023-01-31: 30 days

// 5. 获取时间单位的开始/结束
const startOfDay = now.startOf("day");
console.log(`Start of today: ${startOfDay.format("YYYY-MM-DD HH:mm:ss")}`);
// Output: Start of today: 2026-02-13 00:00:00 (示例值)

const endOfMonth = now.endOf("month");
console.log(
  `End of current month: ${endOfMonth.format("YYYY-MM-DD HH:mm:ss")}`
);
// Output: End of current month: 2026-02-28 23:59:59 (示例值)

// 6. 比较日期
const comparisonDate = dayjs("2026-02-12");
console.log(`Is now after 2026-02-12? ${now.isAfter(comparisonDate)}`);
// Output: Is now after 2026-02-12? true

console.log(`Is now before 2026-02-12? ${now.isBefore(comparisonDate)}`);
// Output: Is now before 2026-02-12? false

console.log(
  `Is now same as 2026-02-13? ${dayjs("2026-02-13").isSame(now, "day")}`
);
// Output: Is now same as 2026-02-13? true

// 7. Unix 时间戳
console.log(`Unix timestamp (seconds): ${now.unix()}`);
// Output: Unix timestamp (seconds): 1771043027 (示例值)

console.log(`Unix timestamp (milliseconds): ${now.valueOf()}`);
// Output: Unix timestamp (milliseconds): 1771043027424 (示例值)
```

### 推荐理由

- **轻量级**：核心库体积小，加载速度快。
- **API友好**：API 设计与 Moment.js 相似，学习成本低，易于上手。
- **不可变性**：所有操作都返回新的 Day.js 实例，避免了修改原始日期对象带来的副作用。
- **易于扩展**：通过插件系统可以轻松添加更多高级功能。
