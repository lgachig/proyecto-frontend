'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'
import Header from '../../../components/ui/Header'
import Sidebar from '../../../components/ui/Sidebar'

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    redirect('/login')
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    )
  }

  if (profile.role_id !== 'r003') {
    redirect('/user')
  }

  return (
    <>
      <Sidebar role="admin" />

      <Header user={profile} />
      
      <main className="pt-32 md:ml-[15%] px-8">
        {children}
      </main>
    </>
  )
}