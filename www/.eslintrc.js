module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "standard-with-typescript",
    "plugin:react/recommended",
    "standard-with-typescript",
    "plugin:prettier/recommended",
    "prettier",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}", "react-app-env.d.ts"],
      rules: {
        "@typescript-eslint/triple-slash-reference": "off",
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: "script",
        project: "./tsconfig.json",
      },
    },
  ],
  settings: {
    react: {
      version: "detect", // Automatically detect the react version
    },
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: "latest",
    sourceType: "script",
    project: "./tsconfig.json",
  },
  plugins: ["react", "@typescript-eslint", "prettier"],
  rules: {
    // TypeScript / ESLint-plugin rules
    "@typescript-eslint/explicit-function-return-type": ["error"], // Requires return types
    "@typescript-eslint/no-explicit-any": "error", // Warns when 'any' type is used
    "@typescript-eslint/no-unused-vars": "error", // Warns about unused variables
    "@typescript-eslint/no-inferrable-types": "off", // No require type annotations when they can be inferred
    "@typescript-eslint/ban-types": "warn", // Warns about banned types (default config has Object, etc.)
    "@typescript-eslint/semi": ["error", "always"], // Requires semicolons
    "@typescript-eslint/eslint-multiline-ternary": ["off"],
    "@typescript-eslint/space-before-function-paren": ["off"],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi", // 'none' or 'semi' or 'comma'
          requireLast: true,
        },
        singleline: {
          delimiter: "semi", // 'semi' or 'comma'
          requireLast: false,
        },
      },
    ],
    "@typescript-eslint/strict-boolean-expressions": [
      "off",
      { allowNullable: true, ignoreRhs: true },
    ],

    // React / JSX rules
    "react/jsx-filename-extension": ["warn", { extensions: [".tsx"] }], // Warns about JSX in files with incorrect extensions
    "react/prop-types": "error", // Requires prop types
    "react/react-in-jsx-scope": "off", // No require React to be in scope when using JSX with React 17

    // General ESLint rules
    "no-console": "warn", // Warns on console.log etc, but not console.error
    "no-unused-vars": "off", // No warn about unused vars, use TypeScript rule instead
    "no-inner-declarations": "off", // Allows function hoisting
    "space-before-function-paren": ["off"],
    "quote-props": ["error", "as-needed"],
    "multiline-ternary": "off",
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
  },
};
