# useTrackedEffect

追踪是哪个依赖变化触发了 useEffect 的执行。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-tracked-effect)

## 基本用法

查看每次 effect 执行时发生变化的依赖项

[官方在线 Demo](https://ahooks.js.org/~demos/usetrackedeffect-demo1/)

```ts
import React, { useState } from 'react';
import { useTrackedEffect } from 'ahooks';

export default () => {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  useTrackedEffect(
    changes => {
      console.log('Index of changed dependencies: ', changes);
    },
    [count, count2],
  );

  return (
    <div>
      <p>Please open the browser console to view the output!</p>
      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount(c => c + 1)}>count + 1</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <p>Count2: {count2}</p>
        <button onClick={() => setCount2(c => c + 1)}>count + 1</button>
      </div>
    </div>
  );
};
```

## 核心实现

实现原理：通过 uesRef 记录上一次依赖的值，在当前执行的时候，判断当前依赖值和上次依赖值之间有无变化

- changes：变化的依赖 index 数组
- previousDeps：上一个依赖
- currentDeps：当前依赖

```ts
useTrackedEffect(
  effect: (changes: [], previousDeps: [], currentDeps: []) => (void | (() => void | undefined)),
  deps?: deps,
)
```

源码实现

```ts
const useTrackedEffect = (effect: Effect, deps?: DependencyList) => {
  const previousDepsRef = useRef<DependencyList>(); // 记录上次依赖

  useEffect(() => {
    // 判断依赖前后的 changes
    const changes = diffTwoDeps(previousDepsRef.current, deps);
    const previousDeps = previousDepsRef.current; // 赋值上次依赖
    previousDepsRef.current = deps;
    return effect(changes, previousDeps, deps);
  }, deps);
};
```

diffTwoDeps 方法实现：

1. 对前后两个 deps 依赖项列表使用 Object.is 进行严格相等性检查
2. 如果定义了 deps1，则遍历 deps1 并将每个元素与来自 deps2 的对应索引元素进行比较（因为这个函数只在这个钩子中使用，所以假设两个 deps 列表的长度总是相同的）
   - 相等返回 -1
   - 不相等返回索引值
   - 过滤小于 0 的值（即校验结果相等的）`.filter((ele) => ele >= 0)`，最终只返回变化的数组索引值

```ts
const diffTwoDeps = (deps1?: DependencyList, deps2?: DependencyList) => {
  // 对前后两个 deps 依赖项列表使用 Object.is 进行严格相等性检查
  return deps1
    ? deps1
        .map((_ele, idx) => (!Object.is(deps1[idx], deps2?.[idx]) ? idx : -1))
        .filter(ele => ele >= 0) // 过滤相等值
    : deps2
    ? deps2.map((_ele, idx) => idx)
    : [];
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useTrackedEffect/index.ts)
