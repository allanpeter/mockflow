/**
 * Video meeting service — Jitsi Meet (self-hosted).
 *
 * No API key needed. Room URLs are generated deterministically from the booking ID.
 * Both learner and tutor join the same room URL.
 *
 * To switch providers later, just replace this file.
 */

export interface MeetingRoom {
  roomUrl: string
  hostRoomUrl: string  // same as roomUrl for Jitsi (no separate host link)
}

export function createMeeting(opts: { bookingId: string }): MeetingRoom {
  const base = process.env.JITSI_URL?.replace(/\/$/, '') ?? 'https://meet.jit.si'
  const roomUrl = `${base}/mockflow-${opts.bookingId}`

  return { roomUrl, hostRoomUrl: roomUrl }
}
