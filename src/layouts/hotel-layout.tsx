import { Outlet } from 'react-router-dom'

export default function HotelLayout() {
  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-blue-700 text-white px-6 py-4">
        <h1 className="text-xl font-bold">Hotel Dashboard</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
