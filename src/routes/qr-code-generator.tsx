import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/qr-code-generator'

export const Route = createFileRoute('/qr-code-generator')({ component: Page })
