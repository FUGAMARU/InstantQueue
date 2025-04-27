import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import eslintPluginImport from "eslint-plugin-import"
import eslintPluginJsdoc from "eslint-plugin-jsdoc"
import { qwikEslint9Plugin } from "eslint-plugin-qwik"
import eslintPluginReactConfig from "eslint-plugin-react/configs/recommended.js"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: ["node_modules/*", "dist/*", "server/*", "tmp/*", ".stylelintrc.js", "vite.config.ts"]
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  js.configs.recommended,
  eslintConfigPrettier,
  eslintPluginJsdoc.configs["flat/recommended-typescript-error"],
  ...tseslint.configs.recommended,
  {
    ...eslintPluginReactConfig,
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    plugins: {
      import: eslintPluginImport,
      jsdoc: eslintPluginJsdoc
    },
    rules: {
      /** 不要なスペースは禁止 */
      "no-trailing-spaces": "error",
      "no-multi-spaces": "error",
      /** 連続した2行以上の空行は禁止 */
      "no-multiple-empty-lines": ["error", { max: 1 }],
      /** 厳密等価演算子を強制する */
      eqeqeq: ["error", "always"],
      /** コメントの後に半角スペースを強制する */
      "spaced-comment": ["error", "always", { exceptions: ["-", "+"] }],
      /** if文の括弧の省略禁止 */
      curly: "error",
      /** 暗黙の型変換を防ぐ */
      "no-implicit-coercion": ["error", { boolean: false, number: true, string: true }],
      /** 相対パスインポート禁止 */
      "no-restricted-imports": [
        "error",
        {
          patterns: ["./", "../"]
        }
      ],
      /** 非nullアサーション演算子(!)の使用を禁止する */
      "@typescript-eslint/no-non-null-assertion": "error",
      /** typeのみをimportする時はtypeと記載することを強制する */
      "@typescript-eslint/consistent-type-imports": "error",
      /** 配列の型定義をする際にArray<T>を強制する (T[]は禁止) */
      "@typescript-eslint/array-type": ["error", { default: "generic", readonly: "generic" }],
      /** 条件式での暗黙の型変換を防ぐ */
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false
        }
      ],
      /** React 17以降の新しいJSX変換ではReactをインポートする必要がないためオフにする */
      "react/react-in-jsx-scope": "off",
      /** React 17以降の新しいJSX変換ではJSXで使用されるReact変数のスコープチェックを無効化する */
      "react/jsx-uses-react": "off",
      /** 属性やPropsにstringを渡す時はダブルクオーテーション必須 */
      "jsx-quotes": ["error", "prefer-double"],
      /** childrenが無い時はコンポーネントをSelf-Closingするようにする */
      "react/self-closing-comp": "error",
      /** stringのPropsを渡す時に{}を使用するのを禁止する  */
      "react/jsx-curly-brace-presence": ["error", { props: "never" }],
      /** JSXでboolean型のpropsにtrueを渡す際に省略形を強制する */
      "react/jsx-boolean-value": ["error", "never"],
      /** Propsをアルファベット順にソートする */
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: false,
          shorthandFirst: false,
          shorthandLast: false,
          ignoreCase: true,
          noSortAlphabetically: false,
          reservedFirst: true
        }
      ],
      /** QwikではclassName属性は使えないのでoff */
      "react/no-unknown-property": "off",
      /** JSDocのコメントを強制 */
      "jsdoc/require-jsdoc": [
        "error",
        {
          contexts: [
            "ArrowFunctionExpression",
            "ClassDeclaration",
            "ClassExpression",
            "FunctionDeclaration",
            "FunctionExpression",
            "MethodDefinition",
            "PropertyDefinition",
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "TSPropertySignature",
            "TSMethodSignature"
          ]
        }
      ],
      "jsdoc/require-hyphen-before-param-description": ["error", "always"],
      "jsdoc/require-description": [
        "error",
        {
          contexts: [
            "ArrowFunctionExpression",
            "ClassDeclaration",
            "ClassExpression",
            "FunctionDeclaration",
            "FunctionExpression",
            "MethodDefinition",
            "PropertyDefinition",
            "VariableDeclaration",
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "TSPropertySignature",
            "TSMethodSignature"
          ]
        }
      ],
      "jsdoc/require-returns": ["error"],
      "jsdoc/require-param": [
        "error",
        {
          checkDestructuredRoots: false
        }
      ],
      "jsdoc/check-tag-names": [
        "error",
        {
          definedTags: ["typeParam", "remarks"]
        }
      ],
      "jsdoc/tag-lines": [
        "error",
        "never",
        {
          startLines: 1
        }
      ],
      "jsdoc/sort-tags": [
        "error",
        {
          reportIntraTagGroupSpacing: false
        }
      ],
      "jsdoc/no-types": ["off"],
      /** 関数の戻り値記述必須 */
      "@typescript-eslint/explicit-function-return-type": "error",
      /** importの順番を種類ごとに統一する */
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type"
          ],
          "newlines-between": "always",
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: { order: "asc", caseInsensitive: true },
          pathGroups: [
            { pattern: "src/types/**", group: "internal", position: "before" },
            { pattern: "src/repositories/**", group: "internal", position: "before" }
          ]
        }
      ]
    },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" }
      }
    }
  },
  {
    files: ["src/constants.ts", "src/utils.ts", "src/api.ts", "src/types.ts"],
    rules: {
      /** 関数の戻り値記述必須 */
      "@typescript-eslint/explicit-function-return-type": "error",
      /** JSDocにおける戻り値の記述必須 */
      "jsdoc/require-returns": ["error"],
      /** JSDocにおける引数の記述必須 */
      "jsdoc/require-param": [
        "error",
        {
          checkDestructuredRoots: false
        }
      ],
      /** JSDocにおけるそのファイルに関する説明の記述必須 */
      "jsdoc/require-file-overview": ["error"]
    }
  },
  ...qwikEslint9Plugin.configs.recommended
]
