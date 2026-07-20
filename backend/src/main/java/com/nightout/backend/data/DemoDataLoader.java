package com.nightout.backend.data;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Event;
import com.nightout.backend.entity.EventParticipation;
import com.nightout.backend.entity.MusicGenre;
import com.nightout.backend.entity.NotificationType;
import com.nightout.backend.entity.PrEventAssignment;
import com.nightout.backend.entity.PregameRoom;
import com.nightout.backend.entity.Promotion;
import com.nightout.backend.entity.ReturnTransportOption;
import com.nightout.backend.entity.SalesChannel;
import com.nightout.backend.entity.SocialRelation;
import com.nightout.backend.entity.Ticket;
import com.nightout.backend.entity.TicketStatus;
import com.nightout.backend.entity.UserNotification;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.entity.Venue;
import com.nightout.backend.entity.VenueCategory;
import com.nightout.backend.repository.AppUserRepository;
import com.nightout.backend.repository.EventParticipationRepository;
import com.nightout.backend.repository.EventRepository;
import com.nightout.backend.repository.PrEventAssignmentRepository;
import com.nightout.backend.repository.PregameRoomRepository;
import com.nightout.backend.repository.PromotionRepository;
import com.nightout.backend.repository.ReturnTransportOptionRepository;
import com.nightout.backend.repository.SalesChannelRepository;
import com.nightout.backend.repository.SocialRelationRepository;
import com.nightout.backend.repository.TicketRepository;
import com.nightout.backend.repository.UserNotificationRepository;
import com.nightout.backend.repository.VenueRepository;
import com.nightout.backend.ticketstate.TicketStateFactory;
import java.time.LocalDateTime;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    private final PrEventAssignmentRepository
            prAssignmentRepository;

    private final PregameRoomRepository
            pregameRoomRepository;

    private final PromotionRepository
            promotionRepository;

    private final UserNotificationRepository
            notificationRepository;

    private final SocialRelationRepository
            socialRelationRepository;

    private final EventParticipationRepository
            participationRepository;

    private final SalesChannelRepository
            salesChannelRepository;

    private final ReturnTransportOptionRepository
            transportRepository;

    public DemoDataLoader(
            AppUserRepository userRepository,
            VenueRepository venueRepository,
            EventRepository eventRepository,
            TicketRepository ticketRepository,
            PrEventAssignmentRepository prAssignmentRepository,
            PregameRoomRepository pregameRoomRepository,
            PromotionRepository promotionRepository,
            UserNotificationRepository notificationRepository,
            SocialRelationRepository socialRelationRepository,
            EventParticipationRepository participationRepository,
            SalesChannelRepository salesChannelRepository,
            ReturnTransportOptionRepository transportRepository
    ) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
        this.prAssignmentRepository =
                prAssignmentRepository;
        this.pregameRoomRepository =
                pregameRoomRepository;
        this.promotionRepository =
                promotionRepository;
        this.notificationRepository =
                notificationRepository;
        this.socialRelationRepository =
                socialRelationRepository;
        this.participationRepository =
                participationRepository;
        this.salesChannelRepository =
                salesChannelRepository;
        this.transportRepository =
                transportRepository;
    }

    @Override
    public void run(
            String... args
    ) {
        if (userRepository.count() > 0) {
            return;
        }

        LocalDateTime now =
                LocalDateTime.now();

        AppUser marco = user(
                "Marco Rossi",
                "marco@nightout.demo",
                UserRole.NORMAL_USER,
                "Milano",
                45.4840,
                9.1890,
                true,
                1240,
                "/demo/avatar-marco.jpg",
                "Hip-Hop",
                "R&B",
                "House"
        );

        AppUser sara = user(
                "Sara Bianchi",
                "sara@nightout.demo",
                UserRole.NORMAL_USER,
                "Milano",
                45.4642,
                9.1900,
                true,
                870,
                "/demo/avatar-sara.jpg",
                "Pop",
                "Latin"
        );

        AppUser luca = user(
                "Luca Moretti",
                "luca@nightout.demo",
                UserRole.NORMAL_USER,
                "Milano",
                45.4510,
                9.1770,
                false,
                560,
                "/demo/avatar-luca.jpg",
                "Techno",
                "House"
        );

        AppUser gioia = user(
                "Gioia T.",
                "gioia@nightout.demo",
                UserRole.NORMAL_USER,
                "Milano",
                45.4785,
                9.2050,
                true,
                430,
                "/demo/avatar-gioia.jpg",
                "Commercial",
                "Pop"
        );

        AppUser paolo = user(
                "Paolo C.",
                "paolo@nightout.demo",
                UserRole.NORMAL_USER,
                "Milano",
                45.4930,
                9.1850,
                false,
                320,
                "/demo/avatar-paolo.jpg",
                "Rock",
                "Live music"
        );

        AppUser prMarco = user(
                "PR Marco",
                "prmarco@nightout.demo",
                UserRole.PR_MANAGER,
                "Milano",
                45.4780,
                9.1810,
                true,
                2100,
                "/demo/avatar-pr-marco.jpg",
                "Hip-Hop",
                "Commercial"
        );

        AppUser manager = user(
                "Lucia Venue",
                "manager@nightout.demo",
                UserRole.VENUE_MANAGER,
                "Milano",
                45.4720,
                9.1880,
                true,
                0,
                "/demo/avatar-manager.jpg",
                "House",
                "Techno"
        );

        userRepository.saveAll(
                Set.of(
                        marco,
                        sara,
                        luca,
                        gioia,
                        paolo,
                        prMarco,
                        manager
                )
        );

        Venue crush = venue(
                "Crush Club",
                VenueCategory.CLUB,
                "Corso Sempione 12",
                "Milano",
                "Sempione",
                45.4807,
                9.1669,
                "Young club with neon lights, hip-hop and R&B nights.",
                false,
                4.6,
                "/demo/crush.jpg",
                manager
        );

        Venue fabric = venue(
                "Fabric Milano",
                VenueCategory.CLUB,
                "Via Torino 12",
                "Milano",
                "Centro",
                45.4623,
                9.1874,
                "Demo venue for techno and VIP ticket flows.",
                false,
                4.5,
                "/demo/fabric.jpg",
                manager
        );

        Venue volt = venue(
                "Volt",
                VenueCategory.CLUB,
                "Via Molino delle Armi 16",
                "Milano",
                "Navigli",
                45.4547,
                9.1842,
                "House night with a direct NightOut promotion.",
                false,
                4.4,
                "/demo/volt.jpg",
                manager
        );

        Venue pineta = venue(
                "Pineta",
                VenueCategory.CLUB,
                "Viale Monte Grappa 18",
                "Milano",
                "Porta Nuova",
                45.4840,
                9.1877,
                "Pop and commercial venue with group offers.",
                false,
                4.2,
                "/demo/pineta.jpg",
                manager
        );

        Venue botanist = venue(
                "The Botanist Bar",
                VenueCategory.BAR,
                "Via Borsieri 12",
                "Milano",
                "Isola",
                45.4886,
                9.1874,
                "Official partner bar for relaxed pre-serata meetups.",
                true,
                4.3,
                "/demo/botanist.jpg",
                manager
        );

        Venue nottingham = venue(
                "Nottingham Forest",
                VenueCategory.BAR,
                "Viale Piave 1",
                "Milano",
                "Porta Venezia",
                45.4706,
                9.2054,
                "Partner cocktail bar with pregame deals.",
                true,
                4.7,
                "/demo/nottingham.jpg",
                manager
        );

        venueRepository.saveAll(
                Set.of(
                        crush,
                        fabric,
                        volt,
                        pineta,
                        botanist,
                        nottingham
                )
        );

        Event crushFriday = event(
                "Crush Friday",
                "Hip-hop and R&B night with smart casual dress code.",
                crush,
                now.plusDays(2)
                        .withHour(23)
                        .withMinute(0),
                MusicGenre.HIP_HOP,
                "Smart casual",
                "18+",
                "Standard entry or VIP area",
                15,
                25,
                260,
                94,
                true,
                "/demo/crush-event.jpg",
                manager,
                86,
                90,
                72,
                55
        );

        Event fabricNight = event(
                "Fabric Milano",
                "A demo VIP ticket night designed around the MyTicket mockup.",
                fabric,
                now.plusDays(2)
                        .withHour(23)
                        .withMinute(0),
                MusicGenre.TECHNO,
                "Dark casual",
                "18+",
                "-30% ingresso",
                15,
                25,
                180,
                88,
                true,
                "/demo/fabric-event.jpg",
                manager,
                78,
                84,
                71,
                46
        );

        Event voltHouse = event(
                "Volt House",
                "Blue lights, house music and fast-entry promo.",
                volt,
                now.plusDays(1)
                        .withHour(22)
                        .withMinute(30),
                MusicGenre.HOUSE,
                "Clubwear",
                "18+",
                "Ingresso gratuito entro 00:30",
                0,
                18,
                140,
                82,
                true,
                "/demo/volt-event.jpg",
                manager,
                74,
                88,
                69,
                40
        );

        Event pinetaPop = event(
                "Pineta Pop",
                "Commercial and pop night with group offers.",
                pineta,
                now.plusDays(3)
                        .withHour(22)
                        .withMinute(45),
                MusicGenre.POP,
                "Elegant casual",
                "18+",
                "Offerta gruppo",
                20,
                35,
                220,
                76,
                false,
                "/demo/pineta-event.jpg",
                manager,
                69,
                73,
                80,
                60
        );

        Event fullHollywood = event(
                "Hollywood Hip-Hop",
                "Small-capacity demo event for waiting list behavior.",
                crush,
                now.plusDays(4)
                        .withHour(23)
                        .withMinute(30),
                MusicGenre.HIP_HOP,
                "Urban",
                "18+",
                "Saltafila",
                25,
                40,
                2,
                70,
                false,
                "/demo/hollywood-event.jpg",
                manager,
                68,
                76,
                66,
                61
        );

        eventRepository.saveAll(
                Set.of(
                        crushFriday,
                        fabricNight,
                        voltHouse,
                        pinetaPop,
                        fullHollywood
                )
        );

        PrEventAssignment crushFridayPrMarco =
                new PrEventAssignment(
                        prMarco,
                        crushFriday,
                        "MARCO10",
                        10.0,
                        2.50,
                        true,
                        now.minusDays(5)
                );

        PrEventAssignment hollywoodPrMarco =
                new PrEventAssignment(
                        prMarco,
                        fullHollywood,
                        "MARCO5",
                        5.0,
                        3.00,
                        true,
                        now.minusDays(3)
                );

        prAssignmentRepository.saveAll(
                Set.of(
                        crushFridayPrMarco,
                        hollywoodPrMarco
                )
        );

        promotionRepository.save(
                new Promotion(
                        fabricNight,
                        fabric,
                        "-30% ingresso",
                        "Direct NightOut app discount for early arrivals.",
                        now.minusDays(1),
                        now.plusDays(3)
                )
        );

        promotionRepository.save(
                new Promotion(
                        voltHouse,
                        volt,
                        "Ingresso gratuito",
                        "Free entry before 00:30 for demo users.",
                        now.minusDays(1),
                        now.plusDays(2)
                )
        );

        promotionRepository.save(
                new Promotion(
                        pinetaPop,
                        pineta,
                        "Offerta gruppo",
                        "Group ticket bundle for 4+ people.",
                        now.minusDays(1),
                        now.plusDays(4)
                )
        );

        promotionRepository.save(
                new Promotion(
                        crushFriday,
                        crush,
                        "Donna free entro 00:30",
                        "PR list promotion visible in the dashboard.",
                        now.minusDays(1),
                        now.plusDays(2)
                )
        );

        /*
         * Tutti i ticket dimostrativi nascono PENDING.
         * Successivamente vengono portati allo stato
         * richiesto attraverso il pattern State.
         */

        Ticket marcoTicket =
                new Ticket(
                        "#A1-4892",
                        marco,
                        fabricNight,
                        TicketStatus.PENDING,
                        "VIP",
                        25,
                        now.minusHours(2),
                        "NightOut App",
                        "NIGHTOUT:"
                                + fabricNight.getId()
                                + ":"
                                + marco.getId()
                );

        TicketStateFactory
                .from(marcoTicket.getStatus())
                .confirm(marcoTicket);

        ticketRepository.save(
                marcoTicket
        );

        Ticket saraPrTicket =
                new Ticket(
                        "#A1-1024",
                        sara,
                        crushFriday,
                        TicketStatus.PENDING,
                        "Standard",
                        13.50,
                        now.minusHours(4),
                        "PR Code - MARCO10",
                        "NIGHTOUT:"
                                + crushFriday.getId()
                                + ":"
                                + sara.getId()
                );

        TicketStateFactory
                .from(saraPrTicket.getStatus())
                .confirm(saraPrTicket);

        saraPrTicket.setPrAssignment(
                crushFridayPrMarco
        );

        saraPrTicket.setPromoCodeUsed(
                "MARCO10"
        );

        saraPrTicket.setDiscountAmount(
                1.50
        );

        saraPrTicket.setCommissionAmount(
                2.50
        );

        ticketRepository.save(
                saraPrTicket
        );

        Ticket lucaTicket =
                new Ticket(
                        "#A1-1088",
                        luca,
                        fullHollywood,
                        TicketStatus.PENDING,
                        "Standard",
                        25,
                        now.minusHours(5),
                        "NightOut App",
                        "NIGHTOUT:"
                                + fullHollywood.getId()
                                + ":"
                                + luca.getId()
                );

        TicketStateFactory
                .from(lucaTicket.getStatus())
                .confirm(lucaTicket);

        ticketRepository.save(
                lucaTicket
        );

        Ticket gioiaPrTicket =
                new Ticket(
                        "#A1-1099",
                        gioia,
                        fullHollywood,
                        TicketStatus.PENDING,
                        "Standard",
                        23.75,
                        now.minusHours(5),
                        "PR Code - MARCO5",
                        "NIGHTOUT:"
                                + fullHollywood.getId()
                                + ":"
                                + gioia.getId()
                );

        TicketStateFactory
                .from(gioiaPrTicket.getStatus())
                .confirm(gioiaPrTicket);

        gioiaPrTicket.setPrAssignment(
                hollywoodPrMarco
        );

        gioiaPrTicket.setPromoCodeUsed(
                "MARCO5"
        );

        gioiaPrTicket.setDiscountAmount(
                1.25
        );

        gioiaPrTicket.setCommissionAmount(
                3.00
        );

        ticketRepository.save(
                gioiaPrTicket
        );

        Ticket paoloWaitingTicket =
                new Ticket(
                        "#A1-1101",
                        paolo,
                        fullHollywood,
                        TicketStatus.PENDING,
                        "Standard",
                        25,
                        now.minusHours(1),
                        "NightOut App",
                        "NIGHTOUT:"
                                + fullHollywood.getId()
                                + ":"
                                + paolo.getId()
                );

        TicketStateFactory
                .from(paoloWaitingTicket.getStatus())
                .moveToWaitingList(
                        paoloWaitingTicket
                );

        ticketRepository.save(
                paoloWaitingTicket
        );

        PregameRoom preFabric =
                new PregameRoom(
                        "Pre-Fabric da Marco",
                        marco,
                        fabricNight,
                        "Via Borsieri 12",
                        fabricNight
                                .getStartsAt()
                                .minusHours(3),
                        8,
                        "Relaxed pre-serata before Fabric. Ticket holders only.",
                        "/demo/pregame-marco.jpg",
                        false
                );

        preFabric.getParticipants()
                .addAll(
                        Set.of(
                                marco,
                                sara,
                                luca,
                                gioia,
                                paolo
                        )
                );

        PregameRoom navigli =
                new PregameRoom(
                        "Aperitivo Navigli",
                        sara,
                        voltHouse,
                        "Navigli",
                        voltHouse
                                .getStartsAt()
                                .minusHours(3),
                        6,
                        "Casual aperitivo before Volt House.",
                        "/demo/pregame-navigli.jpg",
                        false
                );

        navigli.getParticipants()
                .addAll(
                        Set.of(
                                sara,
                                luca,
                                gioia
                        )
                );

        PregameRoom botanistRoom =
                new PregameRoom(
                        "The Botanist Bar",
                        manager,
                        fabricNight,
                        "The Botanist Bar",
                        fabricNight
                                .getStartsAt()
                                .minusHours(4),
                        24,
                        "Official partner bar with -20% pregame deal.",
                        "/demo/botanist.jpg",
                        true
                );

        botanistRoom.getParticipants()
                .addAll(
                        Set.of(
                                marco,
                                sara,
                                luca
                        )
                );

        pregameRoomRepository.saveAll(
                Set.of(
                        preFabric,
                        navigli,
                        botanistRoom
                )
        );

        socialRelationRepository.save(
                new SocialRelation(
                        marco,
                        sara,
                        "FRIENDSHIP"
                )
        );

        socialRelationRepository.save(
                new SocialRelation(
                        marco,
                        luca,
                        "FRIENDSHIP"
                )
        );

        socialRelationRepository.save(
                new SocialRelation(
                        marco,
                        gioia,
                        "FOLLOWING"
                )
        );

        participationRepository.save(
                new EventParticipation(
                        marco,
                        crushFriday,
                        "SAVED"
                )
        );

        participationRepository.save(
                new EventParticipation(
                        sara,
                        fabricNight,
                        "ATTENDING"
                )
        );

        participationRepository.save(
                new EventParticipation(
                        luca,
                        voltHouse,
                        "SAVED"
                )
        );

        notificationRepository.save(
                new UserNotification(
                        marco,
                        NotificationType.RESERVATION_UPDATE,
                        "Your VIP ticket for Fabric Milano is confirmed.",
                        false,
                        now.minusMinutes(35)
                )
        );

        notificationRepository.save(
                new UserNotification(
                        marco,
                        NotificationType.FRIEND_JOINED_EVENT,
                        "Sara joined Crush Friday.",
                        false,
                        now.minusMinutes(20)
                )
        );

        notificationRepository.save(
                new UserNotification(
                        paolo,
                        NotificationType.WAITING_LIST_AVAILABLE,
                        "You are currently on the Hollywood Hip-Hop waiting list.",
                        false,
                        now.minusMinutes(10)
                )
        );

        salesChannelRepository.save(
                new SalesChannel(
                        crushFriday,
                        "NightOut App",
                        "Direct",
                        86,
                        5,
                        1290,
                        71,
                        "-30% ingresso"
                )
        );

        salesChannelRepository.save(
                new SalesChannel(
                        crushFriday,
                        "PR Marco",
                        "PR",
                        42,
                        4,
                        2030,
                        38,
                        "Donna free 00:30"
                )
        );

        salesChannelRepository.save(
                new SalesChannel(
                        crushFriday,
                        "PR Giulia",
                        "PR",
                        37,
                        3,
                        1505,
                        31,
                        "Early bird EUR 10"
                )
        );

        salesChannelRepository.save(
                new SalesChannel(
                        crushFriday,
                        "Organizer Luca",
                        "External",
                        21,
                        3,
                        950,
                        16,
                        "Bottle deal"
                )
        );

        transportRepository.save(
                new ReturnTransportOption(
                        fabricNight,
                        "Syncride",
                        "Shared ride to Isola",
                        fabricNight
                                .getStartsAt()
                                .plusHours(5),
                        "Fabric main entrance",
                        "Isola / Garibaldi",
                        8,
                        "Placeholder - no external integration"
                )
        );

        transportRepository.save(
                new ReturnTransportOption(
                        crushFriday,
                        "Syncride",
                        "Night shuttle to Navigli",
                        crushFriday
                                .getStartsAt()
                                .plusHours(5),
                        "Crush Club exit",
                        "Navigli",
                        7,
                        "Placeholder - no external integration"
                )
        );
    }

    private AppUser user(
            String name,
            String email,
            UserRole role,
            String city,
            double latitude,
            double longitude,
            boolean verified,
            int points,
            String avatarUrl,
            String... preferences
    ) {
        AppUser user =
                new AppUser(
                        name,
                        email,
                        role,
                        city,
                        latitude,
                        longitude,
                        verified,
                        points,
                        avatarUrl
                );

        user.getMusicPreferences()
                .addAll(
                        Set.of(preferences)
                );

        return user;
    }

    private Venue venue(
            String name,
            VenueCategory category,
            String address,
            String city,
            String area,
            double latitude,
            double longitude,
            String description,
            boolean partnerBar,
            double rating,
            String imageUrl,
            AppUser manager
    ) {
        return new Venue(
                name,
                category,
                address,
                city,
                area,
                latitude,
                longitude,
                description,
                partnerBar,
                rating,
                imageUrl,
                manager
        );
    }

    private Event event(
            String title,
            String description,
            Venue venue,
            LocalDateTime startsAt,
            MusicGenre musicGenre,
            String dressCode,
            String ageRestriction,
            String entryCondition,
            double price,
            double vipPrice,
            int capacity,
            int popularityScore,
            boolean featured,
            String imageUrl,
            AppUser manager,
            int atmosphereScore,
            int musicScore,
            int drinkScore,
            int lineScore
    ) {
        Event event =
                new Event(
                        title,
                        description,
                        venue,
                        startsAt,
                        musicGenre,
                        dressCode,
                        ageRestriction,
                        entryCondition,
                        price,
                        vipPrice,
                        capacity,
                        popularityScore,
                        featured,
                        imageUrl,
                        manager
                );

        event.setAtmosphereScore(
                atmosphereScore
        );

        event.setMusicScore(
                musicScore
        );

        event.setDrinkScore(
                drinkScore
        );

        event.setLineScore(
                lineScore
        );

        return event;
    }
}