/*import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`
*/

import { useEffect, useState } from 'react'
import { useNavigate, useRouter, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { getCurrentUser } from 'aws-amplify/auth'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import AuthGate from '@/features/auth/guards/requireAuth'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`


import appCss from '../styles.css?url'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {/*
  const navigate = useNavigate()
  const router = useRouter() //info su route corrente
  

  const [checked, setChecked] = useState(false) //controllo se è stato controllato se l'utente è autenticato

  useEffect(() => {   
    console.log('in useEffect')
    configureAmplify()  
    console.log('Amplify configured')
    async function checkAuth() {
      console.log('checking auth...')
      try {             //aspetto di aver effettuato il controllo del se utnete ha fatto login o meno
        await getCurrentUser() //prova a verificare login: se OK → utente loggato | se fallisce → va nel catch
        setChecked(true)
      } catch {    //ho controllato ma l'utente non è loggato
        setChecked(true)

        const currentPath = router.state.location.pathname  //salvo il currentPath in modo che dopo aver fatto login ritorni alla pagina cercata

        if (currentPath !== '/login') {
          navigate({
            to: '/login',
            search: {
              redirect: currentPath,  
            },
            replace: true,
          })
        }
      }
    }

    checkAuth()
  }, [])

  if (!checked) return (
      <div>Loading...</div>
   )*/
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <AuthGate>
        <Header />
        {children}
        <Footer />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
        </AuthGate>
      </body>
    </html>
  )
}
