# useGetState

给 React.useState 增加了一个 getter 方法，以获取当前最新值。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-get-state)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usegetstate-demo1/)

计数器每 3 秒打印一次值

```ts
import React, { useEffect } from 'react';
import { useGetState } from 'ahooks';

export default () => {
  const [count, setCount, getCount] = useGetState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // 在这里使用 count 无法获取到最新值
      console.log('interval count', getCount());
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <button onClick={() => setCount(count => count + 1)}>count: {count}</button>
  );
};
```

## 核心实现

实现原理是使用 useRef 来保存最新的 state 值，暴露一个 getState 直接返回 stateRef.current 即可

```ts
function useGetState<S>(initialState?: S) {
  const [state, setState] = useState(initialState);
  // 使用 useRef 保存最新 state
  const stateRef = useRef(state);
  stateRef.current = state;
  // 获取当前最新值
  const getState = useCallback(() => stateRef.current, []);

  return [state, setState, getState];
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useGetState/index.ts)
