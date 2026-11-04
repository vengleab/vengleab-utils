import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/jwt-token-viewer'

export const Route = createFileRoute('/jwt-token-viewer')({ component: Page })
