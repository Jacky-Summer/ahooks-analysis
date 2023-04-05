# useSet

管理 Set 类型状态的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-set)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/useset-demo1/)

```ts
import React from 'react';
import { useSet } from 'ahooks';

export default () => {
  const [set, { add, remove, reset }] = useSet(['Hello']);

  return (
    <div>
      <button type="button" onClick={() => add(String(Date.now()))}>
        Add Timestamp
      </button>
      <button
        type="button"
        onClick={() => remove('Hello')}
        disabled={!set.has('Hello')}
        style={{ margin: '0 8px' }}
      >
        Remove Hello
      </button>
      <button type="button" onClick={() => reset()}>
        Reset
      </button>
      <div style={{ marginTop: 16 }}>
        <pre>{JSON.stringify(Array.from(set), null, 2)}</pre>
      </div>
    </div>
  );
};
```

## API

```ts
const [
  set, // Set 对象
  {
    add, // 添加元素
    remove, // 移除元素
    reset // 重置为默认值
  }
] = useSet(initialValue?: Iterable<K>);
```

## Set

Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用。详情可以看[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set)

## 核心实现

- 由于 React state 是不可变数据，所以需要每次更改都需要创建一个新的 Set 对象。

```ts
function useSet<K>(initialValue?: Iterable<K>) {
  // 获取默认值
  const getInitValue = () => {
    // 通过 new Set() 构造函数，创建一个新的 Set 对象
    return initialValue === undefined ? new Set<K>() : new Set(initialValue);
  };

  const [set, setSet] = useState<Set<K>>(() => getInitValue());

  // 添加元素
  const add = (key: K) => {
    if (set.has(key)) {
      return;
    }
    setSet(prevSet => {
      const temp = new Set(prevSet);
      temp.add(key); // 在 Set 对象尾部添加一个元素。返回该 Set 对象。
      return temp;
    });
  };

  // 移除元素
  const remove = (key: K) => {
    if (!set.has(key)) {
      return;
    }
    setSet(prevSet => {
      const temp = new Set(prevSet);
      temp.delete(key);
      return temp;
    });
  };

  // 重置为默认值
  const reset = () => setSet(getInitValue());

  return [
    set,
    {
      add: useMemoizedFn(add),
      remove: useMemoizedFn(remove),
      reset: useMemoizedFn(reset),
    },
  ] as const;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useSet/index.ts)
