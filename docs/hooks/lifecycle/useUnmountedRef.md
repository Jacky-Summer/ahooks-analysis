# useUnmountedRef

获取当前组件是否已经卸载的 Hook。

- [官方文档](https://ahooks.js.org/zh-CN/hooks/use-unmounted-ref)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/useunmountedref-demo1/)

```ts
import { useBoolean, useUnmountedRef } from 'ahooks';
import { message } from 'antd';
import React, { useEffect } from 'react';

const MyComponent = () => {
  const unmountedRef = useUnmountedRef();
  useEffect(() => {
    setTimeout(() => {
      if (!unmountedRef.current) {
        message.info('component is alive');
      }
    }, 3000);
  }, []);

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

实现原理：通过判断有无执行 useEffect 中的返回值来判断组件是否已卸载。

```ts
const useUnmountedRef = () => {
  const unmountedRef = useRef(false);
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      // 组件卸载
      unmountedRef.current = true;
    };
  }, []);
  return unmountedRef;
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useUnmountedRef/index.ts)
