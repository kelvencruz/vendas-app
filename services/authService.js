import { supabase } from '@/lib/supabase'

/**
 * Retorna a sessão atual do usuário.
 * Redireciona para /login se não estiver autenticado.
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw new Error('Erro ao obter sessão: ' + error.message)
  return session
}

/**
 * Retorna o usuário logado ou null.
 */
export async function getUsuarioLogado() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Faz login com email e senha.
 */
export async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Faz logout do usuário atual.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/**
 * Convida um novo usuário via email (requer service role no backend).
 */
export async function convidarUsuario(email) {
  const response = await fetch('/api/convidar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data
}
