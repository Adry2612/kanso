import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",

      // React
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": "error",

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "no-var": "error",

      // Prettier
      "prettier/prettier": "warn",
    },
  },
  // Fronteras de arquitectura: las vistas, componentes y hooks de cliente no
  // pueden importar código exclusivo de servidor.
  {
    files: [
      "src/app/**/page.tsx",
      "src/components/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/services/server", "@/services/server/*"],
              message:
                "Usa un servicio de cliente; los servicios de servidor no pueden importarse desde el cliente.",
            },
            {
              group: ["firebase-admin", "firebase-admin/*"],
              message:
                "Firebase Admin solo puede usarse desde src/services/server o una ruta API.",
            },
            {
              group: ["@/lib/apiAuth", "@/lib/firebaseAdmin", "@/lib/avatar"],
              message:
                "Este módulo es exclusivo de servidor; usa la API interna desde el cliente.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/services/client/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/services/server", "@/services/server/*"],
              message:
                "Un servicio de cliente no puede importar servicios de servidor.",
            },
            {
              group: ["firebase-admin", "firebase-admin/*"],
              message:
                "Los servicios de cliente no pueden usar Firebase Admin.",
            },
            {
              group: ["@/lib/apiAuth", "@/lib/firebaseAdmin", "@/lib/avatar"],
              message:
                "Los servicios de cliente no pueden importar módulos de servidor.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/services/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
      "src/utils/**/*.{ts,tsx}",
      "src/types/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  // Disables ESLint rules that conflict with Prettier formatting.
  eslintConfigPrettier,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
