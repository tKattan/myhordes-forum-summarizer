(function initializePopup() {
  const popupLogPrefix = "[MyHordes Summarizer][Popup]";
  const testButton = document.getElementById("test-button");
  const resultElement = document.getElementById("popup-result");

  function logPopupInfo(message, details) {
    if (typeof details === "undefined") {
      console.log(popupLogPrefix, message);
      return;
    }

    console.log(popupLogPrefix, message, details);
  }

  function logPopupError(message, details) {
    if (typeof details === "undefined") {
      console.error(popupLogPrefix, message);
      return;
    }

    console.error(popupLogPrefix, message, details);
  }

  function setResultText(message) {
    if (!resultElement) {
      logPopupError("Cannot update the popup result text because the result element is missing.");
      return;
    }

    resultElement.textContent = typeof message === "string" && message.length > 0
      ? message
      : "The extension did not produce a status message.";
  }

  function getFailureMessage(result) {
    if (!result || typeof result !== "object") {
      return "The background check returned no data.";
    }

    if (typeof result.error === "string" && result.error.length > 0) {
      if (typeof result.details === "string" && result.details.length > 0) {
        return result.error + " " + result.details;
      }

      return result.error;
    }

    return "The extension could not verify the current page and did not explain why.";
  }

  function getResultMessage(result) {
    if (!result || typeof result !== "object") {
      return "The popup did not receive a valid response from the background page check.";
    }

    if (!result.ok) {
      return getFailureMessage(result);
    }

    if (!result.verification || typeof result.verification !== "object") {
      return "The page check completed, but the verification payload was missing.";
    }

    const verification = result.verification;

    if (verification.isTownForumPage) {
      return "Supported MyHordes town forum page detected. Town id: "
        + verification.townId
        + ". URL: "
        + verification.currentUrl;
    }

    if (verification.isMyHordesPage) {
      return "This is a MyHordes page, but it is not the supported town forum page. " + verification.reason;
    }

    return "This tab is not on a supported MyHordes page. " + verification.reason;
  }

  if (!testButton || !resultElement) {
    logPopupError("Popup initialization failed because required DOM elements are missing.", {
      hasButton: Boolean(testButton),
      hasResult: Boolean(resultElement)
    });
    return;
  }

  testButton.addEventListener("click", async function handleTestClick() {
    setResultText("Checking the current tab and asking the content script to verify the page...");

    try {
      const result = await chrome.runtime.sendMessage({
        type: "checkCurrentPage"
      });

      logPopupInfo("Received page-check response from the background script.", result);
      setResultText(getResultMessage(result));
    } catch (error) {
      logPopupError("The popup failed while asking the background service worker to verify the page.", error);
      setResultText(
        "The popup could not reach the background service worker to verify the current page. "
        + "Check the extension service worker console for more details."
      );
    }
  });
})();
