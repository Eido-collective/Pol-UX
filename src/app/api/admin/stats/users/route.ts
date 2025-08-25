import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Compter tous les utilisateurs
    const userCount = await prisma.user.count()

    return NextResponse.json({ count: userCount })
  } catch (error) {
    console.error('Erreur lors du comptage des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors du comptage des utilisateurs' },
      { status: 500 }
    )
  }
}
