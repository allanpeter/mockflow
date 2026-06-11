# Setup: Upload de Vídeos de Introdução

## Instruções para configurar o armazenamento de vídeos

### 1. Criar o bucket no Supabase Storage

1. Acesse [Supabase Console](https://supabase.com) → seu projeto
2. Vá para **Storage** na barra lateral esquerda
3. Clique em **Create a new bucket**
4. Nome: `intro-videos`
5. Deixe como **Public** (para que os vídeos sejam acessíveis)
6. Clique em **Create bucket**

### 2. Configurar as políticas de acesso (RLS)

1. No bucket `intro-videos`, clique em **Policies** (aba ao topo)
2. Clique em **New policy** → **For authenticated users only**
3. Configure:
   - **Operation**: SELECT
   - **Authenticated role**: checked
   - **Policy name**: Allow authenticated users to view all videos
   - **With condition**: (vazio/true)
4. Repita para:
   - **INSERT** — Usuários autenticados podem fazer upload
   - **DELETE** — Usuários podem deletar seus próprios vídeos (opcional)

### 3. Pronto! 

O sistema agora está pronto para:
- ✅ Gravar vídeos direto do navegador/celular (até 2 min)
- ✅ Upload de arquivo de vídeo local (até 50MB)
- ✅ Cola URL manual de YouTube, Loom, Vimeo

## Como funciona

### Frontend
- **Gravar**: Usa `MediaRecorder API` para capturar vídeo + áudio do dispositivo
- **Upload de arquivo**: Aceita qualquer formato de vídeo
- **URL manual**: Suporta YouTube, Loom, Vimeo ou URLs diretas do Supabase

### Backend
- Todos os uploads vão para `/api/upload-video` (novo endpoint)
- O endpoint valida autenticação, tamanho do arquivo e tipo
- Upload para o bucket `intro-videos` no Supabase Storage
- Retorna URL pública para exibição

### Armazenamento
- Vídeos são armazenados no Supabase Storage (s3-like)
- Nomes seguem padrão: `{userId}-{timestamp}.{extension}`
- URLs públicas são salvas no campo `intro_video_url` do perfil

## Limitações

- **Gravação**: Máximo 2 minutos de duração
- **Upload**: Máximo 50MB por arquivo
- **Formatos**: Suporta todos os formatos de vídeo (MP4, WebM, MOV, etc)
