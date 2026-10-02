const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class ChooseBackground extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(backgrounds) {
        super()
        this.backgrounds = backgrounds
        this.searchQuery = ''
    }

    #choice = null
    get choice() {
        return this.#choice
    }

    static DEFAULT_OPTIONS = {
      form: {
        submitOnChange: false,
        closeOnSubmit: true,
      },
      actions: {
        background: ChooseBackground.onBackgroundChoice,
        cancel: ChooseBackground.onCancel,
      },
      classes: ['pipboy-dialog'],
      position: { width: 900 },
      window: {
        title: 'Choose your Background!',
        resizable: true
      }
    };

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/level-up/dialog/choose-background.hbs',
            scrollable: [""]
        },
    }

    static #onSubmit(choice) {
      this.choice = choice
    }

    static async create() {
      const backgroundPack = game.packs.find((p) => p.collection === 'arcane-arcade-fallout.background')
      const allBackgrounds = await backgroundPack.getDocuments()
      const backgrounds = allBackgrounds.sort((a, b) => a.name.localeCompare(b.name))

      this.app = new this(backgrounds);

      const { promise, resolve } = Promise.withResolvers();
      this.app.addEventListener("close", () => resolve(this.choice), { once: true });
      this.app.render({ force: true });
      return promise;
    }

    async _prepareContext() {
        return {
            backgrounds: this.backgrounds,
            searchQuery: this.searchQuery,
        }
    }

    _onRender() {
        const searchInput = this.element.querySelector('[data-search]')
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = 'true'
            searchInput.addEventListener('input', (e) => this.onSearchInput(e))
            searchInput.addEventListener('keydown', (e) => this.onSearchKeydown(e))
            searchInput.addEventListener('blur', () => { this._searchFocused = false })
        }
        if (this._searchFocused && searchInput) {
            searchInput.focus()
            const pos = this._searchCursorPos ?? searchInput.value.length
            searchInput.setSelectionRange(pos, pos)
        }

        this._applyBackgroundFilter()
    }

    _applyBackgroundFilter() {
        const grid = this.element.querySelector('[data-background-grid]')
        if (!grid) return

        const query = (this.searchQuery ?? '').trim().toLowerCase()
        const cards = grid.querySelectorAll('.background-card')
        const visible = []

        cards.forEach((card) => {
            const name = (card.dataset.itemName ?? '').toLowerCase()
            const matches = !query || name.includes(query)
            card.classList.toggle('is-hidden', !matches)
            card.classList.remove('background-match')
            if (matches) visible.push(card)
        })

        if (query && visible.length === 1) {
            visible[0].classList.add('background-match')
        }

        const emptyMessage = grid.querySelector('[data-empty-message]')
        if (emptyMessage) emptyMessage.hidden = visible.length > 0
    }

    onSearchInput(e) {
        this.searchQuery = e.currentTarget.value
        this._searchFocused = true
        this._searchCursorPos = e.currentTarget.selectionStart
        this._applyBackgroundFilter()
    }

    onSearchKeydown(e) {
        if (e.key !== 'Enter') return
        e.preventDefault()
        const grid = this.element.querySelector('[data-background-grid]')
        if (!grid) return
        const visible = [...grid.querySelectorAll('.background-card:not(.is-hidden)')]
        if (visible.length !== 1) return
        visible[0].querySelector('[data-action="background"]')?.click()
    }

    static onBackgroundChoice(e, target) {
        const { itemId } = target.dataset
        const choice = this.backgrounds.find((background) => background.id === itemId)
        ChooseBackground.#onSubmit(choice)
        this.close()
    }

    static onCancel() {
        ChooseBackground.#onSubmit(null)
        this.close()
    }
  }
