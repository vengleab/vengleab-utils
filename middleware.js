import { NextResponse } from 'next/server';

const ROOT_DOMAIN = 'svl-labs.uk';

// Maps subdomain → Next.js page path
const SUBDOMAIN_TO_PATH = {
  'string-len': '/string-len',
  'base-64-encode-decoder': '/base-64-encode-decoder',
  'json-beautifier': '/json-beautifier',
  'jwt-token-viewer': '/jwt-token-viewer',
  'loan-calculator': '/loan-calculator',
  'kh-salary-tax-calculator': '/kh-salary-tax-calculator',
  'kh-salary-tax-calculator-gross': '/kh-salary-tax-calculator-gross',
  'password-generator': '/password-generator',
  'random-group-generator': '/random-group-generator',
  'regex-tester': '/regex-tester',
  'keyboard-tester': '/keyboard-tester',
  'display-color-tester': '/display-color-tester',
  'qr-code-generator': '/qr-code-generator',
  'lucky-draw': '/lucky-draw',
  'table-converter': '/table-converter',
  'day-count': '/day-count',
  'gold-price': '/gold-price',
  'nginx-config-generator': '/nginx-config-generator',
};

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const host = hostname.split(':')[0]; // strip port

  // Root domain, www, and tools subdomain — normal multi-tool site
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}` || host === `tools.${ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  // Not a subdomain of svl-labs.uk (e.g. localhost dev) — pass through
  if (!host.endsWith(`.${ROOT_DOMAIN}`)) {
    return NextResponse.next();
  }

  const subdomain = host.slice(0, host.length - ROOT_DOMAIN.length - 1);
  const toolPath = SUBDOMAIN_TO_PATH[subdomain];

  // Unknown subdomain
  if (!toolPath) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const { pathname } = request.nextUrl;

  // Serve the tool at the root URL (browser stays at "/")
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = toolPath;
    return NextResponse.rewrite(url);
  }

  // Block direct access to any other page — redirect back to root
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

// Only run on page navigations — skip static assets and images
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)', '/'],
};
