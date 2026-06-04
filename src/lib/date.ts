export const APP_TIME_ZONE = 'America/Sao_Paulo'

export function formatDatePtBr(iso: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TIME_ZONE,
    ...options,
  }).format(new Date(iso))
}

export function formatTimePtBr(iso: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(new Date(iso))
}
