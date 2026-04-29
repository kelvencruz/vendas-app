'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function handleSalvar() {
    setErro('')
    if (!senha || !confirmar) return setErro('Preencha todos os campos.')
    if (senha !== confirmar) return setErro('As senhas não coincidem.')
    if (senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')

    setSalvando(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: senha })
      if (error) throw error
      setSucesso(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (err) {
      setErro('Erro ao atualizar senha. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-amber-900 mb-2">🔒 Nova Senha</h1>
        <p className="text-gray-500 text-sm mb-6">Digite sua nova senha abaixo.</p>

        {erro && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">{erro}</div>
        )}

        {sucesso && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-sm">
            ✅ Senha alterada com sucesso! Redirecionando...
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
        <input
          type="password"
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Mínimo 6 caracteres"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
        <input
          type="password"
          className="w-full border rounded-lg p-2 mb-6"
          placeholder="Repita a senha"
          value={confirmar}
          onChange={e => setConfirmar(e.target.value)}
        />

        <button
          onClick={handleSalvar}
          disabled={salvando || sucesso}
          className="w-full bg-amber-700 text-white py-3 rounded-xl font-bold hover:bg-amber-800 transition disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Nova Senha'}
        </button>
      </div>
    </div>
  )
}