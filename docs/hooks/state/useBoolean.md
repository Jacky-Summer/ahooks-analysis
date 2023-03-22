# useBoolean

优雅的管理 boolean 状态的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-boolean)

## 基本用法

上面讲了 `useToggle`，而 `useBoolean` 是 useToggle 的其中一种使用场景，下面是 useToggle 的其中一种函数类型定义：

```ts
const [state, { toggle, set, setLeft, setRight }] = useToggle(defaultValue?: boolean);
```

[官方在线 Demo](https://ahooks.js.org/~demos/useboolean-demo1/)

切换 boolean，可以接收默认值。

```ts
import React from 'react';
import { useBoolean } from 'ahooks';

export default () => {
  const [state, { toggle, setTrue, setFalse }] = useBoolean(true);

  return (
    <div>
      <p>Effects：{JSON.stringify(state)}</p>
      <p>
        <button type="button" onClick={toggle}>
          Toggle
        </button>
        <button type="button" onClick={setFalse} style={{ margin: '0 16px' }}>
          Set false
        </button>
        <button type="button" onClick={setTrue}>
          Set true
        </button>
      </p>
    </div>
  );
};
```

**相关字段解释**

- toggle：切换 state
- set：设置 state
- setTrue：设置为 true
- setFalse：设置为 false

## 核心实现

有了 useToggle 的基础，实现比较简单，直接看代码：

```ts
export default function useBoolean(defaultValue = false): [boolean, Actions] {
  const [state, { toggle, set }] = useToggle(defaultValue);

  const actions: Actions = useMemo(() => {
    const setTrue = () => set(true);
    const setFalse = () => set(false);
    return {
      toggle,
      set: v => set(!!v),
      setTrue,
      setFalse,
    };
  }, []);

  return [state, actions];
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useBoolean/index.ts)
