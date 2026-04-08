const BACKGROUND_LOG_PREFIX = "[MyHordes Summarizer][Background]";
const CONTENT_SCRIPT_PATH = "content/content-script.js";

function logBackgroundInfo(message, details) {
  if (typeof details === "undefined") {
    console.log(BACKGROUND_LOG_PREFIX, message);
    return;
  }

  console.log(BACKGROUND_LOG_PREFIX, message, details);
}

function logBackgroundError(message, details) {
  if (typeof details === "undefined") {
    console.error(BACKGROUND_LOG_PREFIX, message);
    return;
  }

  console.error(BACKGROUND_LOG_PREFIX, message, details);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function getExplicitTabUrl(tab) {
  if (!tab || typeof tab !== "object") {
    return "";
  }

  return isNonEmptyString(tab.url) ? tab.url : "";
}

function buildFailureResult(error, details) {
  return {
    ok: false,
    error: error,
    details: details
  };
}

function isMessagePortError(error) {
  return error && typeof error.message === "string" && error.message.includes("Receiving end does not exist");
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!Array.isArray(tabs) || tabs.length === 0) {
    return null;
  }

  return tabs[0];
}

async function injectContentScript(tabId) {
  logBackgroundInfo("Attempting to inject the content script into the active tab.", {
    tabId: tabId
  });

  await chrome.scripting.executeScript({
    target: {
      tabId: tabId
    },
    files: [CONTENT_SCRIPT_PATH]
  });
}

async function requestPageVerification(tabId) {
  return chrome.tabs.sendMessage(tabId, {
    type: "verifyForumPage"
  });
}

function isVerificationResponseValid(verification) {
  if (!verification || typeof verification !== "object") {
    return false;
  }

  return typeof verification.isMyHordesPage === "boolean"
    && typeof verification.isTownForumPage === "boolean"
    && typeof verification.currentUrl === "string"
    && typeof verification.townId === "string"
    && typeof verification.reason === "string";
}

async function verifyCurrentTabPage() {
  let activeTab;

  try {
    activeTab = await getActiveTab();
  } catch (error) {
    logBackgroundError("Failed to query the active tab.", error);
    return buildFailureResult(
      "Unable to read the active browser tab.",
      "chrome.tabs.query failed while trying to locate the current tab."
    );
  }

  if (!activeTab || typeof activeTab.id !== "number") {
    logBackgroundError("No usable active tab was returned.", activeTab);
    return buildFailureResult(
      "Unable to find an active browser tab.",
      "The extension could not find a current tab id to verify."
    );
  }

  const tabUrl = getExplicitTabUrl(activeTab);

  logBackgroundInfo("Checking current tab page.", {
    tabId: activeTab.id,
    tabUrl: tabUrl
  });

  try {
    const verification = await requestPageVerification(activeTab.id);

    if (!isVerificationResponseValid(verification)) {
      logBackgroundError("The content script returned an invalid verification payload.", verification);
      return buildFailureResult(
        "The page check returned incomplete data.",
        "The content script responded, but the verification payload was missing expected fields."
      );
    }

    return {
      ok: true,
      verification: verification
    };
  } catch (error) {
    logBackgroundError("The initial verification request failed.", error);

    if (isMessagePortError(error)) {
      try {
        await injectContentScript(activeTab.id);
        const verification = await requestPageVerification(activeTab.id);

        if (!isVerificationResponseValid(verification)) {
          logBackgroundError("The injected content script returned an invalid verification payload.", verification);
          return buildFailureResult(
            "The page check returned incomplete data after injecting the content script.",
            "The page accepted the injected content script, but the response was still incomplete."
          );
        }

        return {
          ok: true,
          verification: verification
        };
      } catch (injectionError) {
        logBackgroundError("Verification still failed after attempting to inject the content script.", injectionError);
        return buildFailureResult(
          "The extension could not connect to the current page.",
          "The content script was not available on this tab, and an on-demand injection attempt also failed. This is expected on unsupported pages such as browser internal pages or extension pages."
        );
      }
    }

    return buildFailureResult(
      "The extension could not verify the current page.",
      "Sending a message to the content script failed before any verification data was returned."
    );
  }
}

chrome.runtime.onMessage.addListener(function handleRuntimeMessage(message, sender, sendResponse) {
  if (!message || typeof message !== "object") {
    logBackgroundError("Received an invalid runtime message in the service worker.", message);
    return;
  }

  if (message.type !== "checkCurrentPage") {
    return;
  }

  verifyCurrentTabPage()
    .then(function handleVerificationResult(result) {
      logBackgroundInfo("Finished current tab verification.", result);
      sendResponse(result);
    })
    .catch(function handleVerificationFailure(error) {
      logBackgroundError("Unexpected failure while verifying the current tab.", error);
      sendResponse(buildFailureResult(
        "The extension hit an unexpected error while verifying the current page.",
        error && typeof error.message === "string"
          ? error.message
          : "An unknown error was thrown in the background service worker."
      ));
    });

  return true;
});

logBackgroundInfo("Service worker loaded.");
