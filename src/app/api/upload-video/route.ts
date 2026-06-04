import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 50MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileExtension = file.name.split('.').pop() || 'webm'
    const fileName = `${user.id}-${Date.now()}.${fileExtension}`

    const { data, error } = await supabase.storage
      .from('intro-videos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('[upload-video] Supabase error:', {
        message: error.message,
        status: error.status,
        fileName,
        fileSize: file.size,
        contentType: file.type,
      })

      if (error.message.includes('404') || error.message.includes('not found')) {
        return NextResponse.json({
          error: 'Bucket "intro-videos" não encontrado. Configure o bucket no Supabase Storage.'
        }, { status: 500 })
      }

      if (error.message.includes('permission')) {
        return NextResponse.json({
          error: 'Sem permissão. Verifique as políticas RLS do Supabase.'
        }, { status: 403 })
      }

      return NextResponse.json({ error: `Erro no upload: ${error.message}` }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('intro-videos').getPublicUrl(data.path)

    return NextResponse.json({ videoUrl: publicUrl })
  } catch (error) {
    console.error('[upload-video] Error:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Erro do servidor: ${message}` }, { status: 500 })
  }
}
