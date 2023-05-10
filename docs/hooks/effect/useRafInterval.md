# useRafInterval & useRafTimeout

用 requestAnimationFrame 模拟实现 setInterval，API 和 useInterval 保持一致，好处是可以在页面不渲染的时候停止执行定时器，比如页面隐藏或最小化等。

请注意，如下两种情况下很可能是不适用的，优先考虑 useInterval ：

- 时间间隔小于 16ms
- 希望页面不渲染的情况下依然执行定时器

> Node 环境下 requestAnimationFrame 会自动降级到 setInterval

官方文档：

- [useRafInterval 官方文档](https://ahooks.js.org/zh-CN/hooks/use-raf-interval)
- [useRafTimeout 官方文档](https://ahooks.js.org/zh-CN/hooks/use-raf-timeout)

`useRafInterval` 与 `useRafTimeout` 的实现思路基本一致。下面就只举例 `useRafInterval`

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/userafinterval-demo1/)

每 1000ms，执行一次

```ts
import React, { useState } from 'react';
import { useRafInterval } from 'ahooks';

export default () => {
  const [count, setCount] = useState(0);

  useRafInterval(() => {
    setCount(count + 1);
  }, 1000);

  return <div>count: {count}</div>;
};
```

## 使用场景

假如希望在页面不可见的时候，不执行定时器，可以选择 useRafInterval 和 useRafTimeout，其内部是使用 requestAnimationFrame 进行实现。这是因为当 requestAnimationFrame() 运行在后台标签页或者隐藏的`<iframe>` 里时，requestAnimationFrame() 会被暂停调用。

## 核心实现

主要是借助 requestAnimationFrame API：

> window.requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行

主函数实现：

可以看出主函数实现与 `useInterval` 几乎一致，区别是封装了 `setRafInterval` 和 `clearRafInterval`

```ts
function useRafInterval(
  fn: () => void, // 要定时调用的函数
  delay: number | undefined, // 间隔时间，当取值 undefined 时会停止计时器
  options?: {
    immediate?: boolean; // 是否在首次渲染时立即执行
  },
) {
  const immediate = options?.immediate;

  const fnRef = useLatest(fn);
  const timerRef = useRef<Handle>();

  useEffect(() => {
    if (!isNumber(delay) || delay < 0) return;
    if (immediate) {
      fnRef.current();
    }
    timerRef.current = setRafInterval(() => {
      fnRef.current();
    }, delay);
    return () => {
      if (timerRef.current) {
        clearRafInterval(timerRef.current);
      }
    };
  }, [delay]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearRafInterval(timerRef.current);
    }
  }, []);

  return clear;
}
```

`setRafInterval` 的实现：

1. 判断是否支持 requestAnimationFrame，不支持则降级使用 setInterval
2. 定义 loop 函数，通过 requestAnimationFrame 去执行。
3. loop 函数实现：每次执行都需要记录当前时间，并用当前时间（current） - 开始时间（start），相减判断是否间隔时间，大于则执行回调函数，并更新最新开始时间（start）

```ts
const setRafInterval = function(
  callback: () => void,
  delay: number = 0,
): Handle {
  // 如果不支持 requestAnimationFrame，则降级使用 setInterval
  if (typeof requestAnimationFrame === typeof undefined) {
    return {
      id: setInterval(callback, delay),
    };
  }
  // 开始时间
  let start = new Date().getTime();
  const handle: Handle = {
    id: 0,
  };
  const loop = () => {
    const current = new Date().getTime();
    // 现在的时间减去开始时间是否大于间隔时间，是则更新开始时间
    if (current - start >= delay) {
      // 达到则执行我们的 callback 函数
      callback();
      start = new Date().getTime();
    }
    handle.id = requestAnimationFrame(loop);
  };
  handle.id = requestAnimationFrame(loop);
  return handle;
};
```

`clearRafInterval` 函数的实现：

```ts
function cancelAnimationFrameIsNotDefined(t: any): t is NodeJS.Timer {
  return typeof cancelAnimationFrame === typeof undefined;
}

// 清除定时器
const clearRafInterval = function(handle: Handle) {
  if (cancelAnimationFrameIsNotDefined(handle.id)) {
    return clearInterval(handle.id);
  }
  // cancelAnimationFrame：取消一个先前通过调用 window.requestAnimationFrame()方法添加到计划中的动画帧请求
  // 支持 requestAnimationFrame 则用 cancelAnimationFrame 清除定时器
  cancelAnimationFrame(handle.id);
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useRafInterval/index.ts)
