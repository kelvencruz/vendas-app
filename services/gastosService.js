import { supabase } from '@/lib/supabase'

export async function criarGasto({ descricao, valor, categoria }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('gastos')
    .insert([{ descricao, valor, categoria, usuario_id: user.id, cancelado: false }])
  if (error) throw error
  return data
}

export async function listarGastos() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('cancelado', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function cancelarGasto(id) {
  const { error } = await supabase
    .from('gastos')
    .update({ cancelado: true })
    .eq('id', id)
  if (error) throw new Error('Erro ao cancelar gasto: ' + error.message)
}

export async function calcularTotalGastos() {
  const gastos = await listarGastos()
  return gastos.reduce((acc, g) => acc + Number(g.valor), 0)
}