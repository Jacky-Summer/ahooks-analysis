# useDebounceEffect

为 useEffect 增加防抖的能力。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-debounce-effect)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usedebounceeffect-demo1/)

```ts
import { useDebounceEffect } from 'ahooks';
import React, { useState } from 'react';

export default () => {
  const [value, setValue] = useState('hello');
  const [records, setRecords] = useState<string[]>([]);
  useDebounceEffect(
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

它的实现依赖于 `useDebounceFn` hook。

实现逻辑：本来 deps 更新，effect 函数就立即执行的；现在 deps 更新，执行 防抖函数 setFlag 来更新 flag，而 flag 又被 useUpdateEffect 监听，通过 useUpdateEffect Hook 来执行 effect 函数

```ts
function useDebounceEffect(
  // 执行函数
  effect: EffectCallback,
  // 依赖数组
  deps?: DependencyList,
  // 配置防抖的行为
  options?: DebounceOptions,
) {
  const [flag, setFlag] = useState({});

  const { run } = useDebounceFn(() => {
    setFlag({}); // 设置新的空对象，强制触发更新
  }, options);

  useEffect(() => {
    return run();
  }, deps);

  // 只在 flag 依赖更新时执行，但是会忽略首次执行
  useUpdateEffect(effect, [flag]);
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useDebounceEffect/index.ts)
