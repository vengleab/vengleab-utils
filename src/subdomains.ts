const rootDomain = 'svl-labs.uk'

const toolSubdomains = new Set([
  'string-len', 'base-64-encode-decoder', 'json-beautifier', 'jwt-token-viewer',
  'loan-calculator', 'kh-salary-tax-calculator', 'kh-salary-tax-calculator-gross',
  'password-generator', 'random-group-generator', 'regex-tester', 'keyboard-tester',
  'display-color-tester', 'qr-code-generator', 'lucky-draw', 'table-converter',
  'day-count', 'gold-price', 'nginx-config-generator',
])

export function getSubdomain(hostname: string): string | null {
  const host = hostname.toLowerCase().split(':')[0]
  if (host === rootDomain || host === `www.${rootDomain}` || host === `tools.${rootDomain}` || !host.endsWith(`.${rootDomain}`)) return null
  return host.slice(0, -rootDomain.length - 1)
}

export function getToolPath(hostname: string): string | null {
  const subdomain = getSubdomain(hostname)
  return subdomain && toolSubdomains.has(subdomain) ? `/${subdomain}` : null
}
