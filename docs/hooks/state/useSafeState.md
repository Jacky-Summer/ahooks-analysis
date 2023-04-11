# useSafeState

用法与 React.useState 完全一样，但是在组件卸载后异步回调内的 setState 不再执行，避免因组件卸载后更新状态而导致的内存泄漏。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-safe-state)

警告内容如下：

> Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.

升级 React 18 后官方已经移除了该警告，所以后续无需考虑该告警了，也不再需要这个 useSafeState Hook 了，详情可见该文章：[React 18 对 Hooks 的影响：一](https://juejin.cn/post/7081171944799731720)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usesafestate-demo1/)

```ts
import { useSafeState } from 'ahooks';
import React, { useEffect, useState } from 'react';

const Child = () => {
  const [value, setValue] = useSafeState<string>();

  useEffect(() => {
    setTimeout(() => {
      setValue('data loaded from server');
    }, 5000);
  }, []);

  const text = value || 'Loading...';

  return <div>{text}</div>;
};

export default () => {
  const [visible, setVisible] = useState(true);

  return (
    <div>
      <button onClick={() => setVisible(false)}>Unmount</button>
      {visible && <Child />}
    </div>
  );
};
```

## 核心实现

内部使用了[useUnmountedRef](https://ahooks.js.org/zh-CN/hooks/use-unmounted-ref) 这个 Hook 来获取当前组件是否已卸载，该 Hook 原理是通过判断有无执行 useEffect 的卸载函数，在其标识为已卸载。

```ts
useEffect(() => {
  return () => {
    // 可设置卸载标识
  };
}, []);
```

useSafeState 实现原理则是依据 unmountedRef 标识，在外部执行 `setCurrentState` 的时候，判断如果标识为 true（已卸载），则 return 停止更新

```ts
function useSafeState<S>(initialState?: S | (() => S)) {
  // useUnmountedRef：获取当前组件是否已卸载
  const unmountedRef = useUnmountedRef();
  const [state, setState] = useState(initialState);
  const setCurrentState = useCallback(currentState => {
    // 如果组件卸载了则停止更新
    if (unmountedRef.current) return;
    setState(currentState);
  }, []);

  return [state, setCurrentState] as const;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useSafeState/index.ts)
