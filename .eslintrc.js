module.exports = {
  extends: [
    "airbnb-base",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/react"
  ],
  parser: "babel-eslint",
  rules: {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"]
      }
    }
  },
  env: {
    browser: true,
    node: true,
  }
};
