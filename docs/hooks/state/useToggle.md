# useToggle

用于在两个状态值间切换的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-toggle)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usesetstate-demo2/)

接受两个可选参数，在它们之间进行切换。

```ts
import React from 'react';
import { useToggle } from 'ahooks';

export default () => {
  // Hello 表示左值（默认值）， World 表示右值（取反的状态值）
  const [state, { toggle, set, setLeft, setRight }] = useToggle(
    'Hello',
    'World',
  );

  return (
    <div>
      <p>Effects：{state}</p>
      <p>
        <button type="button" onClick={toggle}>
          Toggle
        </button>
        <button
          type="button"
          onClick={() => set('Hello')}
          style={{ margin: '0 8px' }}
        >
          Set Hello
        </button>
        <button type="button" onClick={() => set('World')}>
          Set World
        </button>
        <button type="button" onClick={setLeft} style={{ margin: '0 8px' }}>
          Set Left
        </button>
        <button type="button" onClick={setRight}>
          Set Right
        </button>
      </p>
    </div>
  );
};
```

**相关字段解释**

- state：状态值
- defaultValue：传入默认的状态值
- reverseValue：传入取反的状态值
- toggle：切换 state
- set：修改 state
- setLeft：设置为 defaultValue
- setRight：如果传入了 reverseValue, 则设置为 reverseValue。 否则设置为 defaultValue 的反值

先来看看它的类型定义

- 函数重载：针对不同参数个数和类型，推断返回值类型

```ts
const [state, { toggle, set, setLeft, setRight }] = useToggle(defaultValue?: boolean);
const [state, { toggle, set, setLeft, setRight }] = useToggle<T>(defaultValue: T);
const [state, { toggle, set, setLeft, setRight }] = useToggle<T, U>(defaultValue: T, reverseValue: U);
```

## 核心实现

实现比较简单：

1. 入参可传有两个值，第一个参数是默认值（左值）；第二个是取反之后的值（右值），可以不传；当不传的时候，为 defaultValue 的反值
2. 根据这两个值，实现函数 toggle、set、setLeft、setRight（该 Hook 忽略 defaultValue、reverseValue 这两个值的变更，也就是说无需监听；在使用中也需要注意，这两个值是固定值才可使用该 Hook）

```ts
function useToggle<D, R>(
  defaultValue: D = (false as unknown) as D,
  reverseValue?: R,
) {
  const [state, setState] = useState<D | R>(defaultValue);

  const actions = useMemo(() => {
    // 取反的状态值
    const reverseValueOrigin = (reverseValue === undefined
      ? !defaultValue
      : reverseValue) as D | R;

    // 切换值（左值与右值）
    const toggle = () =>
      setState(s => (s === defaultValue ? reverseValueOrigin : defaultValue));
    // 修改 state
    const set = (value: D | R) => setState(value);
    // 修改 state
    const setLeft = () => setState(defaultValue);
    // setRight：如果传入了 reverseValue, 则设置为 reverseValue。 否则设置为 defaultValue 的反值
    const setRight = () => setState(reverseValueOrigin);

    return {
      toggle,
      set,
      setLeft,
      setRight,
    };
    // useToggle ignore value change
    // }, [defaultValue, reverseValue]);
  }, []);

  return [state, actions];
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useToggle/index.ts)
