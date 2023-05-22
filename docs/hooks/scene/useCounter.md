# useCounter

管理计数器的 Hook。

- [官方文档](https://ahooks.js.org/zh-CN/hooks/use-counter)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usecounter-demo1/)

简单的 counter 管理示例。

```ts
import React from 'react';
import { useCounter } from 'ahooks';

export default () => {
  const [current, { inc, dec, set, reset }] = useCounter(100, {
    min: 1,
    max: 10,
  });

  return (
    <div>
      <p>{current} [max: 10; min: 1;]</p>
      <div>
        <button
          type="button"
          onClick={() => {
            inc();
          }}
          style={{ marginRight: 8 }}
        >
          inc()
        </button>
        <button
          type="button"
          onClick={() => {
            dec();
          }}
          style={{ marginRight: 8 }}
        >
          dec()
        </button>
        <button
          type="button"
          onClick={() => {
            set(3);
          }}
          style={{ marginRight: 8 }}
        >
          set(3)
        </button>
        <button type="button" onClick={reset} style={{ marginRight: 8 }}>
          reset()
        </button>
      </div>
    </div>
  );
};
```

## 核心实现

这个 hooks 的实现不难，其实就是内部封装暴露相应方法对数值进行管理。

```ts
function useCounter(initialValue: number = 0, options: Options = {}) {
  // 获取外部传入的最小值与最大值
  const { min, max } = options;

  const [current, setCurrent] = useState(() => {
    return getTargetValue(initialValue, {
      min,
      max,
    });
  });
  // 设置值（支持传入 number 类型或函数）
  const setValue = (value: ValueParam) => {
    setCurrent(c => {
      const target = isNumber(value) ? value : value(c);
      return getTargetValue(target, {
        max,
        min,
      });
    });
  };

  // 增加数值（默认加1）
  const inc = (delta: number = 1) => {
    setValue(c => c + delta);
  };
  // 减少数值（默认减1）
  const dec = (delta: number = 1) => {
    setValue(c => c - delta);
  };
  // 设置值
  const set = (value: ValueParam) => {
    setValue(value);
  };
  // 重置为初始值
  const reset = () => {
    setValue(initialValue);
  };

  return [
    current,
    {
      inc: useMemoizedFn(inc),
      dec: useMemoizedFn(dec),
      set: useMemoizedFn(set),
      reset: useMemoizedFn(reset),
    },
  ] as const;
}
```

接下来重点看看 `getTargetValue` 的实现，该方法利用 `Math.min` 和 `Math.max` 进行取值，最终保证返回的值范围是大于等于 min，小于等于 max。

```js
// 获取目标数值
function getTargetValue(val: number, options: Options = {}) {
  const { min, max } = options;
  let target = val;
  if (isNumber(max)) {
    // 取小于等于 max 的值
    target = Math.min(max, target);
  }
  if (isNumber(min)) {
    // 取大于等于 min 的值
    target = Math.max(min, target);
  }
  return target;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useCounter/index.ts)
