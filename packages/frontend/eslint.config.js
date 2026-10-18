// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["three"], message: "domain/ must not import three" },
            { group: ["react", "react-dom"], message: "domain/ must not import react" },
            { group: ["../three/*"], message: "domain/ must not import from three/" },
            { group: ["../react/*"], message: "domain/ must not import from react/" },
            { group: ["../api/*"], message: "domain/ must not import from api/" },
          ],
        },
      ],
    },
  },
  {
    files: ["src/three/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react-dom"], message: "three/ must not import react" },
            { group: ["../react/*"], message: "three/ must not import from react/" },
          ],
        },
      ],
    },
  },
  {
    files: ["src/api/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["three"], message: "api/ must not import three" },
            { group: ["react", "react-dom"], message: "api/ must not import react" },
            { group: ["../three/*"], message: "api/ must not import from three/" },
            { group: ["../react/*"], message: "api/ must not import from react/" },
          ],
        },
      ],
    },
  },
  prettierConfig,
);
