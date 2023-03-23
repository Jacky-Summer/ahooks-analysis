# useCookieState

一个可以将状态存储在 Cookie 中的 Hook 。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-cookie-state)

## 基本用法

将 state 存储在 Cookie 中

[官方在线 Demo](https://ahooks.js.org/~demos/usecookiestate-demo1/)

刷新页面后，可以看到输入框中的内容被从 Cookie 中恢复了。

```ts
import React from 'react';
import { useCookieState } from 'ahooks';

export default () => {
  // useCookieStateString 表示 Cookie 的 key 值
  const [message, setMessage] = useCookieState('useCookieStateString');
  return (
    <input
      value={message}
      placeholder="Please enter some words..."
      onChange={e => setMessage(e.target.value)}
      style={{ width: 300 }}
    />
  );
};
```

## Cookie 相关

- [Document.cookie](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie)：获取并设置与当前文档相关联的 cookie。可以把它当成一个 getter and setter

JS 操作 cookie 常用的库是 [js-cookie](https://www.npmjs.com/package/js-cookie)，js-cookie 是一个上手简单，轻量的，处理 cookies 的库。它的优点是：

1. **简单易用**：直接通过 `js-cookie` 的 API 可以很容易操作 cookie
2. **轻量级**：`js-cookie` 压缩后小于 800 字节
3. **支持所有浏览器**
4. **安全性高**：`js-cookie` 带有防止 XSS 攻击的处理机制。它保证了 Cookie 的安全性，可以预防网络劫持或脚本注入等攻击方式。
5. **支持 ESM/AMD/CommonJs**

## 核心实现

useCookieState 返回的是`[state, setState]`格式

默认值的实现：

1. （优先级最高）如果本地 cookie 中已有该值，则直接读取。
2. 外部设置的默认值是函数则执行。否则直接返回（options.defaultValue）
3. 需要注意的是 options.defaultValue 定义的 Cookie 默认值，但不同步到本地 Cookie

```ts
function useCookieState(cookieKey: string, options: Options = {}) {
  const [state, setState] = useState<State>(() => {
    const cookieValue = Cookies.get(cookieKey);

    // 如果本地 cookie 中已有该值，则直接读取
    if (isString(cookieValue)) return cookieValue;
    // 外部设置的默认值是函数则执行
    if (isFunction(options.defaultValue)) {
      return options.defaultValue();
    }
    // 返回外部传入的默认值
    return options.defaultValue;
  });

  // 设置 Cookie 值
  const updateState = useMemoizedFn(
    (
      newValue: State | ((prevState: State) => State),
      newOptions: Cookies.CookieAttributes = {},
    ) => {
      // setState 可以更新 cookie options，会与 useCookieState 设置的 options 进行 merge 操作。
      const { defaultValue, ...restOptions } = { ...options, ...newOptions };
      setState(prevState => {
        const value = isFunction(newValue) ? newValue(prevState) : newValue;
        // 值为 undefined 则清除 cookie
        if (value === undefined) {
          Cookies.remove(cookieKey);
        } else {
          // 设置 cookie
          Cookies.set(cookieKey, value, restOptions);
        }
        return value;
      });
    },
  );

  return [state, updateState] as const;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useCookieState/index.ts)
