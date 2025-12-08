(function () {
  // 防止重复注入
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.warn(
      'window.__REACT_DEVTOOLS_GLOBAL_HOOK__ exists',
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
    );
  }

  const hook = {
    // React 会通过 inject 方法注入内部 API
    inject(reactInternals) {
      console.log('[Hook] React internals injected:', reactInternals);
      this.reactInternals = reactInternals;
    },

    // 当 React 组件挂载时触发
    onCommitFiberRoot(rendererID, root) {
      console.log('[Hook] Commit fiber root:', { rendererID, root });
    },

    // 当 React 组件提交 Fiber 时触发
    onCommitFiberUnmount(rendererID, fiber) {
      console.log('[Hook] Unmount fiber:', { rendererID, fiber });
    },

    // React 会把 renderer 注入进来，通常是一个数字 ID
    renderers: new Map(),
    onCommitFiberTree() {}, // React 18 可能会用到
  };

  // 注入到全局
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;

  console.log('[Hook] Injected __REACT_DEVTOOLS_GLOBAL_HOOK__');
})();
