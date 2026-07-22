export type UserRole =
  | 'NORMAL_USER'
  | 'PR_MANAGER'
  | 'VENUE_MANAGER'

export type AuthenticationRole =
  | 'USER'
  | 'VENUE'
  | 'PR'

export interface LoginResponseDto {
  authenticated: true
  profileId: number
  displayName: string
  email: string
  role: AuthenticationRole
}

export type MusicGenre =
  | 'TECHNO'
  | 'HOUSE'
  | 'HIP_HOP'
  | 'RNB'
  | 'POP'
  | 'COMMERCIAL'
  | 'LATIN'
  | 'ROCK'
  | 'LIVE_MUSIC'

export type VenueCategory =
  | 'CLUB'
  | 'BAR'
  | 'LOUNGE'
  | 'LIVE_MUSIC_VENUE'

export type TicketStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'WAITING_LIST'
  | 'CANCELLED'
  | 'EXPIRED'

export type FriendshipStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'

export type PromotionType =
  | 'DISCOUNT'
  | 'PROMO_CODE'
  | 'FREE_ENTRY'
  | 'SPECIAL_OFFER'

export interface UserDto {
  id: number
  name: string
  email: string
  role: UserRole
  city: string
  verified: boolean
  points: number
  avatarUrl: string | null
  musicPreferences: string[]
}

export interface FriendUserDto {
  id: number
  name: string
  city: string | null
  verified: boolean
  avatarUrl: string | null
}

export interface FriendshipDto {
  id: number
  sender: FriendUserDto
  receiver: FriendUserDto
  status: FriendshipStatus
  createdAt: string
  updatedAt: string
}

export interface SendFriendRequestDto {
  senderId: number
  receiverId: number
}

export interface PrivacySettingsDto {
  privateProfile: boolean
  showCity: boolean
  showMusicPreferences: boolean
  allowPregameInvites: boolean
  allowFriendRequests: boolean
}

export type UpdatePrivacySettingsRequest =
  PrivacySettingsDto

export interface VenueDto {
  id: number
  name: string
  category: VenueCategory
  address: string
  city: string
  area: string
  description: string | null
  partnerBar: boolean
  rating: number
  imageUrl: string | null
  phoneNumber: string | null
  contactEmail: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  tiktokUrl: string | null
}

export interface UpdateVenueRequest {
  managerId: number
  name: string
  category: VenueCategory
  address: string
  city: string
  area: string
  description: string | null
  imageUrl: string | null
  phoneNumber: string | null
  contactEmail: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  tiktokUrl: string | null
}

export interface PromotionDto {
  id: number
  venueId: number | null
  venueName: string | null
  eventId: number | null
  eventTitle: string | null
  label: string
  description: string | null
  type: PromotionType
  promoCode: string | null
  discountPercentage: number | null
  active: boolean
  validFrom: string | null
  validTo: string | null
}

export interface CreatePromotionRequest {
  venueId: number
  managerId: number
  eventId: number | null
  label: string
  description: string | null
  type: PromotionType
  promoCode: string | null
  discountPercentage: number | null
  active: boolean
  validFrom: string | null
  validTo: string | null
}

export interface UpdatePromotionRequest {
  managerId: number
  eventId: number | null
  label: string
  description: string | null
  type: PromotionType
  promoCode: string | null
  discountPercentage: number | null
  active: boolean
  validFrom: string | null
  validTo: string | null
}

export interface ReturnTransportDto {
  id: number
  provider: string
  label: string
  pickupTime: string
  pickupPoint: string
  destinationArea: string
  price: number
  status: string
}

export interface EventSummaryDto {
  id: number
  title: string
  venueName: string
  city: string
  area: string
  startsAt: string
  endsAt: string
  musicGenre: MusicGenre
  entryCondition: string
  price: number
  capacity: number
  confirmedTickets: number
  availableSpots: number
  distanceKm: number | null
  popularityScore: number
  featured: boolean
  imageUrl: string
  promotionLabels: string[]
}

