/** Formats a number for Handlebars using Intl.NumberFormat. */
export function formatNumber(value, options) {
  const formatter = new Intl.NumberFormat(game.i18n.lang, options)
  return formatter.format(value)
}
