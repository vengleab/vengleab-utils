import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/cron-expression'

export const Route = createFileRoute('/cron-expression')({ component: Page })
