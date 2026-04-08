const CONTENT_LOG_PREFIX = "[MyHordes Summarizer][Content]";

function logContentInfo(message, details) {
  if (typeof details === "undefined") {
    console.log(CONTENT_LOG_PREFIX, message);
    return;
  }

  console.log(CONTENT_LOG_PREFIX, message, details);
}

function logContentError(message, details) {
  if (typeof details === "undefined") {
    console.error(CONTENT_LOG_PREFIX, message);
    return;
  }

  console.error(CONTENT_LOG_PREFIX, message, details);
}

function getSafeString(value) {
  return typeof value === "string" ? value : "";
}

function isMyHordesHostname(hostname) {
  return hostname === "myhordes.eu" || hostname.endsWith(".myhordes.eu");
}

function getPageVerificationInfo(currentLocation) {
  if (!currentLocation || typeof currentLocation !== "object") {
    logContentError("Cannot verify page because window.location is unavailable.");

    return {
      isMyHordesPage: false,
      isTownForumPage: false,
      currentUrl: "",
      townId: "",
      reason: "Location data is unavailable in the content script."
    };
  }

  const currentUrl = getSafeString(currentLocation.href);
  const hostname = getSafeString(currentLocation.hostname);
  const pathname = getSafeString(currentLocation.pathname);
  const pathMatch = pathname.match(/^\/jx\/forum\/(\d+)\/?$/);
  const isMyHordesPage = isMyHordesHostname(hostname);
  const isTownForumPage = Boolean(pathMatch);
  const townId = pathMatch ? pathMatch[1] : "";

  let reason = "The current page URL matches a supported MyHordes town forum page.";

  if (!currentUrl) {
    reason = "The current page URL is empty or unavailable.";
  } else if (!isMyHordesPage) {
    reason = "The current page is not on a supported MyHordes domain.";
  } else if (pathname === "/jx/forum" || pathname === "/jx/forum/") {
    reason = "The current page is the global forum, not a town forum page.";
  } else if (!isTownForumPage) {
    reason = "The current MyHordes page does not match the expected town forum URL pattern /jx/forum/<townId>.";
  }

  const verification = {
    isMyHordesPage: isMyHordesPage,
    isTownForumPage: isTownForumPage,
    currentUrl: currentUrl,
    townId: townId,
    reason: reason
  };

  logContentInfo("Verified current page context.", verification);

  return verification;
}

chrome.runtime.onMessage.addListener(function handleRuntimeMessage(message, sender, sendResponse) {
  if (!message || typeof message !== "object") {
    logContentError("Received an invalid runtime message in the content script.", message);
    return;
  }

  if (message.type !== "verifyForumPage") {
    return;
  }

  try {
    const verification = getPageVerificationInfo(window.location);
    sendResponse(verification);
  } catch (error) {
    logContentError("Failed while building the page verification response.", error);

    sendResponse({
      isMyHordesPage: false,
      isTownForumPage: false,
      currentUrl: window.location && typeof window.location.href === "string" ? window.location.href : "",
      townId: "",
      reason: "The content script hit an unexpected error while verifying the current page."
    });
  }
});

logContentInfo("Content script ready on page.", {
  url: window.location && typeof window.location.href === "string" ? window.location.href : ""
});
