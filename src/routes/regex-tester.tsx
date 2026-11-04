import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/regex-tester'

export const Route = createFileRoute('/regex-tester')({ component: Page })
