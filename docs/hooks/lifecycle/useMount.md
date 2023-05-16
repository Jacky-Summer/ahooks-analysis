# useMount

只在组件初始化时执行的 Hook。

- [官方文档](https://ahooks.js.org/zh-CN/hooks/use-mount)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usemount-demo1/)

```ts
import { useMount, useBoolean } from 'ahooks';
import { message } from 'antd';
import React from 'react';

const MyComponent = () => {
  useMount(() => {
    message.info('mount');
  });

  return <div>Hello World</div>;
};

export default () => {
  const [state, { toggle }] = useBoolean(false);

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

实现就只是在 useEffect 封装了第一个参数回调（依赖为空数组）

```ts
const useMount = (fn: () => void) => {
  useEffect(() => {
    fn?.();
  }, []);
};
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useMount/index.ts)
