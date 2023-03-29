# useSessionStorageState

将状态存储在 sessionStorage 中的 Hook。

同样调用了 createUseStorageState 方法，只需把 localStorage 改为 sessionStorage，其它一致；
这里就不展开写了

```ts
const useSessionStorageState = createUseStorageState(() =>
  isBrowser ? sessionStorage : undefined,
);
```
