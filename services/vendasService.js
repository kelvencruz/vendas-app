import { supabase } from '@/lib/supabase'

export async function listarVendas(userId) {
  const { data, error } = await supabase
    .from('vendas')
    .select('*')
    .eq('cancelado', false)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Erro ao listar vendas: ' + error.message)
  return data
}

export async function criarVenda({ produto, cliente, quantidade, valorUnitario, userId, pesoBalde }) {
  if (!produto || !quantidade || !valorUnitario) {
    throw new Error('Preencha todos os campos obrigatórios.')
  }

  const agora = new Date()
  const mes = agora.toLocaleString('pt-BR', { month: 'long' }) + '/' + agora.getFullYear()

  // Atacado: quantidade de baldes × pesoBalde × valor por kg
  const totalVenda = produto === 'Atacado'
    ? Number(quantidade) * Number(pesoBalde || 20) * Number(valorUnitario)
    : Number(quantidade) * Number(valorUnitario)

  const { data, error } = await supabase.from('vendas').insert([{
    data: agora.toISOString().split('T')[0],
    hora: agora.toTimeString().split(' ')[0],
    produto,
    cliente: cliente || null,
    quantidade: Number(quantidade),
    valor_unitario: Number(valorUnitario),
    total_venda: totalVenda,
    mes,
    user_id: userId,
    cancelado: false
  }]).select().single()

  if (error) throw new Error('Erro ao criar venda: ' + error.message)
  return data
}

export async function cancelarVenda(id) {
  const { error } = await supabase
    .from('vendas')
    .update({ cancelado: true })
    .eq('id', id)

  if (error) throw new Error('Erro ao cancelar venda: ' + error.message)
}

export async function editarVenda(id, { produto, cliente, quantidade, valorUnitario, pesoBalde }) {
  // Atacado: quantidade de baldes × pesoBalde × valor por kg
  const totalVenda = produto === 'Atacado'
    ? Number(quantidade) * Number(pesoBalde || 20) * Number(valorUnitario)
    : Number(quantidade) * Number(valorUnitario)

  const { data, error } = await supabase
    .from('vendas')
    .update({
      produto,
      cliente: cliente || null,
      quantidade: Number(quantidade),
      valor_unitario: Number(valorUnitario),
      total_venda: totalVenda
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Erro ao editar venda: ' + error.message)
  return data
}

export async function listarVendasRelatorio(userId) {
  const { data, error } = await supabase
    .from('vendas')
    .select('*')
    .eq('cancelado', false)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Erro ao carregar relatório: ' + error.message)
  return data
}

export function calcularTotalPorProduto(vendas, produto) {
  return vendas
    .filter(v => v.produto === produto)
    .reduce((acc, v) => acc + Number(v.total_venda), 0)
}

export function calcularQuantidadePorProduto(vendas, produto) {
  return vendas
    .filter(v => v.produto === produto)
    .reduce((acc, v) => acc + Number(v.quantidade), 0)
}