# useLocalStorageState

将状态存储在 localStorage 中的 Hook 。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-local-storage-state)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/uselocalstoragestate-demo1)

将 state 存储在 localStorage 中

```ts
import React from 'react';
import { useLocalStorageState } from 'ahooks';

export default function() {
  const [message, setMessage] = useLocalStorageState<string | undefined>(
    'use-local-storage-state-demo1',
    {
      defaultValue: 'Hello~',
    },
  );

  return (
    <>
      <input
        value={message || ''}
        placeholder="Please enter some words..."
        onChange={e => setMessage(e.target.value)}
      />
      <button
        style={{ margin: '0 8px' }}
        type="button"
        onClick={() => setMessage('Hello~')}
      >
        Reset
      </button>
      <button type="button" onClick={() => setMessage(undefined)}>
        Clear
      </button>
    </>
  );
}
```

## 核心实现

实际上是实现了 createUseStorageState 方法，useLocalStorageState 是调用了 createUseStorageState 返回的结果。

useLocalStorageState 在往 localStorage 写入数据前，会先调用一次 serializer，在读取数据之后，会先调用一次 deserializer

```ts
// 判断是否为浏览器环境
const useLocalStorageState = createUseStorageState(() =>
  isBrowser ? localStorage : undefined,
);
```

- serializer：序列化方法（存入 storage 使用）
- deserializer：反序列化方法（从 storage 取出）
- getStoredValue：获取 storage 的值
- updateState： 更新 storage 状态值

```ts
// 序列化
const serializer = (value: T) => {
  if (options?.serializer) {
    // 支持自定义序列化
    return options?.serializer(value);
  }
  return JSON.stringify(value);
};

// 反序列化
const deserializer = (value: string) => {
  if (options?.deserializer) {
    // 支持自定义反序列化
    return options?.deserializer(value);
  }
  return JSON.parse(value);
};

// 获取 storage 的值
function getStoredValue() {
  try {
    const raw = storage?.getItem(key);
    if (raw) {
      // 反序列化取出值
      return deserializer(raw);
    }
  } catch (e) {
    console.error(e);
  }
  // raw 没值，则使用默认值
  if (isFunction(options?.defaultValue)) {
    return options?.defaultValue();
  }
  return options?.defaultValue;
}
```

对于普通的字符串，可能不需要默认的 JSON.stringify/JSON.parse 来序列化。

```ts
serializer: (v) => v ?? '',
deserializer: (v) => v,
```

再来看下 updateState 方法：

- 如果传入函数，优先取值函数执行后的结果
- 传入 undefined，则表示删除这条数据
- 否则直接设置值

```ts
// 定义 state 状态同步拿到 storage 值
const [state, setState] = useState<T>(() => getStoredValue());

// 当 key 更新的时候执行
// useUpdateEffect：忽略首次执行，只在依赖更新时执行
useUpdateEffect(() => {
  setState(getStoredValue());
}, [key]);

// 更新 storage 状态值
const updateState = (value: T | IFuncUpdater<T>) => {
  // 传入函数优先取函数执行后的结果
  const currentState = isFunction(value) ? value(state) : value;
  setState(currentState);

  // 值为 undefined，表示移除该 storage
  if (isUndef(currentState)) {
    storage?.removeItem(key);
  } else {
    // 否则直接设置值
    try {
      storage?.setItem(key, serializer(currentState));
    } catch (e) {
      console.error(e);
    }
  }
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useLocalStorageState/index.ts)
