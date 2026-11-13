// El backend envía fechas en UTC sin zona horaria; se agrega 'Z' para que el navegador las convierta a hora local.
export function parseUtcDate(iso: string): Date {
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso)
  return new Date(hasTimezone ? iso : `${iso}Z`)
}

export function formatClock(iso: string): string {
  return parseUtcDate(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}
