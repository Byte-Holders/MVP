import { createContext } from 'react'
import type { IAuthViewModel } from '../interfaces/viewModel/IUseAuth'

export const AuthContext = createContext<IAuthViewModel | null>(null)
