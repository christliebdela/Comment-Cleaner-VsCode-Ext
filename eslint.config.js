import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat();

export default [
  ...compat.config({ extends: ["./.eslintrc.json"] })
];