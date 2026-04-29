export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 text-center mb-8">
          🍯 Sistema de Vendas
        </h1>
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