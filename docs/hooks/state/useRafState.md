# useRafState

只在 [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) callback 时更新 state，一般用于性能优化。用法与 React.useState 一致

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-raf-state)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/zh-CN/hooks/use-raf-state)

```ts
import { useRafState } from 'ahooks';
import React, { useEffect } from 'react';

export default () => {
  const [state, setState] = useRafState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const onResize = () => {
      setState({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    };
    onResize();

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div>
      <p>Try to resize the window </p>
      current: {JSON.stringify(state)}
    </div>
  );
};
```

## requestAnimationFrame

> window.requestAnimationFrame()：告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行

与 setTimeout 相比，requestAnimationFrame 最大的优势是由系统来决定回调函数的执行时机，它能保证回调函数在屏幕每一次的刷新间隔中只被执行一次，这样就不会引起丢帧现象，也不会导致动画出现卡顿的问题。

> window.cancelAnimationFrame：取消一个先前通过调用 window.requestAnimationFrame()方法添加到计划中的动画帧请求。

## 使用场景

- state 操作是比较频繁的
- 实现频繁的动画效果

## 核心实现

主要是实现 setRafState 方法，在外部调用 setRafState 方法时，会取消上一次的 setState 回调函数，并执行 requestAnimationFrame 来控制 setState 的执行时机

```ts
function useRafState<S>(initialState?: S | (() => S)) {
  const ref = useRef(0);
  const [state, setState] = useState(initialState);

  const setRafState = useCallback((value: S | ((prevState: S) => S)) => {
    // 先取消上一次的 setRafState 操作
    cancelAnimationFrame(ref.current);

    ref.current = requestAnimationFrame(() => {
      // 在回调执行真正的 setState
      setState(value);
    });
  }, []);

  // 页面卸载时取消回调函数
  useUnmount(() => {
    cancelAnimationFrame(ref.current);
  });

  return [state, setRafState] as const;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useRafState/index.ts)
