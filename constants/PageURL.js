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
};


export const MENU_ITEMS = {
  str_len: { name: 'String Length', page: PAGE.STRING_LEN },
  base_64_encode_decoder: { name: 'Base 64 encode and decoder', page: PAGE.BASE_64_ENCODE_DECODER },
  json_beautifier: { name: 'JSON Beautifier', page: PAGE.JSON_BEAUTIFIER },
  jwt_token_viewer: { name: 'JWT Token Viewer', page: PAGE.JWT_TOKEN_VIEWER },
  emi: { name: 'Loan Calculator (EMI)', page: PAGE.LOAN_CALCULATOR },
  kh_tax: { name: 'Cambodia Gross Salary Calculator', page: PAGE.KH_SALARY_TAX_CALCULATOR },
  kh_tax_gross: { name: 'Cambodia Net Salary Calculator', page: PAGE.KH_SALARY_TAX_CALCULATOR_GROSS },
};
