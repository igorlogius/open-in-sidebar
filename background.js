/* global browser */

const FIREFOX_VERSION = /rv:([0-9.]+)/.exec(navigator.userAgent)[1];
const MOBILE_USER_AGENT = `Mozilla/5.0 (Android 12; Mobile; rv:${FIREFOX_VERSION}) Gecko/${FIREFOX_VERSION} Firefox/${FIREFOX_VERSION}`;

function openUrl(url) {
  setTimeout(() => {
    browser.sidebarAction.setPanel({ panel: url });
  }, 1000);
}

function sendMobileUserAgent(info) {
  const headers = info.requestHeaders;
  for (let i = 0; i < headers.length; i++) {
    const name = headers[i].name.toLowerCase();
    if (name === "user-agent") {
      headers[i].value = MOBILE_USER_AGENT;
      break;
    }
  }
  return { requestHeaders: headers };
}

(async () => {
  [
    {
      title: "Open Link in Sidebar",
      contexts: ["link"],
      onclick: (info) => {
        browser.sidebarAction.open();
        openUrl(info.linkUrl);
      },
    },
    {
      title: "Open Page in Sidebar",
      contexts: ["page", "tab"],
      onclick: (info) => {
        browser.sidebarAction.open();
        openUrl(info.pageUrl);
      },
    },
    {
      title: "Open Bookmark in Sidebar",
      contexts: ["bookmark"],
      onclick: async (info) => {
        browser.sidebarAction.open();
        openUrl((await browser.bookmarks.get(info.bookmarkId))[0].url);
      },
    },
  ].forEach(async (item) => {
    console.debug(item);
    await browser.menus.create(item);
  });

  const requestFilter = {
    tabId: -1,
    types: ["main_frame"],
    urls: ["<all_urls>"],
  };

  browser.webRequest.onBeforeSendHeaders.addListener(
    sendMobileUserAgent,
    requestFilter,
    ["blocking", "requestHeaders"]
  );
})();
