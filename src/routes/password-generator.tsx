import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/password-generator'

export const Route = createFileRoute('/password-generator')({ component: Page })
