# useThrottle

用来处理节流值的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-throttle)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usethrottle-demo1/)

ThrottledValue 每隔 500ms 变化一次。

```ts
import React, { useState } from 'react';
import { useThrottle } from 'ahooks';

export default () => {
  const [value, setValue] = useState<string>();
  const throttledValue = useThrottle(value, { wait: 500 });

  return (
    <div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Typed value"
        style={{ width: 280 }}
      />
      <p style={{ marginTop: 16 }}>throttledValue: {throttledValue}</p>
    </div>
  );
};
```

## 核心实现

来看看支持的选项，都是 [lodash.throttle](https://lodash.com/docs/4.17.15#throttle) 里面的参数：

```ts
interface ThrottleOptions {
  wait?: number; // 等待时间，单位为毫秒
  leading?: boolean; // 是否在延迟开始前调用函数
  trailing?: boolean; // 是否在延迟开始后调用函数
}
```

看代码实现主要是依赖 `useThrottleFn` 这个 Hook，这个 Hook 内部使用的是 lodash 的 throttle 方法。

```ts
function useThrottle<T>(value: T, options?: ThrottleOptions) {
  const [throttled, setThrottled] = useState(value);

  const { run } = useThrottleFn(() => {
    setThrottled(value);
  }, options);

  useEffect(() => {
    run();
  }, [value]);

  return throttled;
}
```

useThrottleFn 的实现：

```ts
function useThrottleFn<T extends noop>(fn: T, options?: ThrottleOptions) {
  // 最新的 fn 节流函数
  const fnRef = useLatest(fn);

  // 默认是 1000 毫秒
  const wait = options?.wait ?? 1000;

  // 节流函数
  const throttled = useMemo(
    () =>
      throttle(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    [],
  );

  // 卸载时取消节流函数调用
  useUnmount(() => {
    throttled.cancel();
  });

  return {
    run: throttled, // 触发执行 fn
    cancel: throttled.cancel, // 取消当前节流
    flush: throttled.flush, // 当前节流立即调用
  };
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useThrottle/index.ts)
