# useResetState

提供重置 state 方法的 Hooks，用法与 React.useState 基本一致。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-reset-state)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/useresetstate-demo1/)

```ts
import React from 'react';
import { useResetState } from 'ahooks';

interface State {
  hello: string;
  count: number;
}

export default () => {
  const [state, setState, resetState] = useResetState<State>({
    hello: '',
    count: 0,
  });

  return (
    <div>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <p>
        <button
          type="button"
          style={{ marginRight: '8px' }}
          onClick={() => setState({ hello: 'world', count: 1 })}
        >
          set hello and count
        </button>

        <button type="button" onClick={resetState}>
          resetState
        </button>
      </p>
    </div>
  );
};
```

## 核心实现

实现原理是直接使用初始值作为 setState 的参数。说白了就是语义化（提供 reset 开头命名的函数）和偷懒（少传了个初始值参数）的写法。

```ts
const useResetState = <S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>, ResetState] => {
  const [state, setState] = useState(initialState);

  // 重置 state
  // useMemoizedFn：持久化函数 Hook
  const resetState = useMemoizedFn(() => {
    setState(initialState);
  });

  return [state, setState, resetState];
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useResetState/index.ts)
