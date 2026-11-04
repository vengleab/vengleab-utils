import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/nginx-config-generator'

export const Route = createFileRoute('/nginx-config-generator')({ component: Page })
