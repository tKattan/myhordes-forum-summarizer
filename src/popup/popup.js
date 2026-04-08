(function initializePopup() {
  const testButton = document.getElementById("test-button");
  const resultElement = document.getElementById("popup-result");

  if (!testButton || !resultElement) {
    return;
  }

  function getResultMessage(result) {
    if (!result || !result.ok || !result.verification) {
      return "Unable to verify the current page.";
    }

    if (result.verification.isTownForumPage) {
      return "Supported town forum page detected (town " + result.verification.townId + ").";
    }

    if (result.verification.isMyHordesPage) {
      return "This MyHordes page is not the supported town forum page.";
    }

    return "This page is not a supported MyHordes page.";
  }

  testButton.addEventListener("click", async function handleTestClick() {
    resultElement.textContent = "Checking current page...";

    try {
      const result = await chrome.runtime.sendMessage({
        type: "checkCurrentPage"
      });

      resultElement.textContent = getResultMessage(result);
    } catch (error) {
      resultElement.textContent = "Unable to verify the current page.";
    }
  });
})();
