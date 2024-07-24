function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export async function getTableFromPack(pack, table) {
  const foundPack = game.packs.get(pack)
  const entry = Array.from(foundPack.index).find((e) => e.name == capitalizeFirstLetter(table))
  return await foundPack.getDocument(entry?._id)
}
