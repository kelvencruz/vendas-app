'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Hook que retorna o usuário logado e redireciona para /login se necessário.
 *
 * Uso:
 *   const { usuario, loading } = useAuth()
 *   if (loading) return <Loading />
 */
export function useAuth() {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
      } else {
        setUsuario(session.user)
        setLoading(false)
      }
    })

    // Escuta mudanças de sessão (logout, expiração)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.href = '/login'
      } else {
        setUsuario(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { usuario, loading }
}
