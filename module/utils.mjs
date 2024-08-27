/**
 * A helper for using Intl.NumberFormat within handlebars.
 * @param {number} value    The value to format.
 * @param {object} options  Options forwarded to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat}
 * @returns {string}
 */
export function formatNumber(value, options) {
  const formatter = new Intl.NumberFormat(game.i18n.lang, options)
  return formatter.format(value)
}
