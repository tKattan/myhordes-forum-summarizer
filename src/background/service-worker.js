console.log("[MyHordes Summarizer] Service worker loaded.");

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0];
}

async function verifyCurrentTabPage() {
  const activeTab = await getActiveTab();

  if (!activeTab || typeof activeTab.id !== "number") {
    return {
      ok: false,
      error: "No active tab is available."
    };
  }

  try {
    const verification = await chrome.tabs.sendMessage(activeTab.id, {
      type: "verifyForumPage"
    });

    return {
      ok: true,
      verification: verification
    };
  } catch (error) {
    return {
      ok: false,
      error: "Unable to verify this page."
    };
  }
}

chrome.runtime.onMessage.addListener(function handleRuntimeMessage(message, sender, sendResponse) {
  if (!message || message.type !== "checkCurrentPage") {
    return;
  }

  verifyCurrentTabPage().then(function handleVerificationResult(result) {
    sendResponse(result);
  });

  return true;
});
