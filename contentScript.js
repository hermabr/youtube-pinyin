const { convertToPinyin } = MyLib;

let subtitlesActive = true;
let pinyinContainerWidth = "400";
let groupPinyin = true;

function initializeScript() {
  chrome.storage.local.get(
    ["subtitlesActive", "subtitlesWidth", "groupPinyin"],
    function (result) {
      if (result.subtitlesActive !== undefined) {
        subtitlesActive = result.subtitlesActive;
      }
      if (result.subtitlesWidth !== undefined) {
        pinyinContainerWidth = result.subtitlesWidth;
      }
      if (result.subtitlesWidth !== undefined) {
        groupPinyin = result.groupPinyin;
      }

      observeSubtitleChanges();
      displayPinyinSubtitles();
    }
  );
}

function getPinyinContainer() {
  let pinyinContainer = document.querySelector("#pinyin-subtitles-container");
  if (!pinyinContainer) {
    pinyinContainer = document.createElement("div");
    pinyinContainer.id = "pinyin-subtitles-container";
    document.body.appendChild(pinyinContainer);

    const styles = {
      position: "absolute",
      zIndex: "1000",
      background: "rgba(8, 8, 8, 0.75)",
      color: "rgb(255, 255, 255)",
      fontSize: "24px",
      fontFamily:
        '"YouTube Noto", Roboto, "Arial Unicode Ms", Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif',
      whiteSpace: "pre-wrap",
      padding: "0 10px",
      textAlign: "left",
      overflow: "hidden",
      touchAction: "none",
      width: `${pinyinContainerWidth}px`,
    };

    Object.keys(styles).forEach((key) => {
      pinyinContainer.style[key] = styles[key];
    });
  }
  return pinyinContainer;
}

function displayPinyinSubtitles() {
  if (!subtitlesActive) {
    return;
  }
  const subtitleSpans = document.querySelectorAll(".caption-window");
  const fullSubtitleText = Array.from(subtitleSpans)
    .map((span) => span.textContent)
    .join("\n");
  const pinyinText = fullSubtitleText
    ? convertToPinyin(fullSubtitleText, {
        segment: groupPinyin,
        group: groupPinyin,
      })
    : "";

  const pinyinContainer = getPinyinContainer();
  if (pinyinText === "" || pinyinText === fullSubtitleText) {
    pinyinContainer.style.display = "none";
    return;
  } else {
    pinyinContainer.style.display = "";
  }

  const sampleCaptionSegment = document.querySelector(".ytp-caption-segment");
  if (sampleCaptionSegment) {
    pinyinContainer.style.fontSize = window
      .getComputedStyle(sampleCaptionSegment, null)
      .getPropertyValue("font-size");
  }

  pinyinContainer.textContent = pinyinText;

  if (subtitleSpans.length > 0) {
    const subtitleRect = subtitleSpans[0].getBoundingClientRect();
    pinyinContainer.style.left = `${subtitleRect.left}px`;
    pinyinContainer.style.bottom = `${
      window.innerHeight - subtitleRect.top + 10
    }px`;
  }
}

function observeSubtitleChanges() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        displayPinyinSubtitles();
        break;
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleSubtitles") {
    subtitlesActive = request.active;
    if (!subtitlesActive) {
      getPinyinContainer().style.display = "none";
    } else {
      getPinyinContainer().style.display = "";
    }
  } else if (request.action === "setWidth") {
    const pinyinContainer = getPinyinContainer();
    pinyinContainer.style.width = `${request.width}px`;
    pinyinContainerWIdth = request.width;
  } else if (request.action === "setGroupPinyin") {
    groupPinyin = request.active;
    displayPinyinSubtitles();
  }
});

initializeScript();
