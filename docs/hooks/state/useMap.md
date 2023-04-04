# useMap

管理 Map 类型状态的 Hook。

[官方文档](https://ahooks.js.org/zh-CN/hooks/use-map)

## 基本用法

[官方在线 Demo](https://ahooks.js.org/~demos/usemap-demo1/)

```ts
import React from 'react';
import { useMap } from 'ahooks';

export default () => {
  const [map, { set, setAll, remove, reset, get }] = useMap<
    string | number,
    string
  >([
    ['msg', 'hello world'],
    [123, 'number type'],
  ]);

  return (
    <div>
      <button
        type="button"
        onClick={() => set(String(Date.now()), new Date().toJSON())}
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setAll([['text', 'this is a new Map']])}
        style={{ margin: '0 8px' }}
      >
        Set new Map
      </button>
      <button
        type="button"
        onClick={() => remove('msg')}
        disabled={!get('msg')}
      >
        Remove 'msg'
      </button>
      <button type="button" onClick={() => reset()} style={{ margin: '0 8px' }}>
        Reset
      </button>
      <div style={{ marginTop: 16 }}>
        <pre>{JSON.stringify(Array.from(map), null, 2)}</pre>
      </div>
    </div>
  );
};
```

## API

```ts
const [
  map, // Map 对象
  {
    set, // 添加元素
    setAll, // 生成一个新的 Map 对象
    remove, // remove
    reset, // 重置为默认值
    get // 获取元素
  }
] = useMap(initialValue?: Iterable<[any, any]>);
```

## Map

Map 对象保存键值对，并且能够记住键的原始插入顺序。任何值（对象或者基本类型）都可以作为一个键或一个值。详情可以看[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)

## 核心实现

- 由于 React state 是不可变数据，所以需要每次更改都需要创建一个新的 Map 对象。

```ts
function useMap<K, T>(initialValue?: Iterable<readonly [K, T]>) {
  // 获取默认的 Map 参数
  const getInitValue = () => {
    return initialValue === undefined ? new Map() : new Map(initialValue);
  };

  const [map, setMap] = useState<Map<K, T>>(() => getInitValue());

  // 添加元素
  const set = (key: K, entry: T) => {
    setMap(prev => {
      const temp = new Map(prev);
      temp.set(key, entry);
      return temp;
    });
  };

  // 生成一个新的 Map 对象
  const setAll = (newMap: Iterable<readonly [K, T]>) => {
    setMap(new Map(newMap));
  };

  // 移除元素
  const remove = (key: K) => {
    setMap(prev => {
      const temp = new Map(prev);
      temp.delete(key);
      return temp;
    });
  };

  // 重置为默认值
  const reset = () => setMap(getInitValue());

  // 获取元素
  const get = (key: K) => map.get(key);

  return [
    map,
    {
      // useMemoizedFn 持久化导出函数
      set: useMemoizedFn(set),
      setAll: useMemoizedFn(setAll),
      remove: useMemoizedFn(remove),
      reset: useMemoizedFn(reset),
      get: useMemoizedFn(get),
    },
  ] as const;
}
```

[完整源码](https://github.com/alibaba/hooks/blob/v3.7.4/packages/hooks/src/useMap/index.ts)
