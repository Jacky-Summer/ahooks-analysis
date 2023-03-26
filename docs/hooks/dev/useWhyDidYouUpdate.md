# useWhyDidYouUpdate

帮助开发者排查是那个属性改变导致了组件的 rerender。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-why-did-you-update)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usewhydidyouupdate-demo1/)

打开控制台，可以看到改变的属性。

```ts
import { useWhyDidYouUpdate } from 'ahooks';
import React, { useState } from 'react';

const Demo: React.FC<{ count: number }> = props => {
  const [randomNum, setRandomNum] = useState(Math.random());

  useWhyDidYouUpdate('useWhyDidYouUpdateComponent', { ...props, randomNum });

  return (
    <div>
      <div>
        <span>number: {props.count}</span>
      </div>
      <div>
        randomNum: {randomNum}
        <button
          onClick={() => setRandomNum(Math.random)}
          style={{ marginLeft: 8 }}
        >
          🎲
        </button>
      </div>
    </div>
  );
};

export default () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Demo count={count} />
      <div>
        <button onClick={() => setCount(prevCount => prevCount - 1)}>
          count -
        </button>
        <button
          onClick={() => setCount(prevCount => prevCount + 1)}
          style={{ marginLeft: 8 }}
        >
          count +
        </button>
      </div>
      <p style={{ marginTop: 8 }}>
        Please open the browser console to view the output!
      </p>
    </div>
  );
};
```

## 使用场景

- 检查哪些 props 发生改变
- 协助找出无效渲染：`useWhyDidYouUpdate` 会告诉我们监听数据中所有变化的数据，不管它是不是无效的更新，但还需要我们自己来区分识别哪些是无效更新的属性，从而进行优化。

## 实现思路

1. 使用 useRef 声明 prevProps 变量（确保拿到最新值），用来保存上一次的 props
2. 每次 useEffect 更新都置空 changedProps 对象，并将新旧 props 对象的属性提取出来，生成属性数组 allKeys
3. 遍历 allKeys 数组，去对比新旧属性值。如果不同，则记录到 changedProps 对象中
4. 如果 changedProps 有长度，则输出改变的内容，并更新 prevProps

## 核心实现

实现原理：通过 useEffect 拿到上一次 props 值 和当前 props 值 进行遍历比较，如果值发送改变则输出

```ts
// componentName：观测组件的名称
// props：需要观测的数据（当前组件 state 或者传入的 props 等可能导致 rerender 的数据）
export default function useWhyDidYouUpdate(
  componentName: string,
  props: IProps,
) {
  const prevProps = useRef<IProps>({});

  useEffect(() => {
    if (prevProps.current) {
      // 获取所有的需要观测的数据
      const allKeys = Object.keys({ ...prevProps.current, ...props });
      const changedProps: IProps = {}; // 发生改变的属性值

      allKeys.forEach(key => {
        // 通过 Object.is 判断是否进行更新
        if (!Object.is(prevProps.current[key], props[key])) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key],
          };
        }
      });

      // 遍历改变的属性，有值则输出日志
      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', componentName, changedProps);
      }
    }

    prevProps.current = props;
  });
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useWhyDidYouUpdate/index.ts)
