/* eslint-disable import/prefer-default-export */
export const PAGE = {
  STRING_LEN: '/string-len',
  INDEX: '/',
  BASE_64_ENCODE_DECODER: 'base-64-encode-decoder',
  JSON_BEAUTIFIER: 'json-beautifier',
  JWT_TOKEN_VIEWER: 'jwt-token-viewer',
  LOAN_CALCULATOR: 'loan-calculator',
  KH_SALARY_TAX_CALCULATOR: 'kh-salary-tax-calculator',
  KH_SALARY_TAX_CALCULATOR_GROSS: 'kh-salary-tax-calculator-gross',
  PASSWORD_GENERATOR: 'password-generator',
  RANDOM_GROUP_GENERATOR: 'random-group-generator',
  REGEX_TESTER: 'regex-tester',
  KEYBOARD_TESTER: 'keyboard-tester',
  DISPLAY_COLOR_TESTER: 'display-color-tester',
  QR_CODE_GENERATOR: 'qr-code-generator',
  LUCKY_DRAW: 'lucky-draw',
  TABLE_CONVERTER: 'table-converter',
  DAY_COUNT: 'day-count',
  GOLD_PRICE: 'gold-price',
  NGINX_CONFIG: 'nginx-config-generator',
  CRON_EXPRESSION: 'cron-expression',
  CODE_HIGHLIGHTER: 'code-highlighter',
};

export const MENU_ITEMS = {
  str_len: { name: 'String Length', page: PAGE.STRING_LEN },
  base_64_encode_decoder: {
    name: 'Base 64 encode and decoder',
    page: PAGE.BASE_64_ENCODE_DECODER,
  },
  json_beautifier: { name: 'JSON Beautifier', page: PAGE.JSON_BEAUTIFIER },
  jwt_token_viewer: { name: 'JWT Token Viewer', page: PAGE.JWT_TOKEN_VIEWER },
  emi: { name: 'Loan Calculator (EMI)', page: PAGE.LOAN_CALCULATOR },
  kh_tax: {
    name: 'Cambodia Gross Salary Calculator',
    page: PAGE.KH_SALARY_TAX_CALCULATOR,
  },
  kh_tax_gross: {
    name: 'Cambodia Net Salary Calculator',
    page: PAGE.KH_SALARY_TAX_CALCULATOR_GROSS,
  },
  password_generator: {
    name: 'Password Generator',
    page: PAGE.PASSWORD_GENERATOR,
  },
  random_group_generator: {
    name: 'Random & Grouping',
    page: PAGE.RANDOM_GROUP_GENERATOR,
  },
  regex_tester: {
    name: 'RegEx Tester',
    page: PAGE.REGEX_TESTER,
  },
  keyboard_tester: {
    name: 'Keyboard Tester',
    page: PAGE.KEYBOARD_TESTER,
  },
  display_color_tester: {
    name: 'Display Tester',
    page: PAGE.DISPLAY_COLOR_TESTER,
  },
  qr_code_generator: {
    name: 'QR Code Generator',
    page: PAGE.QR_CODE_GENERATOR,
  },
  lucky_draw: {
    name: 'Lucky Draw Tools',
    page: PAGE.LUCKY_DRAW,
  },
  table_converter: {
    name: 'Table Converter',
    page: PAGE.TABLE_CONVERTER,
  },
  day_count: {
    name: 'Day Count Calculator',
    page: PAGE.DAY_COUNT,
  },
  gold_price: {
    name: 'Gold Price Tracker',
    page: PAGE.GOLD_PRICE,
  },
  nginx_config: {
    name: 'Nginx Config Generator',
    page: PAGE.NGINX_CONFIG,
  },
  cron_expression: {
    name: 'Cron Expression',
    page: PAGE.CRON_EXPRESSION,
  },
  code_highlighter: {
    name: 'Code Highlighter',
    page: PAGE.CODE_HIGHLIGHTER,
  },
};

// Sidebar grouping — ordered sections, each listing MENU_ITEMS keys.
export const MENU_GROUPS = [
  {
    id: 'converters',
    name: 'Converters & Encoders',
    items: ['base_64_encode_decoder', 'json_beautifier', 'jwt_token_viewer', 'table_converter', 'code_highlighter'],
  },
  {
    id: 'generators',
    name: 'Generators',
    items: ['password_generator', 'qr_code_generator', 'nginx_config', 'cron_expression'],
  },
  {
    id: 'text',
    name: 'Text & RegEx',
    items: ['str_len', 'regex_tester'],
  },
  {
    id: 'finance',
    name: 'Finance & Time',
    items: ['emi', 'kh_tax', 'kh_tax_gross', 'gold_price', 'day_count'],
  },
  {
    id: 'random',
    name: 'Randomizers',
    items: ['random_group_generator', 'lucky_draw'],
  },
  {
    id: 'testers',
    name: 'Hardware Testers',
    items: ['keyboard_tester', 'display_color_tester'],
  },
];
