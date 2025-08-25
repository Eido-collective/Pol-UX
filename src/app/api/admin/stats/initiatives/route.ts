import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Compter toutes les initiatives
    const initiativeCount = await prisma.initiative.count()

    return NextResponse.json({ count: initiativeCount })
  } catch (error) {
    console.error('Erreur lors du comptage des initiatives:', error)
    return NextResponse.json(
      { error: 'Erreur lors du comptage des initiatives' },
      { status: 500 }
    )
  }
}
