import { Outlet } from 'react-router-dom'

export default function FactoryLayout() {
  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-700 text-white px-6 py-4">
        <h1 className="text-xl font-bold">Factory Dashboard</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
