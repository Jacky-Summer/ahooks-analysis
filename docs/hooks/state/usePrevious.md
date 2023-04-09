# usePrevious

保存上一次状态的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-previous)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/useprevious-demo1/)

记录上次的 count 值

```ts
import { usePrevious } from 'ahooks';
import React, { useState } from 'react';

export default () => {
  const [count, setCount] = useState(0);
  const previous = usePrevious(count);
  return (
    <>
      <div>counter current value: {count}</div>
      <div style={{ marginBottom: 8 }}>counter previous value: {previous}</div>
      <button type="button" onClick={() => setCount(c => c + 1)}>
        increase
      </button>
      <button
        type="button"
        style={{ marginLeft: 8 }}
        onClick={() => setCount(c => c - 1)}
      >
        decrease
      </button>
    </>
  );
};
```

## 使用场景

实现新旧值的对比来处理一些逻辑

## 实现思路

每次状态变更的时候来比较值有没有发生变化：

1. 需要维护两个状态： prevRef（保存上一次状态值）和 curRef（当前状态值）
2. state 状态变更的时候，使用 shouldUpdate 参数判断是否发生变化。如果发生变化，先更新 prevRef 的值为上一个 curRef，将 curRef 的值更新为当前最新 state 值
3. shouldUpdate 支持自定义，由开发结合自身场景判断值是否变化，来更新上一次状态

### 核心实现

```ts
// 默认判断是否需要更新的函数
const defaultShouldUpdate = <T>(a?: T, b?: T) => !Object.is(a, b);

function usePrevious<T>(
  // 需要记录变化的值
  state: T,
  // 自定义判断值是否变化
  shouldUpdate: ShouldUpdateFunc<T> = defaultShouldUpdate,
): T | undefined {
  const prevRef = useRef<T>(); // 保存上一次状态值
  const curRef = useRef<T>(); // 当前状态值

  // 自定义 shouldUpdate 函数，判断值是否变化
  if (shouldUpdate(curRef.current, state)) {
    prevRef.current = curRef.current;
    curRef.current = state;
  }

  return prevRef.current;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/usePrevious/index.ts)
