import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/code-highlighter'

export const Route = createFileRoute('/code-highlighter')({ component: Page })
