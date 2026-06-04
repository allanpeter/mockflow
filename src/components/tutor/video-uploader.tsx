'use client'

import { useRef, useState } from 'react'
import { Upload, Video, Loader2, X, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const MAX_DURATION_SECONDS = 120 // 2 minutes
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

type TabType = 'record' | 'upload' | 'url'

interface Props {
  currentVideoUrl: string | null
  onVideoUrlChange: (url: string) => void
}

export function VideoUploader({ currentVideoUrl, onVideoUrlChange }: Readonly<Props>) {
  const [activeTab, setActiveTab] = useState<TabType>('record')
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedSeconds, setRecordedSeconds] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [manualUrl, setManualUrl] = useState(currentVideoUrl ?? '')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      })
      videoStreamRef.current = stream

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.muted = true
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      })
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setRecordedBlob(blob)
        setIsRecording(false)
        setRecordedSeconds(0)
        videoStreamRef.current?.getTracks().forEach((t) => t.stop())
      }

      setIsRecording(true)
      setRecordedSeconds(0)
      mediaRecorder.start()

      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording()
        toast.info('Gravação limitada a 2 minutos')
      }, MAX_DURATION_SECONDS * 1000)

      recordingTimerRef.current = setInterval(() => {
        setRecordedSeconds((s) => s + 1)
      }, 1000)
    } catch (err) {
      toast.error('Não foi possível acessar a câmera')
      console.error('Camera error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current)
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
    videoStreamRef.current?.getTracks().forEach((t) => t.stop())
  }

  const uploadRecordedVideo = async () => {
    if (!recordedBlob) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', recordedBlob, 'intro-video.webm')

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      const { videoUrl } = data
      onVideoUrlChange(videoUrl)
      setRecordedBlob(null)
      setActiveTab('record')
      toast.success('Vídeo enviado com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar vídeo'
      toast.error(message)
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande (máximo 50MB)')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      const { videoUrl } = data
      onVideoUrlChange(videoUrl)
      toast.success('Vídeo enviado com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar vídeo'
      toast.error(message)
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Vídeo de apresentação</Label>

      {currentVideoUrl && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Play className="h-4 w-4" />
            Vídeo atual
          </p>
          <p className="text-xs text-muted-foreground truncate">{currentVideoUrl}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs"
            onClick={() => onVideoUrlChange('')}
          >
            <X className="h-3 w-3 mr-1" />
            Remover
          </Button>
        </div>
      )}

      {/* Tab buttons */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab('record')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'record'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Gravar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'url'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          URL
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-3 pt-2">
        {/* Record Tab */}
        {activeTab === 'record' && (
          <>
            <div className="text-sm text-muted-foreground">
              Grave um vídeo curto (até 2 minutos) diretamente do seu celular ou webcam.
            </div>

            {!recordedBlob && !isRecording && (
              <Button
                type="button"
                onClick={startRecording}
                disabled={isUploading}
                className="w-full"
              >
                <Video className="h-4 w-4 mr-2" />
                Iniciar gravação
              </Button>
            )}

            {isRecording && (
              <>
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    className="w-full h-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {recordedSeconds}s / {MAX_DURATION_SECONDS}s
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={stopRecording}
                    size="sm"
                  >
                    Parar
                  </Button>
                </div>
              </>
            )}

            {recordedBlob && (
              <>
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    src={URL.createObjectURL(recordedBlob)}
                    controls
                    className="w-full h-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRecordedBlob(null)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Descartar
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadRecordedVideo}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar vídeo
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <>
            <div className="text-sm text-muted-foreground">
              Selecione um vídeo (MP4, WebM, etc.) do seu celular ou computador.
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Clique para selecionar</p>
              <p className="text-xs text-muted-foreground">ou arraste um arquivo aqui</p>
              <p className="text-xs text-muted-foreground mt-1">Máximo 50MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
          </>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <>
            <div className="text-sm text-muted-foreground">
              Cole a URL de um vídeo do YouTube, Loom, Vimeo ou Supabase.
            </div>
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=... ou Loom / Vimeo"
              value={manualUrl}
              onChange={(e) => {
                setManualUrl(e.target.value)
                onVideoUrlChange(e.target.value)
              }}
              disabled={isUploading}
            />
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Perfis com vídeo recebem muito mais agendamentos. Apresente-se em 30-60s.
      </p>
    </div>
  )
}
