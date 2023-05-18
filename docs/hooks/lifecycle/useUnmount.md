# useUnmount

在组件卸载（unmount）时执行的 Hook。

- [官方文档](https://ahooks.js.org/zh-CN/hooks/use-unmount)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/useunmount-demo1/)

```ts
import { useBoolean, useUnmount } from 'ahooks';
import { message } from 'antd';
import React from 'react';

const MyComponent = () => {
  useUnmount(() => {
    message.info('unmount');
  });

  return <p>Hello World!</p>;
};

export default () => {
  const [state, { toggle }] = useBoolean(true);

  return (
    <>
      <button type="button" onClick={toggle}>
        {state ? 'unmount' : 'mount'}
      </button>
      {state && <MyComponent />}
    </>
  );
};
```

## 核心实现

实现就只是在 useEffect 的返回值中执行传入的函数

```ts
const useUnmount = (fn: () => void) => {
  const fnRef = useLatest(fn);

  useEffect(
    () => () => {
      fnRef.current();
    },
    [],
  );
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useUnmount/index.ts)
