import { defineConfig } from 'dumi';

const repo = 'ahooks-analysis';

export default defineConfig({
  title: repo,
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  mode: 'site',
  hash: true,
  // Because of using GitHub Pages
  base: `/${repo}/`,
  publicPath: `/${repo}/`,
  navs: [
    {
      title: '指南',
      path: '/guide',
    },
    {
      title: 'Hooks',
      path: '/hooks',
    },
    {
      title: 'ahooks 官网',
      path: 'https://ahooks.js.org/zh-CN',
    },
    {
      title: 'GitHub',
      path: 'https://github.com/Jacky-Summer/ahooks-analysis',
    },
    {
      title: '关于我',
      path: 'https://github.com/Jacky-Summer',
    },
  ],
  locales: [['zh-CN', '中文']],
  menus: {
    '/hooks': [
      {
        title: 'Dom',
        children: [
          'hooks/dom/useEventListener',
          'hooks/dom/useClickAway',
          'hooks/dom/useDocumentVisibility',
          'hooks/dom/useDrop',
          'hooks/dom/useDrag',
          'hooks/dom/useEventTarget',
          'hooks/dom/useExternal',
          'hooks/dom/useTitle',
          'hooks/dom/useFavicon',
          'hooks/dom/useFullscreen',
          'hooks/dom/useHover',
          'hooks/dom/useInViewport',
          'hooks/dom/useKeyPress',
          'hooks/dom/useLongPress',
          'hooks/dom/useMouse',
          'hooks/dom/useResponsive',
          'hooks/dom/useScroll',
          'hooks/dom/useSize',
          'hooks/dom/useFocusWithin',
          'hooks/advanced/useControllableValue',
          'hooks/advanced/useCreation',
          'hooks/advanced/useEventEmitter',
          'hooks/advanced/useIsomorphicLayoutEffect',
          'hooks/advanced/useLatest',
          'hooks/advanced/useMemoizedFn',
          'hooks/advanced/useReactive',
          'hooks/state/useSetState',
          'hooks/state/useToggle',
          'hooks/state/useBoolean',
          'hooks/state/useCookieState',
          'hooks/state/useLocalStorageState',
          'hooks/state/useSessionStorageState',
          'hooks/state/useDebounce',
          'hooks/dev/useTrackedEffect',
          'hooks/dev/useWhyDidYouUpdate',
        ],
      },
    ],
  },
  // more config: https://d.umijs.org/config
});
