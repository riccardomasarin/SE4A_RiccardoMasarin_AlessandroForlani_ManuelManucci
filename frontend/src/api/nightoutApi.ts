import axios from 'axios'
import type {
  CreatePaymentMethodRequest,
  CreatePromotionRequest,
  CreateSupportRequestRequest,
  EventDetailDto,
  EventSummaryDto,
  FriendshipDto,
  FriendUserDto,
  ManagerDashboardDto,
  MusicGenre,
  NotificationDto,
  PaymentMethodDto,
  PregameRoomDto,
  PrivacySettingsDto,
  ProfileDto,
  PrDashboardDto,
  PromotionDto,
  ReturnTransportDto,
  SavedEventDto,
  SendFriendRequestDto,
  SupportRequestDto,
  TicketDto,
  UpdatePrivacySettingsRequest,
  UpdatePromotionRequest,
  UpdateVenueRequest,
  UserDto,
  UserRole,
  VenueCategory,
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
  promoCode?: string
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
  userId?: number
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

export interface CreateEventRequest {
  title: string
  description: string
  venueId: number
  managerId: number
  startsAt: string
  musicGenre: MusicGenre
  dressCode: string
  ageRestriction: string
  entryCondition: string
  price: number
  vipPrice: number
  capacity: number
  imageUrl: string
}

export interface UpdateEventRequest {
  title: string
  description: string
  venueId: number
  managerId: number
  startsAt: string
  musicGenre: MusicGenre
  dressCode: string
  ageRestriction: string
  entryCondition: string
  price: number
  vipPrice: number
  capacity: number
  imageUrl: string
}

export interface UpdateProfileRequest {
  name: string
  email: string
  city: string
  musicPreferences: string[]
}

export const nightoutApi = {
  async getSession(role: UserRole): Promise<UserDto> {
    const response = await client.get<UserDto>('/demo/session', {
      params: { role },
    })

    return response.data
  },

  async getEvents(
    params?: EventFilterParams,
  ): Promise<EventSummaryDto[]> {
    const response = await client.get<EventSummaryDto[]>('/events', {
      params,
    })

    return response.data
  },

  async getEvent(
    id: number,
    userId?: number,
  ): Promise<EventDetailDto> {
    const response = await client.get<EventDetailDto>(
      `/events/${id}`,
      {
        params:
          userId !== undefined
            ? { userId }
            : undefined,
      },
    )

    return response.data
  },

  async getTickets(userId: number): Promise<TicketDto[]> {
    const response = await client.get<TicketDto[]>(
      `/users/${userId}/tickets`,
    )

    return response.data
  },

  async getManagerTickets(managerId: number): Promise<TicketDto[]> {
    const response = await client.get<TicketDto[]>('/manager/tickets', {
      params: { managerId },
    })

    return response.data
  },

  async getPrDashboard(prId: number): Promise<PrDashboardDto> {
    const response = await client.get<PrDashboardDto>('/pr/dashboard', {
      params: { prId },
    })

    return response.data
  },

  async getPrTickets(prId: number): Promise<TicketDto[]> {
    const response = await client.get<TicketDto[]>('/pr/tickets', {
      params: { prId },
    })

    return response.data
  },

  async requestTicket(request: TicketRequest): Promise<TicketDto> {
    const response = await client.post<TicketDto>('/tickets', request)

    return response.data
  },

  async cancelTicket(ticketId: number): Promise<TicketDto> {
    const response = await client.delete<TicketDto>(
      `/tickets/${ticketId}`,
    )

    return response.data
  },

  async getPregames(eventId?: number): Promise<PregameRoomDto[]> {
    const response = await client.get<PregameRoomDto[]>('/pregames', {
      params: eventId ? { eventId } : undefined,
    })

    return response.data
  },

  async getPregame(roomId: number): Promise<PregameRoomDto> {
    const response = await client.get<PregameRoomDto>(
      `/pregames/${roomId}`,
    )

    return response.data
  },

  async createPregame(
    request: PregameRequest,
  ): Promise<PregameRoomDto> {
    const response = await client.post<PregameRoomDto>(
      '/pregames',
      request,
    )

    return response.data
  },

  async joinPregame(
    roomId: number,
    userId: number,
  ): Promise<PregameRoomDto> {
    const response = await client.post<PregameRoomDto>(
      `/pregames/${roomId}/join`,
      undefined,
      {
        params: { userId },
      },
    )

    return response.data
  },

  async leavePregame(
    roomId: number,
    userId: number,
  ): Promise<PregameRoomDto> {
    const response = await client.post<PregameRoomDto>(
      `/pregames/${roomId}/leave`,
      undefined,
      {
        params: { userId },
      },
    )

    return response.data
  },

  async deletePregame(
    roomId: number,
    userId: number,
  ): Promise<void> {
    await client.delete(`/pregames/${roomId}`, {
      params: { userId },
    })
  },

  async getTransport(eventId: number): Promise<ReturnTransportDto[]> {
    const response = await client.get<ReturnTransportDto[]>(
      `/events/${eventId}/return-transport`,
    )

    return response.data
  },

  async getPartnerBars(): Promise<VenueDto[]> {
    const response = await client.get<VenueDto[]>('/partner-bars')

    return response.data
  },

  async getDashboard(
    managerId?: number,
  ): Promise<ManagerDashboardDto> {
    const response = await client.get<ManagerDashboardDto>(
      '/manager/dashboard',
      {
        params: managerId ? { managerId } : undefined,
      },
    )

    return response.data
  },

  async getManagerVenues(managerId: number): Promise<VenueDto[]> {
    const response = await client.get<VenueDto[]>('/manager/venues', {
      params: { managerId },
    })

    return response.data
  },

  async updateManagerVenue(
    venueId: number,
    request: UpdateVenueRequest,
  ): Promise<VenueDto> {
    const response = await client.put<VenueDto>(
      `/manager/venues/${venueId}`,
      request,
    )

    return response.data
  },

  async createManagerEvent(
    request: CreateEventRequest,
  ): Promise<EventDetailDto> {
    const response = await client.post<EventDetailDto>(
      '/manager/events',
      request,
    )

    return response.data
  },

  async getManagerEvents(
    managerId: number,
  ): Promise<EventDetailDto[]> {
    const response = await client.get<EventDetailDto[]>(
      '/manager/events',
      {
        params: { managerId },
      },
    )

    return response.data
  },

  async updateManagerEvent(
    eventId: number,
    request: UpdateEventRequest,
  ): Promise<EventDetailDto> {
    const response = await client.put<EventDetailDto>(
      `/manager/events/${eventId}`,
      request,
    )

    return response.data
  },

  async deleteManagerEvent(
    eventId: number,
    managerId: number,
  ): Promise<void> {
    await client.delete(`/manager/events/${eventId}`, {
      params: { managerId },
    })
  },

  async getManagerPromotions(
    venueId: number,
    managerId: number,
  ): Promise<PromotionDto[]> {
    const response = await client.get<PromotionDto[]>(
      '/promotions/manager',
      {
        params: {
          venueId,
          managerId,
        },
      },
    )

    return response.data
  },

  async getActivePromotions(
    venueId: number,
  ): Promise<PromotionDto[]> {
    const response = await client.get<PromotionDto[]>(
      '/promotions/active',
      {
        params: { venueId },
      },
    )

    return response.data
  },

  async createPromotion(
    request: CreatePromotionRequest,
  ): Promise<PromotionDto> {
    const response = await client.post<PromotionDto>(
      '/promotions',
      request,
    )

    return response.data
  },

  async updatePromotion(
    promotionId: number,
    request: UpdatePromotionRequest,
  ): Promise<PromotionDto> {
    const response = await client.put<PromotionDto>(
      `/promotions/${promotionId}`,
      request,
    )

    return response.data
  },

  async setPromotionStatus(
    promotionId: number,
    managerId: number,
    active: boolean,
  ): Promise<PromotionDto> {
    const response = await client.patch<PromotionDto>(
      `/promotions/${promotionId}/status`,
      undefined,
      {
        params: {
          managerId,
          active,
        },
      },
    )

    return response.data
  },

  async deletePromotion(
    promotionId: number,
    managerId: number,
  ): Promise<void> {
    await client.delete(`/promotions/${promotionId}`, {
      params: { managerId },
    })
  },

  async getProfile(userId: number): Promise<ProfileDto> {
    const response = await client.get<ProfileDto>(
      `/users/${userId}/profile`,
    )

    return response.data
  },

  async updateProfile(
    userId: number,
    request: UpdateProfileRequest,
  ): Promise<UserDto> {
    const response = await client.put<UserDto>(
      `/users/${userId}/profile`,
      request,
    )

    return response.data
  },

  async getPrivacySettings(
    userId: number,
  ): Promise<PrivacySettingsDto> {
    const response = await client.get<PrivacySettingsDto>(
      `/users/${userId}/privacy-settings`,
    )

    return response.data
  },

  async updatePrivacySettings(
    userId: number,
    request: UpdatePrivacySettingsRequest,
  ): Promise<PrivacySettingsDto> {
    const response = await client.put<PrivacySettingsDto>(
      `/users/${userId}/privacy-settings`,
      request,
    )

    return response.data
  },

  async updateAvatar(
    userId: number,
    file: File,
  ): Promise<UserDto> {
    const formData = new FormData()

    formData.append('file', file)

    const response = await client.post<UserDto>(
      `/users/${userId}/avatar`,
      formData,
    )

    return response.data
  },

  async removeAvatar(userId: number): Promise<UserDto> {
    const response = await client.delete<UserDto>(
      `/users/${userId}/avatar`,
    )

    return response.data
  },

  async getSavedEvents(
    userId: number,
  ): Promise<EventSummaryDto[]> {
    const response = await client.get<EventSummaryDto[]>(
      `/users/${userId}/saved-events`,
    )

    return response.data
  },

  async getSavedEvent(
    userId: number,
    eventId: number,
  ): Promise<SavedEventDto> {
    const response = await client.get<SavedEventDto>(
      `/users/${userId}/saved-events/${eventId}`,
    )

    return response.data
  },

  async saveEvent(
    userId: number,
    eventId: number,
  ): Promise<SavedEventDto> {
    const response = await client.post<SavedEventDto>(
      `/users/${userId}/saved-events/${eventId}`,
    )

    return response.data
  },

  async unsaveEvent(
    userId: number,
    eventId: number,
  ): Promise<SavedEventDto> {
    const response = await client.delete<SavedEventDto>(
      `/users/${userId}/saved-events/${eventId}`,
    )

    return response.data
  },

  async getNotifications(
    userId: number,
  ): Promise<NotificationDto[]> {
    const response = await client.get<NotificationDto[]>(
      `/users/${userId}/notifications`,
    )

    return response.data
  },

  async markNotificationRead(
    notificationId: number,
  ): Promise<NotificationDto> {
    const response = await client.patch<NotificationDto>(
      `/notifications/${notificationId}/read`,
    )

    return response.data
  },

  async searchUsers(
    currentUserId: number,
    query: string,
  ): Promise<FriendUserDto[]> {
    const response = await client.get<FriendUserDto[]>(
      '/friendships/search',
      {
        params: {
          currentUserId,
          query,
        },
      },
    )

    return response.data
  },

  async sendFriendRequest(
    request: SendFriendRequestDto,
  ): Promise<FriendshipDto> {
    const response = await client.post<FriendshipDto>(
      '/friendships',
      request,
    )

    return response.data
  },

  async getReceivedFriendRequests(
    userId: number,
  ): Promise<FriendshipDto[]> {
    const response = await client.get<FriendshipDto[]>(
      `/friendships/users/${userId}/requests/received`,
    )

    return response.data
  },

  async getSentFriendRequests(
    userId: number,
  ): Promise<FriendshipDto[]> {
    const response = await client.get<FriendshipDto[]>(
      `/friendships/users/${userId}/requests/sent`,
    )

    return response.data
  },

  async getFriends(userId: number): Promise<FriendUserDto[]> {
    const response = await client.get<FriendUserDto[]>(
      `/friendships/users/${userId}/friends`,
    )

    return response.data
  },

  async acceptFriendRequest(
    friendshipId: number,
    receiverId: number,
  ): Promise<FriendshipDto> {
    const response = await client.patch<FriendshipDto>(
      `/friendships/${friendshipId}/accept`,
      undefined,
      {
        params: { receiverId },
      },
    )

    return response.data
  },

  async rejectFriendRequest(
    friendshipId: number,
    receiverId: number,
  ): Promise<FriendshipDto> {
    const response = await client.patch<FriendshipDto>(
      `/friendships/${friendshipId}/reject`,
      undefined,
      {
        params: { receiverId },
      },
    )

    return response.data
  },

  async removeFriend(
    userId: number,
    friendUserId: number,
  ): Promise<void> {
    await client.delete(
      `/friendships/users/${userId}/friends/${friendUserId}`,
    )
  },

  async getFriendsAttending(
    userId: number,
    eventId: number,
  ): Promise<FriendUserDto[]> {
    const response = await client.get<FriendUserDto[]>(
      `/friendships/users/${userId}/events/${eventId}/friends-attending`,
    )

    return response.data
  },

  async createSupportRequest(
    userId: number,
    request: CreateSupportRequestRequest,
  ): Promise<SupportRequestDto> {
    const response = await client.post<SupportRequestDto>(
      `/users/${userId}/support-requests`,
      request,
    )

    return response.data
  },

  async getPaymentMethods(
    userId: number,
  ): Promise<PaymentMethodDto[]> {
    const response = await client.get<PaymentMethodDto[]>(
      `/users/${userId}/payment-methods`,
    )

    return response.data
  },

  async createPaymentMethod(
    userId: number,
    request: CreatePaymentMethodRequest,
  ): Promise<PaymentMethodDto> {
    const response = await client.post<PaymentMethodDto>(
      `/users/${userId}/payment-methods`,
      request,
    )

    return response.data
  },

  async setDefaultPaymentMethod(
    userId: number,
    paymentMethodId: number,
  ): Promise<PaymentMethodDto> {
    const response = await client.post<PaymentMethodDto>(
      `/users/${userId}/payment-methods/${paymentMethodId}/default`,
    )

    return response.data
  },

  async deletePaymentMethod(
    userId: number,
    paymentMethodId: number,
  ): Promise<void> {
    await client.delete(
      `/users/${userId}/payment-methods/${paymentMethodId}`,
    )
  },
}