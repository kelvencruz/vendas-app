'use client'
import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [modo, setModo] = useState('login')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleSubmit() {
    setErro('')
    setSucesso('')
    setLoading(true)

    if (!email || !senha) {
      setErro('Preencha email e senha!')
      setLoading(false)
      return
    }

    if (modo === 'cadastro') {
      const { error } = await supabase.auth.signUp({ email, password: senha })
      if (error) {
        setErro('Erro ao cadastrar: ' + error.message)
      } else {
        setSucesso('Cadastro realizado! Verifique seu email para confirmar.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) {
        setErro('Email ou senha incorretos!')
      } else {
        window.location.href = '/'
      }
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-amber-900 text-center mb-2">🍯</h1>
        <h2 className="text-xl font-bold text-amber-900 text-center mb-6">
          {modo === 'login' ? 'Entrar no Sistema' : 'Criar Conta'}
        </h2>

        {erro && <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">{erro}</div>}
        {sucesso && <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-sm">{sucesso}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-amber-900 font-bold mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-amber-900 font-bold mb-1">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500" />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-amber-800 text-white py-3 rounded-xl font-bold text-lg hover:bg-amber-900 transition disabled:opacity-50">
            {loading ? 'Aguarde...' : modo === 'login' ? '🔑 Entrar' : '✅ Criar Conta'}
          </button>

          <button onClick={() => { setModo(modo === 'login' ? 'cadastro' : 'login'); setErro(''); setSucesso('') }}
            className="w-full text-amber-700 text-sm hover:text-amber-900 transition">
            {modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </main>
  )
}