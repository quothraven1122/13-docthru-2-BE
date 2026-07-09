export default {
  extends: ["@commitlint/config-conventional"],

  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(docs|feat|fix|modify|refactor|style|chore):\s#(\d+)\s(.+)$/,
      headerCorrespondence: ["type", "issue", "subject"],
    },
  },

  rules: {
    "type-enum": [
      2,
      "always",
      ["docs", "feat", "fix", "modify", "refactor", "style", "chore"],
    ],
    "subject-empty": [2, "never"],
  },
};
