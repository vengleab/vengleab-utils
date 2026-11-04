import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/json-beautifier'

export const Route = createFileRoute('/json-beautifier')({ component: Page })
