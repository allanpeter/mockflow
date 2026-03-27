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
  const room = `mockflow-${opts.bookingId}`
  // Disable lobby/moderator requirement so both participants can join freely
  const params = 'config.lobby.autoKnock=true&config.prejoinPageEnabled=false&config.requireDisplayName=false'
  const roomUrl = `${base}/${room}#${params}`

  return { roomUrl, hostRoomUrl: roomUrl }
}
