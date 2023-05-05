# useThrottleFn

用来处理函数节流的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-debounce-effect)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/zh-CN/hooks/use-throttle-fn)

频繁调用 run，但只会每隔 500ms 执行一次相关函数。

```ts
import React, { useState } from 'react';
import { useThrottleFn } from 'ahooks';

export default () => {
  const [value, setValue] = useState(0);
  const { run } = useThrottleFn(
    () => {
      setValue(value + 1);
    },
    { wait: 500 },
  );

  return (
    <div>
      <p style={{ marginTop: 16 }}> Clicked count: {value} </p>
      <button type="button" onClick={run}>
        Click fast!
      </button>
    </div>
  );
};
```

## 核心实现

实现原理是调用封装 lodash 的 throttle 方法。

支持的选项，都是 [lodash.throttle](https://lodash.com/docs/4.17.15#throttle) 里面的参数：

```ts
interface ThrottleOptions {
  wait?: number; // 等待时间，单位为毫秒
  leading?: boolean; // 是否在延迟开始前调用函数
  trailing?: boolean; // 是否在延迟开始后调用函数
}
```

```ts
function useThrottleFn<T extends noop>(fn: T, options?: ThrottleOptions) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(
        `useThrottleFn expected parameter is a function, got ${typeof fn}`,
      );
    }
  }

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

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useThrottleFn/index.ts)
