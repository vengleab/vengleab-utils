import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/table-converter'

export const Route = createFileRoute('/table-converter')({ component: Page })
