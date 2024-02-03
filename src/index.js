const { pinyin } = require("pinyin");

function convertToPinyin(
  hanzi,
  options = {
    segment: true,
    group: true,
  }
) {
  return pinyin(hanzi, options).join(" ");
}

module.exports = { convertToPinyin };
