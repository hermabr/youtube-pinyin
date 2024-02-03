document.addEventListener("DOMContentLoaded", function () {
  const toggleCheckbox = document.getElementById("toggle-subtitles");
  const widthValueDisplay = document.getElementById("width-value");
  const groupPinyinCheckbox = document.getElementById("group-pinyin");

  // Load saved settings and update UI
  chrome.storage.local.get(
    ["subtitlesActive", "subtitlesWidth"],
    function (result) {
      toggleCheckbox.checked = result.subtitlesActive !== false; // default to true
      widthValueDisplay.value = result.subtitlesWidth || 400; // default to 400
      groupPinyinCheckbox.value = result.groupPinyin !== false; // default to true
    }
  );

  // Listen for the toggle checkbox change
  toggleCheckbox.addEventListener("change", function () {
    const isActive = toggleCheckbox.checked;
    chrome.storage.local.set({ subtitlesActive: isActive });
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleSubtitles",
        active: isActive,
      });
    });
  });

  // Listen for the toggle checkbox change
  groupPinyinCheckbox.addEventListener("change", function () {
    const isActive = groupPinyinCheckbox.checked;
    chrome.storage.local.set({ groupPinyin: isActive });
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "setGroupPinyin",
        active: isActive,
      });
    });
  });

  // Listen for the width slider change
  widthValueDisplay.addEventListener("input", function () {
    const width = widthValueDisplay.value;
    // widthValueDisplay.textContent = `${width}px`;
    chrome.storage.local.set({ subtitlesWidth: width });
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "setWidth", width: width });
    });
  });
});
