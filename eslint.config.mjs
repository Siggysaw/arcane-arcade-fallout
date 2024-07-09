import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        Roll: 'readonly',
        game: 'readonly',
        Dialog: 'readonly',
        ChatMessage: 'readonly',
        ui: 'readonly',
        foundry: 'readonly',
        Actor: 'readonly',
        Actors: 'readonly',
        canvas: 'readonly',
        Item: 'readonly',
        Hooks: 'readonly',
        CONFIG: 'readonly',
        Handlebars: 'readonly',
        Items: 'readonly',
        ActorSheet: 'readonly',
        ItemSheet: 'readonly',
        Macro: 'readonly',
        renderTemplate: 'readonly',
        FormDataExtended: 'readonly',
        Die: 'readonly',
        NumericTerm: 'readonly',
        OperatorTerm: 'readonly',
        FormApplication: 'readonly',
      },
    },
  },
  pluginJs.configs.recommended,
]
