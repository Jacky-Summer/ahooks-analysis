# useSetState

管理 object 类型 state 的 Hooks，用法与 class 组件的 this.setState 基本一致。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-set-state/)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usesetstate-demo1/)

```ts
import React from 'react';
import { useSetState } from 'ahooks';

interface State {
  hello: string;
  count: number;
  [key: string]: any;
}

export default () => {
  const [state, setState] = useSetState<State>({
    hello: '',
    count: 0,
  });

  return (
    <div>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <p>
        <button type="button" onClick={() => setState({ hello: 'world' })}>
          set hello
        </button>
        <button
          type="button"
          onClick={() => setState({ foo: 'bar' })}
          style={{ margin: '0 8px' }}
        >
          set foo
        </button>
        <button
          type="button"
          onClick={() => setState(prev => ({ count: prev.count + 1 }))}
        >
          count + 1
        </button>
      </p>
    </div>
  );
};
```

## 使用场景

setState 对象时想省略合并运算符，保证每一次设置值都是自动合并

## 实现思路

该 Hook 主要就是内部做了自动合并操作处理

可见 [官网 useState 解释](https://zh-hans.reactjs.org/docs/hooks-reference.html#usestate)

> 主要原因是因为 useState 不会自动合并更新对象，大部分情况下需要我们自己手动合并，因此提供了 useSetState hooks 来解决这个问题

```ts
const [state, setState] = useState({});
setState(prevState => {
  // 也可以使用 Object.assign
  return { ...prevState, ...updatedValues };
});
```

## 核心实现

```ts
const useSetState = <S extends Record<string, any>>(
  initialState: S | (() => S),
): [S, SetState<S>] => {
  const [state, setState] = useState<S>(initialState);

  // 自定义新的 setState 函数，返回自动合并的值
  const setMergeState = useCallback(patch => {
    setState(prevState => {
      // 传入的 patch 值是否为函数：如果是函数则执行，表示旧的状态。否则直接作为新的状态值
      const newState = isFunction(patch) ? patch(prevState) : patch;
      // 拓展运算符合并返回新的对象
      return newState ? { ...prevState, ...newState } : prevState;
    });
  }, []);

  return [state, setMergeState];
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useSetState/index.ts)
