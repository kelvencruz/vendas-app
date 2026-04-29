'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { criarVenda } from '@/services/vendasService'

const PRODUTOS = ['Mel Pequeno', 'Mel Grande', 'Favo Grande', 'Atacado']

export default function NovaVenda() {
  const { usuario, loading: loadingAuth } = useAuth()
  const [produto, setProduto] = useState('')
  const [cliente, setCliente] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valorUnit, setValorUnit] = useState('')
  const [pesoBalde, setPesoBalde] = useState('20')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const totalVenda = produto === 'Atacado'
    ? Number(quantidade) * Number(pesoBalde) * Number(valorUnit)
    : Number(quantidade) * Number(valorUnit)

  function limparFormulario() {
    setProduto('')
    setCliente('')
    setQuantidade('')
    setValorUnit('')
    setPesoBalde('20')
  }

  async function salvarVenda() {
    setErro('')
    if (produto === 'Atacado' && (!pesoBalde || Number(pesoBalde) <= 0)) {
      return setErro('Informe o peso do balde.')
    }
    setLoading(true)
    try {
      await criarVenda({
        produto,
        cliente,
        quantidade,
        valorUnitario: valorUnit,
        userId: usuario.id,
        pesoBalde: produto === 'Atacado' ? Number(pesoBalde) : null
      })
      setSucesso(true)
      limparFormulario()
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingAuth) return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-amber-800 text-xl">Carregando...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-md mx-auto">
        <a href="/" className="text-amber-800 mb-4 block">← Voltar</a>
        <h1 className="text-2xl font-bold text-amber-900 mb-6">🛒 Nova Venda</h1>

        {sucesso && (
          <div className="bg-green-100 text-green-800 p-4 rounded-xl mb-4 font-bold">
            ✅ Venda salva com sucesso!
          </div>
        )}

        {erro && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-4 text-sm">
            ❌ {erro}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow space-y-4">

          {/* Produto */}
          <div>
            <label className="block text-amber-900 font-bold mb-1">Produto *</label>
            <select
              value={produto}
              onChange={e => setProduto(e.target.value)}
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500"
            >
              <option value="">Selecione...</option>
              {PRODUTOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-amber-900 font-bold mb-1">Cliente</label>
            <input
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-amber-900 font-bold mb-1">
              Quantidade * {produto === 'Atacado' ? '(baldes)' : '(unidades)'}
            </label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              placeholder="0"
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Peso por balde — só aparece no Atacado */}
          {produto === 'Atacado' && (
            <div>
              <label className="block text-amber-900 font-bold mb-1">
                Peso por balde (kg) *
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={pesoBalde}
                onChange={e => setPesoBalde(e.target.value)}
                placeholder="Ex: 20"
                className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500"
              />
              <p className="text-amber-600 text-xs mt-1">Padrão 20kg — ajuste se necessário (15kg, 25kg, 33kg...)</p>
            </div>
          )}

          {/* Valor unitário */}
          <div>
            <label className="block text-amber-900 font-bold mb-1">
              Valor Unitário (R$) * {produto === 'Atacado' ? '— por kg' : '— por unidade'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valorUnit}
              onChange={e => setValorUnit(e.target.value)}
              placeholder="0,00"
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Preview do total */}
          {quantidade && valorUnit && (
            <div className="bg-amber-100 rounded-lg p-4 text-center">
              <div className="text-amber-700 text-sm">Total da Venda</div>
              <div className="text-amber-900 text-2xl font-bold">
                R$ {totalVenda.toFixed(2).replace('.', ',')}
              </div>
              {produto === 'Atacado' && pesoBalde && (
                <div className="text-amber-600 text-sm">
                  {Number(quantidade)} bal. × {Number(pesoBalde)}kg = {Number(quantidade) * Number(pesoBalde)}kg total
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={limparFormulario}
              disabled={loading}
              className="flex-1 border border-amber-300 text-amber-800 py-3 rounded-xl font-bold hover:bg-amber-50 transition disabled:opacity-50"
            >
              🗑 Limpar
            </button>
            <button
              onClick={salvarVenda}
              disabled={loading || !produto || !quantidade || !valorUnit}
              className="flex-1 bg-amber-800 text-white py-3 rounded-xl font-bold text-lg hover:bg-amber-900 transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : '💾 Salvar'}
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}