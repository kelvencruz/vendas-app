'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const PRODUTOS = ['Mel Pequeno', 'Mel Grande', 'Favo Grande', 'Atacado']
const MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Relatorio() {
  const [vendas, setVendas] = useState([])
  const [mesSelecionado, setMesSelecionado] = useState('')
  const [mesesDisponiveis, setMesesDisponiveis] = useState([])

  useEffect(() => {
    carregarVendas()
  }, [])

  async function carregarVendas() {
    const { data } = await supabase
      .from('vendas')
      .select('*')
      .eq('cancelado', false)
      .order('created_at', { ascending: false })

    if (data) {
      setVendas(data)
      const meses = [...new Set(data.map(v => v.mes))].filter(Boolean)
      setMesesDisponiveis(meses)
      if (meses.length > 0) setMesSelecionado(meses[0])
    }
  }

  const vendasFiltradas = vendas.filter(v => v.mes === mesSelecionado)

  function totalProduto(produto) {
    return vendasFiltradas
      .filter(v => v.produto === produto)
      .reduce((acc, v) => acc + Number(v.total_venda), 0)
  }

  function qtdProduto(produto) {
    return vendasFiltradas
      .filter(v => v.produto === produto)
      .reduce((acc, v) => acc + Number(v.quantidade), 0)
  }

  function nVendasProduto(produto) {
    return vendasFiltradas.filter(v => v.produto === produto).length
  }

  const totalMes = vendasFiltradas.reduce((acc, v) => acc + Number(v.total_venda), 0)

  const cores = {
    'Mel Pequeno': 'bg-yellow-100',
    'Mel Grande': 'bg-yellow-200',
    'Favo Grande': 'bg-amber-200',
    'Atacado': 'bg-orange-300'
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-amber-800 mb-4 block">← Voltar</a>
        <h1 className="text-2xl font-bold text-amber-900 mb-6">📊 Relatório de Vendas</h1>

        {/* Filtro de mês */}
        <div className="bg-white rounded-xl p-4 shadow mb-6 flex items-center gap-4">
          <label className="font-bold text-amber-900">Período:</label>
          <select value={mesSelecionado} onChange={e => setMesSelecionado(e.target.value)}
            className="border border-amber-200 rounded-lg p-2 focus:outline-none focus:border-amber-500">
            {mesesDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Tabela de produtos */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="bg-amber-800 text-white p-4 font-bold grid grid-cols-5 text-center">
            <div>Produto</div>
            <div>Nº Vendas</div>
            <div>Quantidade</div>
            <div>Ticket Médio</div>
            <div>Total</div>
          </div>
          {PRODUTOS.map(p => (
            <div key={p} className={`${cores[p]} p-4 grid grid-cols-5 text-center border-b border-amber-100`}>
              <div className="font-bold text-amber-900 text-left">{p}</div>
              <div>{nVendasProduto(p)}</div>
              <div>{qtdProduto(p)} {p === 'Atacado' ? 'bal.' : 'un.'}</div>
              <div>R$ {nVendasProduto(p) > 0 ? (totalProduto(p) / nVendasProduto(p)).toFixed(2).replace('.', ',') : '0,00'}</div>
              <div className="font-bold">R$ {totalProduto(p).toFixed(2).replace('.', ',')}</div>
            </div>
          ))}
          <div className="bg-amber-800 text-white p-4 grid grid-cols-5 text-center font-bold">
            <div className="text-left">TOTAL DO MÊS</div>
            <div>{vendasFiltradas.length}</div>
            <div>—</div>
            <div>—</div>
            <div>R$ {totalMes.toFixed(2).replace('.', ',')}</div>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="bg-amber-700 text-white p-4 font-bold">🏆 Ranking do Mês</div>
          {[...PRODUTOS]
            .sort((a, b) => totalProduto(b) - totalProduto(a))
            .map((p, i) => (
              <div key={p} className={`${cores[p]} p-4 flex justify-between items-center border-b border-amber-100`}>
                <div className="font-bold text-amber-900">
                  {['🥇','🥈','🥉','4º'][i]} {p}
                </div>
                <div className="font-bold">R$ {totalProduto(p).toFixed(2).replace('.', ',')}</div>
              </div>
            ))}
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-amber-700 text-white p-4 font-bold">📅 Histórico — Todos os Meses</div>
          {mesesDisponiveis.length === 0 ? (
            <div className="p-4 text-amber-700">— sem dados —</div>
          ) : mesesDisponiveis.map(m => {
            const vMes = vendas.filter(v => v.mes === m)
            const totalM = vMes.reduce((acc, v) => acc + Number(v.total_venda), 0)
            const destaque = PRODUTOS.reduce((max, p) =>
              vMes.filter(v => v.produto === p).reduce((a, v) => a + Number(v.total_venda), 0) >
              vMes.filter(v => v.produto === max).reduce((a, v) => a + Number(v.total_venda), 0) ? p : max
            , PRODUTOS[0])
            return (
              <div key={m} className={`p-4 flex justify-between items-center border-b border-amber-100 ${m === mesSelecionado ? 'bg-amber-50 font-bold' : ''}`}>
                <div className="text-amber-900">{m}</div>
                <div className="text-amber-700 text-sm">{vMes.length} venda(s) — destaque: {destaque}</div>
                <div className="font-bold text-amber-900">R$ {totalM.toFixed(2).replace('.', ',')}</div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}