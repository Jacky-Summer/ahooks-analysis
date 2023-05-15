# useUpdate

useUpdate 会返回一个函数，调用该函数会强制组件重新渲染。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-update)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/zh-CN/hooks/use-update)

强制组件重新渲染。

```ts
import React from 'react';
import { useUpdate } from 'ahooks';

export default () => {
  const update = useUpdate();

  return (
    <>
      <div>Time: {Date.now()}</div>
      <button type="button" onClick={update} style={{ marginTop: 8 }}>
        update
      </button>
    </>
  );
};
```

## 核心实现

这个实现比较简单，暴露一个函数，每次该函数执行的时候都是 `setState({})`，而对于 state 状态值本身并不重要。该 Hook 即是简化我们写法，当有特殊场景强制更新的时候。

```ts
const useUpdate = () => {
  const [, setState] = useState({});
  // 设置一个新的状态（新的空对象）以强制更新，暴露该函数
  return useCallback(() => setState({}), []);
};
```

这个也可以有其他方式的实现，比如 [react-use](https://github.com/streamich/react-use/blob/master/src/useUpdate.ts)：

```ts
import { useReducer } from 'react';

// 将 num 递增 1，然后对 1000000 取模；当 num 达到 1000000 时，它会重新回到 0。这是为了防止 num 变得过大
const updateReducer = (num: number): number => (num + 1) % 1_000_000;

export default function useUpdate(): () => void {
  const [, update] = useReducer(updateReducer, 0);

  return update;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useUpdate/index.ts)
