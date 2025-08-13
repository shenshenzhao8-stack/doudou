import debounce from './debounce';

const originalNavigateTo = (url, query) => {
  return new Promise((resolve, reject) => {
    tt.navigateTo({
      url: url,
      query: query,
      success: resolve,
      fail: reject
    });
  });
};

const navigateTo = debounce(
  ({
    url,
    query
  }) => {
    return originalNavigateTo(url, query);
  }, {
  immediate: true
});

const originalSwitchTab = (url, query) => {
  return new Promise((resolve, reject) => {
    tt.switchTab({
      url: url,
      query: query,
      success: resolve,
      fail: reject
    });
  });
};

const switchTab = debounce(({
  url,
  query
}) => {
  return originalSwitchTab(url, query);
}, {
  immediate: true
});

export {
  navigateTo,
  switchTab
}