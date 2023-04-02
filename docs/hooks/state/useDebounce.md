# useDebounce

用来处理防抖值的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-debounce)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usedebounce-demo1/)

DebouncedValue 只会在输入结束 500ms 后变化。

```ts
import React, { useState } from 'react';
import { useDebounce } from 'ahooks';

export default () => {
  const [value, setValue] = useState<string>();
  const debouncedValue = useDebounce(value, { wait: 500 });

  return (
    <div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Typed value"
        style={{ width: 280 }}
      />
      <p style={{ marginTop: 16 }}>DebouncedValue: {debouncedValue}</p>
    </div>
  );
};
```

## 核心实现

来看看支持的选项，都是 [lodash.debounce](https://lodash.com/docs/4.17.15#debounce) 里面的参数：

```ts
interface DebounceOptions {
  wait?: number; // 等待时间，单位为毫秒
  leading?: boolean; // 是否在延迟开始前调用函数
  trailing?: boolean; // 是否在延迟开始后调用函数
  maxWait?: number; // 最大等待时间，单位为毫秒
}
```

看代码实现主要是依赖 `useDebounceFn` 这个 Hook，这个 Hook 内部使用的是 lodash 的 debounce 方法。

```ts
function useDebounce<T>(value: T, options?: DebounceOptions) {
  const [debounced, setDebounced] = useState(value);

  const { run } = useDebounceFn(() => {
    setDebounced(value);
  }, options);

  // 监听需要防抖的值变化
  useEffect(() => {
    run(); // 变化就执行 debounced 函数
  }, [value]);

  return debounced;
}
```

useDebounceFn 的实现：

```ts
/** 用来处理防抖函数的 Hook。 */
function useDebounceFn<T extends noop>(fn: T, options?: DebounceOptions) {
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

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useDebounce/index.ts)
