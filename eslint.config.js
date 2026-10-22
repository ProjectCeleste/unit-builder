import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"
import prettierRecommended from "eslint-plugin-prettier/recommended"
import globals from "globals"

export default [
  {
    // db/ and server/ were never linted by the Vue CLI setup
    ignores: ["node_modules/", "dist/", "dev-dist/", "db/", "server/"]
  },
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      "vue/max-attributes-per-line": "off",
      "vue/no-v-html": "off",
      "vue/html-self-closing": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-reserved-component-names": "off",
      semi: [2, "never"]
    }
  }
]
