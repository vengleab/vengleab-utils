import { createFileRoute } from '@tanstack/react-router'
import Page from '../../pages/random-group-generator'

export const Route = createFileRoute('/random-group-generator')({ component: Page })
