# useInterval & useTimeout

- useInterval：一个可以处理 setInterval 的 Hook。
- useTimeout：一个可以处理 setTimeout 计时器函数的 Hook。

官方文档：

- [useInterval 官方文档](https://ahooks.js.org/zh-CN/hooks/use-interval)
- [useTimeout 官方文档](https://ahooks.js.org/zh-CN/hooks/use-interval)

`useInterval` 与 `useTimeout` 的实现思路基本一致（除了 `useTimeout` 没有 `immediate` 参数选）。下面就只举例 `useInterval` 了

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usedeepcompareeffect-demo1/)

每 1000ms，执行一次

```ts
import React, { useState } from 'react';
import { useInterval } from 'ahooks';

export default () => {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return <div>count: {count}</div>;
};
```

## 核心实现

跟我们自己写 `setInterval` 的区别：

- 无需手动清除定时器的逻辑，简化代码
- 支持 `immediate` 参数，通过 `immediate` 可以在首次渲染时立即执行
- 支持 `delay` 参数变更时重新启动定时器

```ts
function useInterval(
  fn: () => void, // 要定时调用的函数
  delay: number | undefined, // 间隔时间，当设置值为 undefined 时会停止计时器
  options: {
    immediate?: boolean; // 是否在首次渲染时立即执行
  } = {},
) {
  // 是否首次立即执行
  const { immediate } = options;
  // 要执行的函数，使用 useLatest 拿到最新的引用
  const fnRef = useLatest(fn);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  // 如果没有传入间隔 则不执行定时器
  useEffect(() => {
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    // 立即执行
    if (immediate) {
      fnRef.current();
    }
    timerRef.current = setInterval(() => {
      fnRef.current();
    }, delay);
    return () => {
      // 组件卸载时内部做清除操作
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [delay]);

  // 清除定时器
  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  return clear;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useInterval/index.ts)
