'use client'
import { useState } from 'react'
import { supabase } from '../../supabase'

const PRODUTOS = ['Mel Pequeno', 'Mel Grande', 'Favo Grande', 'Atacado']

export default function NovaVenda() {
  const [produto, setProduto] = useState('')
  const [cliente, setCliente] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valorUnit, setValorUnit] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const totalVenda = produto === 'Atacado'
    ? Number(quantidade) * 20 * Number(valorUnit)
    : Number(quantidade) * Number(valorUnit)

  async function salvarVenda() {
    if (!produto || !quantidade || !valorUnit) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }
    setLoading(true)
    const agora = new Date()
    const mes = agora.toLocaleString('pt-BR', { month: 'long' }) + '/' + agora.getFullYear()

    const { error } = await supabase.from('vendas').insert([{
      data: agora.toISOString().split('T')[0],
      hora: agora.toTimeString().split(' ')[0],
      produto,
      cliente,
      quantidade: Number(quantidade),
      valor_unitario: Number(valorUnit),
      total_venda: totalVenda,
      mes
    }])

    setLoading(false)
    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      setSucesso(true)
      setProduto('')
      setCliente('')
      setQuantidade('')
      setValorUnit('')
      setTimeout(() => setSucesso(false), 3000)
    }
  }

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

        <div className="bg-white rounded-xl p-6 shadow space-y-4">
          <div>
            <label className="block text-amber-900 font-bold mb-1">Produto *</label>
            <select value={produto} onChange={e => setProduto(e.target.value)}
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500">
              <option value="">Selecione...</option>
              {PRODUTOS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-amber-900 font-bold mb-1">Cliente</label>
            <input value={cliente} onChange={e => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500" />
          </div>

          <div>
            <label className="block text-amber-900 font-bold mb-1">
              Quantidade * {produto === 'Atacado' ? '(baldes)' : '(unidades)'}
            </label>
            <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)}
              placeholder="0"
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500" />
          </div>

          <div>
            <label className="block text-amber-900 font-bold mb-1">
              Valor Unitário (R$) * {produto === 'Atacado' ? '— por kg' : '— por unidade'}
            </label>
            <input type="number" value={valorUnit} onChange={e => setValorUnit(e.target.value)}
              placeholder="0.00"
              className="w-full border border-amber-200 rounded-lg p-3 focus:outline-none focus:border-amber-500" />
          </div>

          {quantidade && valorUnit && (
            <div className="bg-amber-100 rounded-lg p-4 text-center">
              <div className="text-amber-700 text-sm">Total da Venda</div>
              <div className="text-amber-900 text-2xl font-bold">
                R$ {totalVenda.toFixed(2).replace('.', ',')}
              </div>
              {produto === 'Atacado' && (
                <div className="text-amber-600 text-sm">{Number(quantidade) * 20} kg</div>
              )}
            </div>
          )}

          <button onClick={salvarVenda} disabled={loading}
            className="w-full bg-amber-800 text-white py-3 rounded-xl font-bold text-lg hover:bg-amber-900 transition disabled:opacity-50">
            {loading ? 'Salvando...' : '💾 Salvar Venda'}
          </button>
        </div>
      </div>
    </main>
  )
}