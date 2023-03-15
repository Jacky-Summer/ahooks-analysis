# useReactive

提供一种数据响应式的操作体验，定义数据状态不需要写 useState，直接修改属性即可刷新视图。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-reactive)

## 基本用法

这种用法跟 Vue 一样，实现了响应式修改数据

[官方在线 Demo](https://ahooks.js.org/~demos/usereactive-demo1/)

```ts
import React from 'react';
import { useReactive } from 'ahooks';

export default () => {
  const state = useReactive({
    count: 0,
    inputVal: '',
    obj: {
      value: '',
    },
  });

  return (
    <div>
      <p> state.count：{state.count}</p>

      <button style={{ marginRight: 8 }} onClick={() => state.count++}>
        state.count++
      </button>
      <button onClick={() => state.count--}>state.count--</button>

      <p style={{ marginTop: 20 }}> state.inputVal: {state.inputVal}</p>
      <input onChange={e => (state.inputVal = e.target.value)} />

      <p style={{ marginTop: 20 }}> state.obj.value: {state.obj.value}</p>
      <input onChange={e => (state.obj.value = e.target.value)} />
    </div>
  );
};
```

## 核心实现

本质是使用 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 代理进行数据劫持和修改。

- [WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)：WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的。WeakMap 的作用就是可以更有效的垃圾回收、释放内存
- [Reflect.get](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/get)：Reflect.get()方法与从对象 (target[key]) 中读取属性类似，但它是通过一个函数执行来操作的。

tip：由于 React 中更新页面状态值需要重新渲染，故 Proxy 代理改变/删除值后需要手动强制渲染更新

```ts
/**
 * target：需要取值的目标对象
 * propertyKey：需要获取的值的键值
 * receiver：如果target对象中指定了getter，receiver则为getter调用时的this值。
*/
Reflect.get(target, propertyKey[, receiver])
```

```ts
function useReactive<S extends Record<string, any>>(initialState: S): S {
  const update = useUpdate();
  const stateRef = useRef<S>(initialState);

  // useCreation 是 useMemo 或 useRef 的替代品。对于 useMemo 来说，useCreation能保证被 memo 的值一定不会被重计算
  const state = useCreation(() => {
    return observer(stateRef.current, () => {
      update(); // 强制组件重新渲染
    });
  }, []);

  return state;
}
```

核心是 `observer` 函数的实现：

```ts
function observer<T extends Record<string, any>>(
  initialVal: T,
  cb: () => void,
): T {
  const existingProxy = proxyMap.get(initialVal);

  // 添加缓存 防止重新构建proxy
  if (existingProxy) {
    return existingProxy;
  }

  // 防止代理已经代理过的对象
  // https://github.com/alibaba/hooks/issues/839
  if (rawMap.has(initialVal)) {
    return initialVal;
  }
  // 使用 Proxy 代理进行拦截和更新
  const proxy = new Proxy<T>(initialVal, {
    // 拦截对象的读取属性操作
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      // 如果值是对象，继续递归代理；否则直接返回属性值
      return isObject(res) ? observer(res, cb) : res;
    },
    // 设置属性值操作的捕获器
    set(target, key, val) {
      const ret = Reflect.set(target, key, val);
      cb(); // 属性赋值时触发回调
      return ret;
    },
    // 拦截对对象属性的删除操作
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key);
      cb(); // 删除属性时触发回调
      return ret;
    },
  });

  proxyMap.set(initialVal, proxy);
  rawMap.set(proxy, initialVal);

  return proxy;
}
```

结合上边代码，可以看到 `observer`函数的第二个参数回调函数的值是固定执行`update()`，故对属性进行`set`和`delete`操作都会重新渲染。

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useReactive/index.ts)
