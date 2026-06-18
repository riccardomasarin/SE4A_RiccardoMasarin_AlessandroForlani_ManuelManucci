export type UserRole = 'NORMAL_USER' | 'PR_MANAGER' | 'VENUE_MANAGER'

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

export type TicketStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'WAITING_LIST'
  | 'CANCELLED'
  | 'EXPIRED'

export interface UserDto {
  id: number
  name: string
  email: string
  role: UserRole
  city: string
  verified: boolean
  points: number
  avatarUrl: string
  musicPreferences: string[]
}

export interface VenueDto {
  id: number
  name: string
  category: string
  address: string
  city: string
  area: string
  description: string
  partnerBar: boolean
  rating: number
  imageUrl: string
}

export interface PromotionDto {
  id: number
  label: string
  description: string
  validFrom: string
  validTo: string
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
  musicGenre: MusicGenre
  entryCondition: string
  price: number
  capacity: number
  confirmedTickets: number
  availableSpots: number
  popularityScore: number
  featured: boolean
  imageUrl: string
  promotionLabels: string[]
}

export interface EventDetailDto {
  id: number
  title: string
  description: string
  venue: VenueDto
  startsAt: string
  musicGenre: MusicGenre
  dressCode: string
  ageRestriction: string
  entryCondition: string
  price: number
  vipPrice: number
  capacity: number
  confirmedTickets: number
  availableSpots: number
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
