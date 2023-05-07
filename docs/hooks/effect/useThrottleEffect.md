# useThrottleEffect

为 useEffect 增加节流的能力。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-throttle-effect)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usethrottleeffect-demo1/)

```ts
import React, { useState } from 'react';
import { useThrottleEffect } from 'ahooks';

export default () => {
  const [value, setValue] = useState('hello');
  const [records, setRecords] = useState<string[]>([]);
  useThrottleEffect(
    () => {
      setRecords(val => [...val, value]);
    },
    [value],
    {
      wait: 1000,
    },
  );
  return (
    <div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Typed value"
        style={{ width: 280 }}
      />
      <p style={{ marginTop: 16 }}>
        <ul>
          {records.map((record, index) => (
            <li key={index}>{record}</li>
          ))}
        </ul>
      </p>
    </div>
  );
};
```

## 核心实现

它的实现依赖于 `useThrottleFn` hook，具体实现逻辑同 useDebounceEffect，只是把 `useDebounceFn` 换成 `useThrottleFn`

```ts
function useThrottleEffect(
  // 执行函数
  effect: EffectCallback,
  // 依赖数组
  deps?: DependencyList,
  // 配置节流的行为
  options?: ThrottleOptions,
) {
  const [flag, setFlag] = useState({});

  const { run } = useThrottleFn(() => {
    setFlag({}); // 设置新的空对象，强制触发更新
  }, options);

  useEffect(() => {
    return run();
  }, deps);

  // 只在 flag 依赖更新时执行，但是会忽略首次执行
  useUpdateEffect(effect, [flag]);
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useThrottleEffect/index.ts)
