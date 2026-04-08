(function initializePopup() {
  const testButton = document.getElementById("test-button");
  const resultElement = document.getElementById("popup-result");

  if (!testButton || !resultElement) {
    return;
  }

  testButton.addEventListener("click", function handleTestClick() {
    resultElement.textContent = "Test button clicked.";
  });
})();
