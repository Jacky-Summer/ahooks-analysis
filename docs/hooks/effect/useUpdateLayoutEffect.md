# useUpdateLayoutEffect

`useUpdateLayoutEffect` 用法等同于 `useLayoutEffect`，但是会忽略首次执行，只在依赖更新时执行。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-update-layout-effect)

API 与 React.useLayoutEffect 完全一致。

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/useupdatelayouteffect-demo1/)

使用上与 useLayoutEffect 完全相同，只是它忽略了首次执行，且只在依赖项更新时执行。

```ts
import React, { useLayoutEffect, useState } from 'react';
import { useUpdateLayoutEffect } from 'ahooks';

export default () => {
  const [count, setCount] = useState(0);
  const [layoutEffectCount, setLayoutEffectCount] = useState(0);
  const [updateLayoutEffectCount, setUpdateLayoutEffectCount] = useState(0);

  useLayoutEffect(() => {
    setLayoutEffectCount(c => c + 1);
  }, [count]);

  useUpdateLayoutEffect(() => {
    setUpdateLayoutEffectCount(c => c + 1);
    return () => {
      // do something
    };
  }, [count]); // you can include deps array if necessary

  return (
    <div>
      <p>layoutEffectCount: {layoutEffectCount}</p>
      <p>updateLayoutEffectCount: {updateLayoutEffectCount}</p>
      <p>
        <button type="button" onClick={() => setCount(c => c + 1)}>
          reRender
        </button>
      </p>
    </div>
  );
};
```

## 核心实现

和 useUpdateEffect 一样，都是调用了 createUpdateEffect 方法，区别只是传入的 hook 是 useLayoutEffect。其余源码同上，就不再列举了

```ts
export default createUpdateEffect(useLayoutEffect);
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useLayoutEffect/index.ts)
