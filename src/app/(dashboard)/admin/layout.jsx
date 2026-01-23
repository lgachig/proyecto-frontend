'use client'
import { redirect } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'
import Header from '../../../components/ui/Header'
import Sidebar from '../../../components/ui/Sidebar'
import RealtimeNotifier from '../../../components/ui/RealtimeNotifier' 

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-black text-[#003366]">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    redirect('/login')
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center font-black text-[#003366]">
        <p>Cargando perfil...</p>
      </div>
    )
  }

  if (profile.role_id !== 'r003') {
    redirect('/user')
  }

  return (
    <div className="relative min-h-screen"> 
      <Sidebar role="admin" />
      <Header user={profile} />
      
      <div className="fixed inset-0 pointer-events-none z-[99999]"> 
        <RealtimeNotifier />
      </div>
      
      <main className="pt-32 md:ml-[15%] px-8">
        {children}
      </main>
    </div>
  )
}