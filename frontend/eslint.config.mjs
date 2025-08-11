import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),

  // Add this new object to override default rules
  {
    ignores: [
      "src/*"
    ],
    rules: {
      // JSX entity warnings only
      // Warns about unescaped characters like " and ' in JSX.
      "react/no-unescaped-entities": "warn",

      // Ensures React hook dependency arrays are correct, but only as a warning.
      "react-hooks/exhaustive-deps": "warn"
    },
  },
];

export default eslintConfig;