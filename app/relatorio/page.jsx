'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { listarVendasRelatorio, calcularTotalPorProduto, calcularQuantidadePorProduto } from '@/services/vendasService'
import { listarGastos } from '@/services/gastosService'

const PRODUTOS = ['Mel Pequeno', 'Mel Grande', 'Favo Grande', 'Atacado']
const CATEGORIAS_GASTO = ['Embalagens e Venda', 'Logística', 'Insumos e Produção', 'Equipamentos', 'Outros']

const cores = {
  'Mel Pequeno': 'bg-yellow-100',
  'Mel Grande': 'bg-yellow-200',
  'Favo Grande': 'bg-amber-200',
  'Atacado': 'bg-orange-300'
}

const coresPDF = {
  'Mel Pequeno': [254, 249, 195],
  'Mel Grande': [254, 240, 138],
  'Favo Grande': [253, 230, 138],
  'Atacado': [254, 215, 170]
}

export default function Relatorio() {
  const { usuario, loading: loadingAuth } = useAuth()
  const [vendas, setVendas] = useState([])
  const [gastos, setGastos] = useState([])
  const [mesSelecionado, setMesSelecionado] = useState('')
  const [mesesDisponiveis, setMesesDisponiveis] = useState([])
  const [exportando, setExportando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (usuario) {
      carregarVendas()
      carregarGastos()
    }
  }, [usuario])

  async function carregarVendas() {
    try {
      const data = await listarVendasRelatorio(usuario.id)
      setVendas(data)
      const meses = [...new Set(data.map(v => v.mes))].filter(Boolean)
      setMesesDisponiveis(meses)
      if (meses.length > 0) setMesSelecionado(meses[0])
    } catch (err) {
      setErro(err.message)
    }
  }

  async function carregarGastos() {
    try {
      const data = await listarGastos()
      setGastos(data)
    } catch (err) {
      setErro(err.message)
    }
  }

  const vendasFiltradas = vendas.filter(v => v.mes === mesSelecionado)

  // Filtra gastos pelo mesmo mês selecionado (formato MM/YYYY)
  const gastosFiltrados = gastos.filter(g => {
    if (!g.created_at) return false
    const data = new Date(g.created_at)
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const ano = data.getFullYear()
    return `${mes}/${ano}` === mesSelecionado
  })

  function totalProduto(produto) {
    return calcularTotalPorProduto(vendasFiltradas, produto)
  }

  function qtdProduto(produto) {
    return calcularQuantidadePorProduto(vendasFiltradas, produto)
  }

  function nVendasProduto(produto) {
    return vendasFiltradas.filter(v => v.produto === produto).length
  }

  function totalGastoCategoria(categoria) {
    return gastosFiltrados
      .filter(g => g.categoria === categoria)
      .reduce((acc, g) => acc + Number(g.valor), 0)
  }

  const totalMes = vendasFiltradas.reduce((acc, v) => acc + Number(v.total_venda), 0)
  const totalGastosMes = gastosFiltrados.reduce((acc, g) => acc + Number(g.valor), 0)
  const saldoMes = totalMes - totalGastosMes
  const ticketMedio = vendasFiltradas.length > 0 ? totalMes / vendasFiltradas.length : 0

  // ── Exportar PDF ────────────────────────────────────────────────────────────
  async function exportarPDF() {
    setExportando(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210
      const margin = 15
      let y = 20

      doc.setFillColor(120, 53, 15)
      doc.rect(0, 0, W, 30, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('Relatorio de Vendas', margin, 13)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Periodo: ${mesSelecionado}`, margin, 22)
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, W - margin, 22, { align: 'right' })
      y = 42

      // Cards resumo (agora 4: vendas, gastos, saldo, ticket)
      doc.setTextColor(0, 0, 0)
      const cardW = (W - margin * 2 - 15) / 4
      const cards = [
        { label: 'Total Vendido', value: `R$ ${totalMes.toFixed(2).replace('.', ',')}`, cor: [254, 243, 199] },
        { label: 'Total Gastos', value: `R$ ${totalGastosMes.toFixed(2).replace('.', ',')}`, cor: [254, 226, 226] },
        { label: 'Saldo', value: `R$ ${saldoMes.toFixed(2).replace('.', ',')}`, cor: saldoMes >= 0 ? [220, 252, 231] : [254, 226, 226] },
        { label: 'Ticket Medio', value: `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`, cor: [254, 243, 199] }
      ]
      cards.forEach((card, i) => {
        const x = margin + i * (cardW + 5)
        doc.setFillColor(...card.cor)
        doc.roundedRect(x, y, cardW, 20, 2, 2, 'F')
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(120, 53, 15)
        doc.text(card.label, x + cardW / 2, y + 7, { align: 'center' })
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(69, 26, 3)
        doc.text(card.value, x + cardW / 2, y + 16, { align: 'center' })
      })
      y += 28

      // Tabela produtos
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Resumo por Produto', margin, y)
      y += 6

      const colX = [margin, margin + 50, margin + 85, margin + 120, margin + 155]
      const colLabels = ['Produto', 'No. Vendas', 'Quantidade', 'Ticket Medio', 'Total']

      doc.setFillColor(120, 53, 15)
      doc.rect(margin, y, W - margin * 2, 8, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      colLabels.forEach((label, i) => doc.text(label, colX[i] + 2, y + 5.5))
      y += 8

      PRODUTOS.forEach(p => {
        const n = nVendasProduto(p)
        const qtd = qtdProduto(p)
        const total = totalProduto(p)
        const ticket = n > 0 ? (total / n).toFixed(2).replace('.', ',') : '0,00'
        const cor = coresPDF[p] || [245, 245, 245]
        doc.setFillColor(...cor)
        doc.rect(margin, y, W - margin * 2, 8, 'F')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(69, 26, 3)
        const vals = [p, n.toString(), `${qtd} ${p === 'Atacado' ? 'bal.' : 'un.'}`, `R$ ${ticket}`, `R$ ${total.toFixed(2).replace('.', ',')}`]
        vals.forEach((v, i) => doc.text(v, colX[i] + 2, y + 5.5))
        y += 8
      })

      doc.setFillColor(120, 53, 15)
      doc.rect(margin, y, W - margin * 2, 8, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('TOTAL DO MES', colX[0] + 2, y + 5.5)
      doc.text(vendasFiltradas.length.toString(), colX[1] + 2, y + 5.5)
      doc.text('—', colX[2] + 2, y + 5.5)
      doc.text('—', colX[3] + 2, y + 5.5)
      doc.text(`R$ ${totalMes.toFixed(2).replace('.', ',')}`, colX[4] + 2, y + 5.5)
      y += 14

      // Tabela gastos por categoria
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Gastos por Categoria', margin, y)
      y += 6

      doc.setFillColor(185, 28, 28)
      doc.rect(margin, y, W - margin * 2, 8, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('Categoria', margin + 2, y + 5.5)
      doc.text('Total', W - margin - 2, y + 5.5, { align: 'right' })
      y += 8

      CATEGORIAS_GASTO.forEach((cat, idx) => {
        const total = totalGastoCategoria(cat)
        doc.setFillColor(idx % 2 === 0 ? 254 : 252, idx % 2 === 0 ? 226 : 220, idx % 2 === 0 ? 226 : 220)
        doc.rect(margin, y, W - margin * 2, 8, 'F')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(127, 29, 29)
        doc.text(cat, margin + 2, y + 5.5)
        doc.text(`R$ ${total.toFixed(2).replace('.', ',')}`, W - margin - 2, y + 5.5, { align: 'right' })
        y += 8
      })

      doc.setFillColor(185, 28, 28)
      doc.rect(margin, y, W - margin * 2, 8, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('TOTAL DE GASTOS', margin + 2, y + 5.5)
      doc.text(`R$ ${totalGastosMes.toFixed(2).replace('.', ',')}`, W - margin - 2, y + 5.5, { align: 'right' })
      y += 14

      // Saldo final
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFillColor(saldoMes >= 0 ? 21 : 185, saldoMes >= 0 ? 128 : 28, saldoMes >= 0 ? 61 : 28)
      doc.rect(margin, y, W - margin * 2, 12, 'F')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('SALDO DO MES', margin + 2, y + 8)
      doc.text(`R$ ${saldoMes.toFixed(2).replace('.', ',')}`, W - margin - 2, y + 8, { align: 'right' })
      y += 20

      // Ranking
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Ranking do Mes', margin, y)
      y += 6

      const ranking = [...PRODUTOS].sort((a, b) => totalProduto(b) - totalProduto(a))
      const medalhas = ['1o', '2o', '3o', '4o']
      ranking.forEach((p, i) => {
        const cor = coresPDF[p] || [245, 245, 245]
        doc.setFillColor(...cor)
        doc.rect(margin, y, W - margin * 2, 8, 'F')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(69, 26, 3)
        doc.text(`${medalhas[i]} ${p}`, colX[0] + 2, y + 5.5)
        doc.text(`R$ ${totalProduto(p).toFixed(2).replace('.', ',')}`, W - margin - 2, y + 5.5, { align: 'right' })
        y += 8
      })
      y += 8

      // Histórico vendas
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Historico de Vendas — ' + mesSelecionado, margin, y)
      y += 6

      const colD = [margin, margin + 25, margin + 75, margin + 110, margin + 140, margin + 165]
      const colDLabels = ['Data', 'Produto', 'Cliente', 'Qtd', 'V. Unit.', 'Total']

      doc.setFillColor(180, 83, 9)
      doc.rect(margin, y, W - margin * 2, 8, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      colDLabels.forEach((label, i) => doc.text(label, colD[i] + 1, y + 5.5))
      y += 8

      vendasFiltradas.forEach((v, idx) => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 245, idx % 2 === 0 ? 255 : 230)
        doc.rect(margin, y, W - margin * 2, 7, 'F')
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(50, 30, 10)
        const vals = [
          v.data || '',
          v.produto,
          (v.cliente || '—').substring(0, 18),
          v.quantidade.toString(),
          `R$ ${Number(v.valor_unitario).toFixed(2).replace('.', ',')}`,
          `R$ ${Number(v.total_venda).toFixed(2).replace('.', ',')}`
        ]
        vals.forEach((val, i) => doc.text(val, colD[i] + 1, y + 4.8))
        y += 7
      })

      // Rodapé
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 150, 150)
        doc.text(`Pagina ${i} de ${totalPages} — Sistema de Vendas`, W / 2, 290, { align: 'center' })
      }

      doc.save(`relatorio-${mesSelecionado.replace('/', '-')}.pdf`)
    } catch (err) {
      setErro('Erro ao gerar PDF: ' + err.message)
    } finally {
      setExportando(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-amber-900">📊 Relatório de Vendas</h1>
          <button
            onClick={exportarPDF}
            disabled={exportando || vendasFiltradas.length === 0}
            className="bg-amber-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-amber-900 transition disabled:opacity-50 flex items-center gap-2"
          >
            {exportando ? '⏳ Gerando...' : '📄 Exportar PDF'}
          </button>
        </div>

        {erro && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">{erro}</div>
        )}

        {/* Filtro de mês */}
        <div className="bg-white rounded-xl p-4 shadow mb-6 flex flex-wrap items-center gap-4">
          <label className="font-bold text-amber-900">Período:</label>
          <select
            value={mesSelecionado}
            onChange={e => setMesSelecionado(e.target.value)}
            className="border border-amber-200 rounded-lg p-2 focus:outline-none focus:border-amber-500"
          >
            {mesesDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="ml-auto flex gap-6 text-right">
            <div>
              <div className="text-xs text-amber-600">Total do mês</div>
              <div className="font-bold text-amber-900">R$ {totalMes.toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="text-xs text-amber-600">Vendas</div>
              <div className="font-bold text-amber-900">{vendasFiltradas.length}</div>
            </div>
            <div>
              <div className="text-xs text-amber-600">Ticket médio</div>
              <div className="font-bold text-amber-900">R$ {ticketMedio.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
        </div>

        {/* Cards de balanço */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-100 rounded-xl p-5 text-center shadow">
            <div className="text-xs text-amber-700 mb-1">💰 Total Vendido</div>
            <div className="text-2xl font-bold text-amber-900">R$ {totalMes.toFixed(2).replace('.', ',')}</div>
          </div>
          <div className="bg-red-100 rounded-xl p-5 text-center shadow">
            <div className="text-xs text-red-700 mb-1">💸 Total Gasto</div>
            <div className="text-2xl font-bold text-red-900">R$ {totalGastosMes.toFixed(2).replace('.', ',')}</div>
          </div>
          <div className={`${saldoMes >= 0 ? 'bg-green-100' : 'bg-red-200'} rounded-xl p-5 text-center shadow`}>
            <div className={`text-xs mb-1 ${saldoMes >= 0 ? 'text-green-700' : 'text-red-700'}`}>🟢 Saldo</div>
            <div className={`text-2xl font-bold ${saldoMes >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              R$ {saldoMes.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>

        {/* Gastos por categoria */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="bg-red-700 text-white p-4 font-bold">💸 Gastos por Categoria</div>
          {CATEGORIAS_GASTO.map(cat => {
            const total = totalGastoCategoria(cat)
            const percentual = totalGastosMes > 0 ? ((total / totalGastosMes) * 100).toFixed(0) : 0
            return (
              <div key={cat} className="p-4 flex justify-between items-center border-b border-red-50 hover:bg-red-50 transition">
                <div className="font-medium text-gray-800">{cat}</div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{percentual}%</div>
                  <div className="font-bold text-red-800">R$ {total.toFixed(2).replace('.', ',')}</div>
                </div>
              </div>
            )
          })}
          <div className="bg-red-700 text-white p-4 flex justify-between font-bold">
            <div>TOTAL DE GASTOS</div>
            <div>R$ {totalGastosMes.toFixed(2).replace('.', ',')}</div>
          </div>
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
                  {['🥇', '🥈', '🥉', '4º'][i]} {p}
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
              calcularTotalPorProduto(vMes, p) > calcularTotalPorProduto(vMes, max) ? p : max
            , PRODUTOS[0])
            return (
              <div
                key={m}
                onClick={() => setMesSelecionado(m)}
                className={`p-4 flex justify-between items-center border-b border-amber-100 cursor-pointer hover:bg-amber-50 transition ${m === mesSelecionado ? 'bg-amber-50 font-bold' : ''}`}
              >
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