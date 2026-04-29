'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { criarGasto } from '@/services/gastosService'
import { useRouter } from 'next/navigation'

const CATEGORIAS = ['Combustível', 'Alimentação', 'Equipamentos', 'Manutenção', 'Outros']

export default function NovoGasto() {
  const { usuario, loading } = useAuth() as any
  const router = useRouter()
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar() {
    if (!descricao || !valor) return alert('Preencha todos os campos')
    setSalvando(true)
    try {
      await criarGasto({ descricao, valor: parseFloat(valor), categoria })
      router.push('/')
    } catch (e) {
      alert('Erro ao salvar gasto')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <p className="p-8">Carregando...</p>
  if (!usuario) { router.push('/login'); return null }

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-amber-800 mb-6">💸 Registrar Gasto</h1>

        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <input
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Ex: Combustível da semana"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
        <input
          className="w-full border rounded-lg p-2 mb-4"
          type="number"
          placeholder="0,00"
          value={valor}
          onChange={e => setValor(e.target.value)}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select
          className="w-full border rounded-lg p-2 mb-6"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
        >
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>

        <button
          onClick={handleSalvar}
          disabled={salvando}
          className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition"
        >
          {salvando ? 'Salvando...' : 'Salvar Gasto'}
        </button>
      </div>
    </div>
  )
}