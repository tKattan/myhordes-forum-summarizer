function getPageVerificationInfo(currentLocation) {
  const currentUrl = currentLocation.href;
  const hostname = currentLocation.hostname;
  const pathMatch = currentLocation.pathname.match(/^\/jx\/forum\/(\d+)\/?$/);

  return {
    isMyHordesPage: hostname === "myhordes.eu" || hostname.endsWith(".myhordes.eu"),
    isTownForumPage: Boolean(pathMatch),
    currentUrl: currentUrl,
    townId: pathMatch ? pathMatch[1] : ""
  };
}

chrome.runtime.onMessage.addListener(function handleRuntimeMessage(message, sender, sendResponse) {
  if (!message || message.type !== "verifyForumPage") {
    return;
  }

  sendResponse(getPageVerificationInfo(window.location));
});
