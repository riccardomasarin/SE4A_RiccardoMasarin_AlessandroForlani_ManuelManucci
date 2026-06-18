import axios from 'axios'
import type {
  EventDetailDto,
  EventSummaryDto,
  ManagerDashboardDto,
  PregameRoomDto,
  ProfileDto,
  ReturnTransportDto,
  TicketDto,
  UserDto,
  UserRole,
  VenueDto,
} from '../types/nightout'

const client = axios.create({
  baseURL: 'http://localhost:8080/api',
})

export interface TicketRequest {
  userId: number
  eventId: number
  ticketType: string
  salesChannel: string
}

export interface PregameRequest {
  title: string
  eventId: number
  hostId: number
  meetingLocation: string
  meetingTime: string
  maxParticipants: number
  description: string
  imageUrl: string
  officialPartner: boolean
}

export const nightoutApi = {
  async getSession(role: UserRole): Promise<UserDto> {
    const response = await client.get<UserDto>('/demo/session', { params: { role } })
    return response.data
  },

  async getEvents(params?: {
    city?: string
    genre?: string
    featured?: boolean
    sort?: string
  }): Promise<EventSummaryDto[]> {
    const response = await client.get<EventSummaryDto[]>('/events', { params })
    return response.data
  },

  async getEvent(id: number): Promise<EventDetailDto> {
    const response = await client.get<EventDetailDto>(`/events/${id}`)
    return response.data
  },

  async getTickets(userId: number): Promise<TicketDto[]> {
    const response = await client.get<TicketDto[]>(`/users/${userId}/tickets`)
    return response.data
  },

  async requestTicket(request: TicketRequest): Promise<TicketDto> {
    const response = await client.post<TicketDto>('/tickets', request)
    return response.data
  },

  async getPregames(eventId?: number): Promise<PregameRoomDto[]> {
    const response = await client.get<PregameRoomDto[]>('/pregames', {
      params: eventId ? { eventId } : undefined,
    })
    return response.data
  },

  async createPregame(request: PregameRequest): Promise<PregameRoomDto> {
    const response = await client.post<PregameRoomDto>('/pregames', request)
    return response.data
  },

  async joinPregame(roomId: number, userId: number): Promise<PregameRoomDto> {
    const response = await client.post<PregameRoomDto>(`/pregames/${roomId}/join`, undefined, {
      params: { userId },
    })
    return response.data
  },

  async getTransport(eventId: number): Promise<ReturnTransportDto[]> {
    const response = await client.get<ReturnTransportDto[]>(`/events/${eventId}/return-transport`)
    return response.data
  },

  async getPartnerBars(): Promise<VenueDto[]> {
    const response = await client.get<VenueDto[]>('/partner-bars')
    return response.data
  },

  async getDashboard(): Promise<ManagerDashboardDto> {
    const response = await client.get<ManagerDashboardDto>('/manager/dashboard')
    return response.data
  },

  async getProfile(userId: number): Promise<ProfileDto> {
    const response = await client.get<ProfileDto>(`/users/${userId}/profile`)
    return response.data
  },
}
