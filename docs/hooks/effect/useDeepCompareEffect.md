## useDeepCompareEffect & useDeepCompareLayoutEffect

用法与 `useEffect/useLayoutEffect` 一致，但 deps 通过 [lodash isEqual](https://lodash.com/docs/4.17.15#isEqual) 进行深比较。

`useDeepCompareEffect` 与 `useDeepCompareLayoutEffect` 的区别只是参数不同，都调用了 `createDeepCompareEffect` 方法，下面就只介绍 `useDeepCompareEffect` 做例子

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-deep-compare-effect/)

### 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usedeepcompareeffect-demo1/)

```ts
import { useDeepCompareEffect } from 'ahooks';
import React, { useEffect, useState, useRef } from 'react';

export default () => {
  const [count, setCount] = useState(0);
  const effectCountRef = useRef(0);
  const deepCompareCountRef = useRef(0);

  useEffect(() => {
    effectCountRef.current += 1;
  }, [{}]);

  useDeepCompareEffect(() => {
    deepCompareCountRef.current += 1;
    return () => {
      // do something
    };
  }, [{}]);

  return (
    <div>
      <p>effectCount: {effectCountRef.current}</p>
      <p>deepCompareCount: {deepCompareCountRef.current}</p>
      <p>
        <button type="button" onClick={() => setCount(c => c + 1)}>
          reRender
        </button>
      </p>
    </div>
  );
};
```

### 核心实现

通过 useRef 保存上一次的依赖值，与当前的依赖对比（使用 lodash 的 isEqual 深比较方法），不同则将`signalRef.current` 的值加 1，并作为 useEffect 的依赖项，更新了 effect 函数就会重新执行。

- [lodash.isEqual](https://lodash.com/docs/4.17.15#isEqual)：通过深比较来确定两者的值是否相等

使用了 createDeepCompareEffect 方法

```ts
export default createDeepCompareEffect(useEffect);
```

createDeepCompareEffect 函数实现：

```ts
type EffectHookType = typeof useEffect | typeof useLayoutEffect;
type CreateUpdateEffect = (hook: EffectHookType) => EffectHookType;

const depsEqual = (aDeps: DependencyList = [], bDeps: DependencyList = []) => {
  return isEqual(aDeps, bDeps);
};

export const createDeepCompareEffect: CreateUpdateEffect = hook => (
  effect,
  deps,
) => {
  // ref 用于保存上一次 deps 依赖的值
  const ref = useRef<DependencyList>();
  // 通过 signalRef 的值改变来触发 hook(useEffect/useLayoutEffect) 中的回调函数
  const signalRef = useRef<number>(0);

  // 判断当前依赖于上一次依赖值相不相等（深比较）
  if (deps === undefined || !depsEqual(deps, ref.current)) {
    ref.current = deps; // 更新保存当前依赖作为上一次依赖值
    signalRef.current += 1; // 值改变，触发 effect 函数执行
  }

  hook(effect, [signalRef.current]);
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useDeepCompareEffect/index.tsx)
