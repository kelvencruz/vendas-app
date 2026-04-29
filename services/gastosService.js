import { supabase } from '@/lib/supabase'

export async function criarGasto({ descricao, valor, categoria }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('gastos')
    .insert([{ descricao, valor, categoria, usuario_id: user.id }])
  if (error) throw error
  return data
}

export async function listarGastos() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function calcularTotalGastos() {
  const gastos = await listarGastos()
  return gastos.reduce((acc, g) => acc + Number(g.valor), 0)
}