# useUpdateEffect

`useUpdateEffect` 用法等同于 `useEffect`，但是会忽略首次执行，只在依赖更新时执行。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-update-effect)

API 与 React.useEffect 完全一致。

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/useupdateeffect-demo1/)

```ts
import React, { useEffect, useState } from 'react';
import { useUpdateEffect } from 'ahooks';

export default () => {
  const [count, setCount] = useState(0);
  const [effectCount, setEffectCount] = useState(0);
  const [updateEffectCount, setUpdateEffectCount] = useState(0);

  useEffect(() => {
    setEffectCount(c => c + 1);
  }, [count]);

  useUpdateEffect(() => {
    setUpdateEffectCount(c => c + 1);
    return () => {
      // do something
    };
  }, [count]); // you can include deps array if necessary

  return (
    <div>
      <p>effectCount: {effectCount}</p>
      <p>updateEffectCount: {updateEffectCount}</p>
      <p>
        <button type="button" onClick={() => setCount(c => c + 1)}>
          reRender
        </button>
      </p>
    </div>
  );
};
```

## 实现思路

- 初始化一个 isMounted 标识，默认为 false；首次 useEffect 执行完后置为 true
- 后续执行 useEffect 的时候判断 isMounted 标识是否为 true，true 则执行外部传入的 effect 函数；卸载的时候将 isMounted 标识重置为 false

## 核心实现

里面其实是实现了 createUpdateEffect 这个函数：

```ts
export default createUpdateEffect(useEffect);
```

```ts
type EffectHookType = typeof useEffect | typeof useLayoutEffect;

export const createUpdateEffect: (
  hook: EffectHookType,
) => EffectHookType = hook => (effect, deps) => {
  const isMounted = useRef(false);

  // for react-refresh
  hook(() => {
    // 卸载时重置 isMounted 为 false
    return () => {
      isMounted.current = false;
    };
  }, []);

  hook(() => {
    if (!isMounted.current) {
      // 首次执行完设置为 true
      isMounted.current = true;
    } else {
      // 第一次后则执行函数
      return effect();
    }
  }, deps);
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useUpdateEffect/index.ts)
