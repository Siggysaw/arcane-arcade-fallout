/** Custom element designed to display as a collapsible tray in chat. */
export default class ChatTrayElement extends HTMLElement {
  static observedAttributes = ['open']

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** Whether the tray is expanded or collapsed. */
  get open() {
    return this.hasAttribute('open')
  }

  set open(open) {
    if (open) this.setAttribute('open', '')
    else this.removeAttribute('open')
  }

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  /** @override */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') this._handleToggleOpen(newValue !== null)
  }

  /* -------------------------------------------- */

  /** Handles clicks on the collapsible header. */
  _handleClickHeader(event) {
    event.stopImmediatePropagation()
    if (!event.target.closest('.collapsible-content')) this.toggleAttribute('open')
  }

  /* -------------------------------------------- */

  /** Handles changing the collapsed state of this element. */
  _handleToggleOpen(open) {
    this.dispatchEvent(new Event('toggle'))

    this.querySelector('.collapsible')?.classList.toggle('collapsed', !open)

    // Clear the height from the chat popout container so that it appropriately resizes.
    const popout = this.closest('.chat-popout')
    if (popout) popout.style.height = ''
  }
}
