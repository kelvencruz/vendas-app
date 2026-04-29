'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Vendas() {
  const [vendas, setVendas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarVendas()
  }, [])

  async function carregarVendas() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.href = '/login'
    return
  }

  const { data, error } = await supabase
    .from('vendas')
    .select('*')
    .eq('cancelado', false)
    .eq('user_id', session.user.id)  // ← só vendas do usuário logado
    .order('created_at', { ascending: false })

  if (!error) setVendas(data)
  setLoading(false)
}

  async function cancelarVenda(id) {
    if (!confirm('Cancelar essa venda?')) return
    await supabase.from('vendas').update({ cancelado: true }).eq('id', id)
    carregarVendas()
  }

  const cores = {
    'Mel Pequeno': 'bg-yellow-100',
    'Mel Grande': 'bg-yellow-200',
    'Favo Grande': 'bg-amber-200',
    'Atacado': 'bg-orange-200'
  }

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-amber-800 mb-4 block">← Voltar</a>
        <h1 className="text-2xl font-bold text-amber-900 mb-6">📋 Vendas Registradas</h1>

        {loading ? (
          <div className="text-center text-amber-700">Carregando...</div>
        ) : vendas.length === 0 ? (
          <div className="text-center text-amber-700 bg-white rounded-xl p-8">
            Nenhuma venda registrada ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {vendas.map(v => (
              <div key={v.id} className={`${cores[v.produto] || 'bg-white'} rounded-xl p-4 shadow flex justify-between items-center`}>
                <div>
                  <div className="font-bold text-amber-900">{v.produto}</div>
                  <div className="text-sm text-amber-700">{v.data} {v.hora} — {v.cliente || 'Cliente não informado'}</div>
                  <div className="text-sm text-amber-700">{v.quantidade} {v.produto === 'Atacado' ? 'balde(s)' : 'un.'} × R$ {Number(v.valor_unitario).toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-900 text-lg">R$ {Number(v.total_venda).toFixed(2).replace('.', ',')}</div>
                  <button onClick={() => cancelarVenda(v.id)}
                    className="text-red-500 text-sm hover:text-red-700 mt-1">
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