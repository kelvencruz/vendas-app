'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { listarVendas, cancelarVenda } from '@/services/vendasService'

const cores = {
  'Mel Pequeno': 'bg-yellow-100',
  'Mel Grande': 'bg-yellow-200',
  'Favo Grande': 'bg-amber-200',
  'Atacado': 'bg-orange-200'
}

export default function Vendas() {
  const { usuario, loading: loadingAuth } = useAuth()
  const [vendas, setVendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroProduto, setFiltroProduto] = useState('')

  useEffect(() => {
    if (usuario) carregarVendas()
  }, [usuario])

  async function carregarVendas() {
    try {
      setLoading(true)
      const data = await listarVendas(usuario.id)
      setVendas(data)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelar(id) {
    if (!confirm('Cancelar essa venda?')) return
    try {
      await cancelarVenda(id)
      setVendas(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      setErro(err.message)
    }
  }

  const vendasFiltradas = vendas.filter(v => {
    const buscaOk = busca === '' ||
      (v.cliente || '').toLowerCase().includes(busca.toLowerCase()) ||
      v.produto.toLowerCase().includes(busca.toLowerCase())
    const produtoOk = filtroProduto === '' || v.produto === filtroProduto
    return buscaOk && produtoOk
  })

  const totalFiltrado = vendasFiltradas.reduce((acc, v) => acc + Number(v.total_venda), 0)

  if (loadingAuth) return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-amber-800 text-xl">Carregando...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-amber-800 mb-4 block">← Voltar</a>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900">📋 Vendas Registradas</h1>
          <a
            href="/vendas/nova"
            className="bg-amber-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-900 transition"
          >
            + Nova Venda
          </a>
        </div>

        {erro && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">{erro}</div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 shadow mb-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar por cliente ou produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="flex-1 min-w-[200px] border border-amber-200 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
          />
          <select
            value={filtroProduto}
            onChange={e => setFiltroProduto(e.target.value)}
            className="border border-amber-200 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos os produtos</option>
            <option>Mel Pequeno</option>
            <option>Mel Grande</option>
            <option>Favo Grande</option>
            <option>Atacado</option>
          </select>
          {(busca || filtroProduto) && (
            <button
              onClick={() => { setBusca(''); setFiltroProduto('') }}
              className="text-amber-700 text-sm hover:text-amber-900"
            >
              ✕ Limpar
            </button>
          )}
        </div>

        {/* Resumo */}
        {vendasFiltradas.length > 0 && (
          <div className="bg-amber-100 rounded-xl p-3 mb-4 flex justify-between items-center text-sm">
            <span className="text-amber-800">{vendasFiltradas.length} venda(s) encontrada(s)</span>
            <span className="font-bold text-amber-900">
              Total: R$ {totalFiltrado.toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}

        {loading ? (
          <div className="text-center text-amber-700 py-8">Carregando...</div>
        ) : vendasFiltradas.length === 0 ? (
          <div className="text-center text-amber-700 bg-white rounded-xl p-8">
            {vendas.length === 0 ? 'Nenhuma venda registrada ainda.' : 'Nenhuma venda encontrada para essa busca.'}
          </div>
        ) : (
          <div className="space-y-3">
            {vendasFiltradas.map(v => (
              <div
                key={v.id}
                className={`${cores[v.produto] || 'bg-white'} rounded-xl p-4 shadow flex justify-between items-center`}
              >
                <div>
                  <div className="font-bold text-amber-900">{v.produto}</div>
                  <div className="text-sm text-amber-700">
                    {v.data} {v.hora} — {v.cliente || 'Cliente não informado'}
                  </div>
                  <div className="text-sm text-amber-700">
                    {v.quantidade} {v.produto === 'Atacado' ? 'balde(s)' : 'un.'} × R$ {Number(v.valor_unitario).toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-900 text-lg">
                    R$ {Number(v.total_venda).toFixed(2).replace('.', ',')}
                  </div>
                  <button
                    onClick={() => handleCancelar(v.id)}
                    className="text-red-500 text-sm hover:text-red-700 mt-1"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
