import axios from 'axios'
import type {
  EventDetailDto,
  EventSummaryDto,
  ManagerDashboardDto,
  PregameRoomDto,
  ProfileDto,
  ReturnTransportDto,
  SavedEventDto,
  TicketDto,
  UserDto,
  UserRole,
  VenueDto,
  VenueCategory,
  MusicGenre,
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

export interface EventFilterParams {
  city?: string
  area?: string
  genre?: MusicGenre
  venueCategory?: VenueCategory
  date?: string
  fromDate?: string
  toDate?: string
  minPrice?: number
  maxPrice?: number
  entryCondition?: string
  search?: string
  featured?: boolean
  sort?: string
}

export const nightoutApi = {
  async getSession(role: UserRole): Promise<UserDto> {
    const response = await client.get<UserDto>('/demo/session', { params: { role } })
    return response.data
  },

  async getEvents(params?: EventFilterParams): Promise<EventSummaryDto[]> {
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

  async cancelTicket(ticketId: number): Promise<TicketDto> {
    const response = await client.delete<TicketDto>(`/tickets/${ticketId}`)
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

  async getSavedEvents(userId: number): Promise<EventSummaryDto[]> {
    const response = await client.get<EventSummaryDto[]>(`/users/${userId}/saved-events`)
    return response.data
  },

  async getSavedEvent(userId: number, eventId: number): Promise<SavedEventDto> {
    const response = await client.get<SavedEventDto>(`/users/${userId}/saved-events/${eventId}`)
    return response.data
  },

  async saveEvent(userId: number, eventId: number): Promise<SavedEventDto> {
    const response = await client.post<SavedEventDto>(`/users/${userId}/saved-events/${eventId}`)
    return response.data
  },

  async unsaveEvent(userId: number, eventId: number): Promise<SavedEventDto> {
    const response = await client.delete<SavedEventDto>(`/users/${userId}/saved-events/${eventId}`)
    return response.data
  },
}
