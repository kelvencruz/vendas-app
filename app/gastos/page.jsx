'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { listarGastos, cancelarGasto } from '@/services/gastosService'
import { useRouter } from 'next/navigation'

const CORES_CATEGORIA = {
  'Embalagens e Venda': 'bg-blue-100 text-blue-800',
  'Logística': 'bg-orange-100 text-orange-800',
  'Insumos e Produção': 'bg-green-100 text-green-800',
  'Equipamentos': 'bg-purple-100 text-purple-800',
  'Outros': 'bg-gray-100 text-gray-800',
}

export default function VerGastos() {
  const { usuario, loading } = useAuth()
  const router = useRouter()
  const [gastos, setGastos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (usuario) carregarGastos()
  }, [usuario])

  async function carregarGastos() {
    try {
      const data = await listarGastos()
      setGastos(data)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  async function handleCancelar(id) {
    if (!confirm('Cancelar este lançamento?')) return
    try {
      await cancelarGasto(id)
      setGastos(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      setErro(err.message)
    }
  }

  if (loading || carregando) return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-amber-800 text-xl">Carregando...</div>
    </main>
  )

  if (!usuario) { router.push('/login'); return null }

  const total = gastos.reduce((acc, g) => acc + Number(g.valor), 0)

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-amber-800 mb-4 block">← Voltar</a>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900">💸 Ver Gastos</h1>
          <a href="/gastos/nova"
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition">
            + Novo Gasto
          </a>
        </div>

        {erro && <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">{erro}</div>}

        <div className="bg-red-100 rounded-xl p-4 mb-6 flex justify-between items-center shadow">
          <span className="text-red-800 font-bold">Total de Gastos</span>
          <span className="text-2xl font-bold text-red-900">R$ {total.toFixed(2).replace('.', ',')}</span>
        </div>

        {gastos.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-amber-700 shadow">
            Nenhum gasto registrado ainda.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-red-700 text-white p-4 font-bold grid grid-cols-5 text-sm">
              <div>Data</div>
              <div>Descrição</div>
              <div>Categoria</div>
              <div className="text-right">Valor</div>
              <div className="text-center">Ação</div>
            </div>
            {gastos.map(g => {
              const data = new Date(g.created_at)
              const dataFormatada = data.toLocaleDateString('pt-BR')
              return (
                <div key={g.id} className="p-4 grid grid-cols-5 border-b border-red-50 items-center text-sm hover:bg-red-50 transition">
                  <div className="text-gray-600">{dataFormatada}</div>
                  <div className="font-medium text-gray-800">{g.descricao}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${CORES_CATEGORIA[g.categoria] || 'bg-gray-100 text-gray-800'}`}>
                      {g.categoria}
                    </span>
                  </div>
                  <div className="text-right font-bold text-red-800">
                    R$ {Number(g.valor).toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => handleCancelar(g.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs hover:bg-red-200 transition font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}