/** Extends the basic Item with some very simple modifications. */
export default class FalloutZeroBackground extends Item {
  /** Augments the basic Item data model with additional dynamic data. */
  prepareData() {
    // Items can override data-preparation methods (e.g. prepareBaseData()) like actors.
    super.prepareData()
  }
}
