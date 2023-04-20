# useAsyncEffect

useEffect 支持异步函数。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-async-effect)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/useasynceffect-demo1/)

组件加载时进行异步的检查

```ts
import { useAsyncEffect } from 'ahooks';
import React, { useState } from 'react';

function mockCheck(): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 3000);
  });
}

export default () => {
  const [pass, setPass] = useState<boolean>();

  useAsyncEffect(async () => {
    setPass(await mockCheck());
  }, []);

  return (
    <div>
      {pass === undefined && 'Checking...'}
      {pass === true && 'Check passed.'}
    </div>
  );
};
```

## 为什么需要该 Hook

在使用 useEffect 进行数据获取的时候，如果使用 `async/await` 的时候，会看到控制台有警告：

> Warning: An effect function must not return anything besides a function, which is used for clean-up.
> It looks like you wrote useEffect(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately:

```ts
useEffect(async () => {
  const data = await fetchData();
}, [fetchData]);
```

第一个参数是函数，它可以不返回内容 (return undefined) 或一个销毁函数。如果返回的是异步函数（Promise），则会导致 React 在调用销毁函数的时候报错。返回值是异步，也难以预知代码的执行结果，可能出现难以定位的 Bug，故返回值不支持异步。

### 如何让 useEffect 支持使用异步函数

1.  自执行函数 IIFE

```ts
useEffect(async () => {
  (async function getData() {
    const data = await fetchData();
  })();
}, []);
```

2.  useEffect 里面抽离封装异步函数，再调用

```ts
useEffect(() => {
  const getData = async () => {
    const data = await fetchData();
  };
  getData();
}, []);
```

3.  外部定义异步函数，useEffect 直接调用

```ts
const getData = async () => {
  const data = await fetchData();
};
useEffect(() => {
  getData();
}, []);
```

4.  自定义 Hook 实现

useAsyncEffect 就是一种实现了，省略上面那些代码处理

### API

```ts
function useAsyncEffect(
  effect: () => AsyncGenerator | Promise,
  deps: DependencyList,
);
```

## 核心实现

- [Symbol.asyncIterator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) 符号指定了一个对象的默认异步迭代器。如果一个对象设置了这个属性，它就是异步可迭代对象，可用于 for await...of 循环。

ahooks 的实现使用了上述的第二种解决方式，不过还增加了 AsyncGenerator 支持

```ts
function useAsyncEffect(
  effect: () => AsyncGenerator<void, void, void> | Promise<void>,
  deps?: DependencyList,
) {
  // 判断是否为 AsyncGenerator
  function isAsyncGenerator(
    val: AsyncGenerator<void, void, void> | Promise<void>,
  ): val is AsyncGenerator<void, void, void> {
    return isFunction(val[Symbol.asyncIterator]);
  }

  useEffect(() => {
    // effect 异步函数
    const e = effect();
    let cancelled = false;
    async function execute() {
      // 如果是 Generator 异步函数，则通过 next() 的方式执行
      if (isAsyncGenerator(e)) {
        while (true) {
          const result = await e.next();
          // [Generator 函数执行完] 或 [当前 useEffect 已经被清理]
          if (result.done || cancelled) {
            break;
          }
        }
      } else {
        // Promise 函数
        await e;
      }
    }
    execute(); // 执行异步函数
    return () => {
      // 设置表示当前 useEffect 已执行完销毁操作的标识
      cancelled = true;
    };
  }, deps);
}
```

看到上面的实现，发现 useAsyncEffect 并没有百分百兼容 useEffect 用法，它的销毁函数是只设置了已清理标识：

```ts
return () => {
  cancelled = true;
};
```

这种做法的观点是认为延迟清除机制是不对的，应该是一种取消机制。否则，在钩子已经被取消之后，回调函数仍然有机会对外部状态产生影响。

具体可以看这个大佬的文章：[如何让 useEffect 支持 async...await？](https://juejin.cn/post/7108675095958126629#heading-4)

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useAsyncEffect/index.ts)