export interface RecommendedEventDto {
  event: EventSummaryDto
  score: number
  reasons: string[]
}

export interface EventDetailDto {
  id: number
  title: string
  description: string
  venue: VenueDto
  startsAt: string
  endsAt: string
  musicGenre: MusicGenre
  dressCode: string
  ageRestriction: string
  entryCondition: string
  price: number
  vipPrice: number
  capacity: number
  confirmedTickets: number
  availableSpots: number
  distanceKm: number | null
  popularityScore: number
  atmosphereScore: number
  musicScore: number
  drinkScore: number
  lineScore: number
  featured: boolean
  imageUrl: string
  promotions: PromotionDto[]
  pregames: PregameRoomDto[]
  returnTransport: ReturnTransportDto[]
}

export interface SavedEventDto {
  userId: number
  eventId: number
  saved: boolean
  event: EventSummaryDto
}

export interface TicketDto {
  id: number
  code: string
  userId: number
  userName: string
  eventId: number
  eventTitle: string
  venueName: string
  venueAddress: string
  eventStartsAt: string
  status: TicketStatus
  ticketType: string
  pricePaid: number
  createdAt: string
  salesChannel: string
  qrPayload: string
  prId: number | null
  prName: string | null
  promoCodeUsed: string | null
  discountAmount: number
  commissionAmount: number
  checkedInAt: string | null
  checkedIn: boolean
}

export interface PregameRoomDto {
  id: number
  title: string
  eventId: number
  eventTitle: string
  hostId: number
  hostName: string
  meetingLocation: string
  meetingTime: string
  maxParticipants: number
  currentParticipants: number
  description: string
  imageUrl: string
  officialPartner: boolean
  participants: UserDto[]
}

export interface NotificationDto {
  id: number
  type: string
  message: string
  read: boolean
  createdAt: string
}

export interface ProfileDto {
  user: UserDto
  attendedNights: number
  activeTickets: number
  hostedPregames: number
  savedEvents: EventSummaryDto[]
  tickets: TicketDto[]
  notifications: NotificationDto[]
}

export interface SalesChannelDto {
  id: number
  name: string
  channelType: string
  ticketCount: number
  tableCount: number
  revenue: number
  checkins: number
  promoLabel: string
}

export interface ManagerDashboardDto {
  managerId: number
  managerName: string
  selectedEventId: number
  selectedEventTitle: string
  venueName: string
  totalTickets: number
  totalTables: number
  totalPregames: number
  todayRevenue: number
  checkinRate: number
  salesChannels: SalesChannelDto[]
  insightCards: string[]
  managedEvents: EventSummaryDto[]
}

export interface PrEventPerformanceDto {
  assignmentId: number
  eventId: number
  eventTitle: string
  venueName: string
  eventStartsAt: string
  promoCode: string
  discountPercentage: number
  commissionPerTicket: number
  active: boolean
  ticketsSold: number
  confirmedTickets: number
  cancelledTickets: number
  waitingListTickets: number
  checkins: number
  revenue: number
  commissionEarned: number
}

export interface PrDashboardDto {
  prId: number
  prName: string
  totalTicketsSold: number
  confirmedTickets: number
  cancelledTickets: number
  waitingListTickets: number
  totalCheckins: number
  totalRevenue: number
  totalCommissionEarned: number
  currentEvent: PrEventPerformanceDto | null
  eventPerformance: PrEventPerformanceDto[]
}

export interface CreateSupportRequestRequest {
  category: string
  subject: string
  message: string
}

export interface SupportRequestDto {
  id: number
  userId: number
  category: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export interface CreatePaymentMethodRequest {
  cardholderName: string
  brand: string
  lastFourDigits: string
  expiryMonth: number
  expiryYear: number
  defaultMethod: boolean
}

export interface PaymentMethodDto {
  id: number
  userId: number
  cardholderName: string
  brand: string
  lastFourDigits: string
  expiryMonth: number
  expiryYear: number
  defaultMethod: boolean
  createdAt: string
}
