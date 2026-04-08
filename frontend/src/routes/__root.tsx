import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { AuthProvider } from '../features/auth/AuthContext'
import '../lib/amplify'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <Header />
      <Outlet />
      <Footer />
      <TanStackDevtools
        plugins={[
          { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
        ]}
        config={{ position: 'bottom-right' }}
      />
    </AuthProvider>
  )
}
