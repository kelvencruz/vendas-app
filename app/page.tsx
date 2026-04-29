'use client'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/authService'

export default function Home() {
  const { usuario, loading } = useAuth() as { usuario: any, loading: boolean }

  async function sair() {
    await logout()
    window.location.href = '/login'
  }

  if (loading) return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-amber-800 text-xl">Carregando...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">
            🍯 Sistema de Vendas
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-amber-700 text-sm">{usuario?.email}</span>
            <button
              onClick={sair}
              className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm hover:bg-amber-200 transition"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/vendas/nova" className="bg-amber-800 text-white p-6 rounded-xl text-center hover:bg-amber-900 transition">
            <div className="text-4xl mb-2">🛒</div>
            <div className="font-bold text-lg">Nova Venda</div>
          </a>
          <a href="/vendas" className="bg-amber-600 text-white p-6 rounded-xl text-center hover:bg-amber-700 transition">
            <div className="text-4xl mb-2">📋</div>
            <div className="font-bold text-lg">Ver Vendas</div>
          </a>
          <a href="/relatorio" className="bg-amber-500 text-white p-6 rounded-xl text-center hover:bg-amber-600 transition">
            <div className="text-4xl mb-2">📊</div>
            <div className="font-bold text-lg">Relatório</div>
          </a>
        </div>
      </div>
    </main>
  )
}
