import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import ReactDOM from 'react-dom/client'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={getRouter()} />,
)
