## useLockFn

用于给一个异步函数增加竞态锁，防止并发执行。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-lock-fn)

### 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/uselockfn-demo1/)

**防止重复提交**

在 submit 函数执行完成前，其余的点击动作都会被忽略。

```ts
import { useLockFn } from 'ahooks';
import { message } from 'antd';
import React, { useState } from 'react';

function mockApiRequest() {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

export default () => {
  const [count, setCount] = useState(0);

  const submit = useLockFn(async () => {
    message.info('Start to submit');
    await mockApiRequest();
    setCount(val => val + 1);
    message.success('Submit finished');
  });

  return (
    <>
      <p>Submit count: {count}</p>
      <button onClick={submit}>Submit</button>
    </>
  );
};
```

### 使用场景

业务中点击某个按钮进行请求，当请求未完成时 ，再次点击不进行处理，需要等请求结果返回后才能发起下一次请求，防止并发执行

### 核心实现

实现思路：

1. 使用 useRef 记录锁的状态，请求时设置为 true，请求完成或请求失败时设置为 false。
2. 请求前判断锁的状态是否为 true，为 true 则不处理

```ts
function useLockFn<P extends any[] = any[], V extends any = any>(
  fn: (...args: P) => Promise<V>,
) {
  // 记录锁的状态
  const lockRef = useRef(false);

  return useCallback(
    async (...args: P) => {
      // 如果处于锁状态，则不执行
      if (lockRef.current) return;
      // 请求中，上锁
      lockRef.current = true;
      try {
        // 执行请求函数
        const ret = await fn(...args);
        // 请求完成，解锁
        lockRef.current = false;
        return ret;
      } catch (e) {
        // 请求失败，也需要解锁
        lockRef.current = false;
        throw e;
      }
    },
    [fn],
  );
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useLockFn/index.ts)
