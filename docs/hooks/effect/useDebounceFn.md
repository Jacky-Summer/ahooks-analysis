# useDebounceFn

用来处理防抖函数的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-debounce-fn)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usedebouncefn-demo1/)

频繁调用 run，但只会在所有点击完成 500ms 后执行一次相关函数

```ts
import { useDebounceFn } from 'ahooks';
import React, { useState } from 'react';

export default () => {
  const [value, setValue] = useState(0);
  const { run } = useDebounceFn(
    () => {
      setValue(value + 1);
    },
    {
      wait: 500,
    },
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

支持的选项，都是 [lodash.debounce](https://lodash.com/docs/4.17.15#debounce) 里面的参数：

```ts
interface DebounceOptions {
  wait?: number; // 等待时间，单位为毫秒
  leading?: boolean; // 是否在延迟开始前调用函数
  trailing?: boolean; // 是否在延迟开始后调用函数
  maxWait?: number; // 最大等待时间，单位为毫秒
}
```

```ts
function useDebounceFn<T extends noop>(fn: T, options?: DebounceOptions) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(
        `useDebounceFn expected parameter is a function, got ${typeof fn}`,
      );
    }
  }

  // 最新的 fn 防抖函数
  const fnRef = useLatest(fn);

  // 默认是 1000 毫秒
  const wait = options?.wait ?? 1000;

  // 防抖函数
  const debounced = useMemo(
    () =>
      debounce(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    [],
  );

  // 卸载时取消防抖函数调用
  useUnmount(() => {
    debounced.cancel();
  });

  return {
    run: debounced, // 触发执行 fn
    cancel: debounced.cancel, // 取消当前防抖
    flush: debounced.flush, // 当前防抖立即调用
  };
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useDebounceFn/index.ts)
