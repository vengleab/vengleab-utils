import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/base-64-encode-decoder'

export const Route = createFileRoute('/base-64-encode-decoder')({ component: Page })
