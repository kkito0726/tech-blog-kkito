import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './styles/global.css'

export const createRoot = ViteReactSSG({
  routes,
  basename: import.meta.env.BASE_URL,
})
