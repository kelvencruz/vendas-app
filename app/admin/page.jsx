'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Admin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
      } else {
        setUsuario(session.user)
      }
    })
  }, [])

  async function convidarUsuario() {
    if (!email) {
      setErro('Digite um email!')
      return
    }
    setLoading(true)
    setErro('')
    setSucesso('')

    const response = await fetch('/api/convidar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const data = await response.json()
    setLoading(false)

    if (data.error) {
      setErro('Erro: ' + data.error)
    } else {
      setSucesso('Convite enviado para ' + email + '!')
      setEmail('')
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-md mx-auto">
        <a href="/" className="text-amber-800 mb-4 block">← Voltar</a>
        <h1 className="text-2xl font-bold text-amber-900 mb-6">⚙️ Administração</h1>

        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <h2 className="font-bold text-amber-900 mb-4">📧 Convidar Novo Usuário</h2>

          {erro && <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">{erro}</div>}
          {sucesso && <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-sm">{sucesso}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-amber-900 font-bold mb-1">Email do novo usuário</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500" />
            </div>
            <button onClick={convidarUsuario} disabled={loading}
              className="w-full bg-amber-800 text-white py-3 rounded-xl font-bold hover:bg-amber-900 transition disabled:opacity-50">
              {loading ? 'Enviando...' : '📨 Enviar Convite'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="font-bold text-amber-900 mb-2">👤 Logado como</h2>
          <p className="text-amber-700 text-sm">{usuario?.email}</p>
        </div>
      </div>
    </main>
  )
}