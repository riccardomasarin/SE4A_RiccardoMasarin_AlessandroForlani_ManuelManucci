package com.nightout.backend.data;

import tools.jackson.databind.ObjectMapper;
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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(DemoDataLoader.class);

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

    private final ObjectMapper objectMapper;

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
            ReturnTransportOptionRepository transportRepository,
            ObjectMapper objectMapper
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
        this.objectMapper = objectMapper;
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

        WorkbookSeedData workbookSeed =
                WorkbookSeedData.load(objectMapper);

        SeedContext seedContext =
                createWorkbookSeedContext(workbookSeed);

        userRepository.saveAll(seedContext.users());
        venueRepository.saveAll(seedContext.venues());

        AppUser marco = seedContext.user("U001");
        AppUser sara = seedContext.user("U002");
        AppUser luca = seedContext.user("U003");
        AppUser gioia = seedContext.user("U004");
        AppUser paolo = seedContext.user("U005");
        AppUser prMarco = seedContext.pr("PR001");
        AppUser manager = seedContext.manager(
                "matteo.conti@nightout.demo"
        );

        Venue crush = seedContext.venue("V001");
        Venue fabric = seedContext.venue("V002");
        Venue volt = seedContext.venue("V003");
        Venue pineta = seedContext.venue("V004");
        Venue apollo = seedContext.venue("V007");
        Venue plastic = seedContext.venue("V010");
        Venue magnolia = seedContext.venue("V011");
        Venue fabrique = seedContext.venue("V013");
        Venue hollywood = seedContext.venue("V014");
        Venue oldFashion = seedContext.venue("V015");
        Venue magazzini = seedContext.venue("V016");
        Venue justme = seedContext.venue("V017");
        Venue gattopardo = seedContext.venue("V018");
        Venue amnesia = seedContext.venue("V019");
        Venue rocket = seedContext.venue("V021");
        Venue blueNote = seedContext.venue("V022");
        Venue biko = seedContext.venue("V023");
        Venue ceresio = seedContext.venue("V025");
        Venue deus = seedContext.venue("V028");

        Event crushFriday = event(
                "Urban Beats",
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
                "/images/events/after-exams-party.jpg",
                crush.getManager(),
                86,
                90,
                72,
                55
        );

        Event fabricNight = event(
                "Electronic Sessions",
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
                "/images/events/covermln-1.jpg",
                fabric.getManager(),
                78,
                84,
                71,
                46
        );

        Event voltHouse = event(
                "Midnight House",
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
                "/images/events/disco-2000s-revival.jpg",
                volt.getManager(),
                74,
                88,
                69,
                40
        );

        Event pinetaPop = event(
                "Neon Pop",
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
                "/images/events/international-students-night.jpg",
                pineta.getManager(),
                69,
                73,
                80,
                60
        );

        Event fullHollywood = event(
                "Late Night Flow",
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
                "/images/events/bob-milano.jpg",
                crush.getManager(),
                68,
                76,
                66,
                61
        );

        Event amnesiaMidnightPulse = event(
                "Midnight Pulse",
                "An all-night techno session built around immersive blue lighting, rolling bass and precision club sound.",
                amnesia,
                now.plusDays(5)
                        .withHour(23)
                        .withMinute(45),
                MusicGenre.TECHNO,
                "Dark clubwear",
                "21+",
                "Advance ticket or VIP area",
                22,
                42,
                650,
                96,
                true,
                "/images/events/amnesia-milano.jpg",
                amnesia.getManager(),
                92,
                96,
                78,
                58
        );

        Event plasticNeonDistrict = event(
                "Neon District",
                "A high-colour celebration of pop, disco and club classics in one of Milan's most iconic alternative rooms.",
                plastic,
                now.plusDays(7)
                        .withHour(23)
                        .withMinute(0),
                MusicGenre.POP,
                "Expressive clubwear",
                "18+",
                "Standard ticket or guest list",
                18,
                32,
                420,
                90,
                true,
                "/images/events/queer-club-night.jpg",
                plastic.getManager(),
                95,
                87,
                84,
                64
        );

        Event justmeSunsetRitual = event(
                "Sunset Ritual",
                "Golden-hour cocktails flow into melodic house beside Parco Sempione and the Torre Branca.",
                justme,
                now.plusDays(8)
                        .withHour(19)
                        .withMinute(30),
                MusicGenre.HOUSE,
                "Summer smart casual",
                "21+",
                "Aperitivo reservation or VIP table",
                20,
                55,
                360,
                89,
                true,
                "/images/events/justme-milano.jpg",
                justme.getManager(),
                93,
                88,
                92,
                78
        );

        Event gattopardoVelvetNights = event(
                "Velvet Nights",
                "An elegant R&B and soul evening under Il Gattopardo's vaulted interior, followed by a late club set.",
                gattopardo,
                now.plusDays(10)
                        .withHour(22)
                        .withMinute(30),
                MusicGenre.RNB,
                "Elegant",
                "23+",
                "Guest list or VIP table",
                28,
                60,
                500,
                87,
                true,
                "/images/events/queer-club-night.jpg",
                gattopardo.getManager(),
                91,
                86,
                88,
                57
        );

        Event oldFashionElectricGarden = event(
                "Electric Garden",
                "Open-air house grooves, garden lights and a late-night dance floor in Parco Sempione.",
                oldFashion,
                now.plusDays(12)
                        .withHour(21)
                        .withMinute(30),
                MusicGenre.HOUSE,
                "Smart casual",
                "21+",
                "Standard ticket or VIP table",
                20,
                45,
                700,
                91,
                true,
                "/images/events/old-fashion.jpg",
                oldFashion.getManager(),
                94,
                92,
                87,
                52
        );

        Event hollywoodAfterdark = event(
                "Afterdark",
                "A polished late-night mix of commercial hits, dance anthems and table service on Corso Como.",
                hollywood,
                now.plusDays(14)
                        .withHour(23)
                        .withMinute(30),
                MusicGenre.COMMERCIAL,
                "Elegant clubwear",
                "23+",
                "Guest list or VIP table",
                25,
                55,
                600,
                85,
                false,
                "/images/events/covermln-1.jpg",
                hollywood.getManager(),
                88,
                82,
                90,
                48
        );

        Event blueNoteMoonlightSessions = event(
                "Moonlight Sessions",
                "An intimate live set blending contemporary jazz, soul and late-night improvisation in the Isola district.",
                blueNote,
                now.plusDays(15)
                        .withHour(21)
                        .withMinute(0),
                MusicGenre.LIVE_MUSIC,
                "Smart casual",
                "18+",
                "Reserved seating",
                38,
                62,
                220,
                86,
                true,
                "/images/events/blue-note-milano.jpg",
                blueNote.getManager(),
                90,
                95,
                89,
                82
        );

        Event bikoUrbanFrequencies = event(
                "Urban Frequencies",
                "Live hip-hop, neo-soul and beat-driven performances from emerging Milan artists.",
                biko,
                now.plusDays(17)
                        .withHour(21)
                        .withMinute(30),
                MusicGenre.HIP_HOP,
                "Casual",
                "18+",
                "Advance ticket",
                16,
                25,
                300,
                82,
                false,
                "/images/events/biko-club.jpg",
                biko.getManager(),
                87,
                92,
                75,
                68
        );

        Event ceresioSkylineBeats = event(
                "Skyline Beats",
                "Rooftop house and nu-disco with poolside cocktails and panoramic views over Milan.",
                ceresio,
                now.plusDays(19)
                        .withHour(20)
                        .withMinute(0),
                MusicGenre.HOUSE,
                "Rooftop chic",
                "21+",
                "Aperitivo reservation or VIP table",
                30,
                70,
                240,
                93,
                true,
                "/images/events/navigli-house-session.jpg",
                ceresio.getManager(),
                96,
                91,
                95,
                80
        );

        Event apolloSecretRoom = event(
                "Secret Room",
                "An intimate house night in Apollo Club's retro rooms, with vinyl selections and late cocktails.",
                apollo,
                now.plusDays(21)
                        .withHour(22)
                        .withMinute(30),
                MusicGenre.HOUSE,
                "Retro casual",
                "21+",
                "Limited advance ticket",
                17,
                30,
                180,
                78,
                false,
                "/images/events/apollo-club.jpg",
                apollo.getManager(),
                86,
                89,
                84,
                74
        );

        Event rocketNavigliResonance = event(
                "Navigli Resonance",
                "Indie dance, synth-pop and electronic cuts in an underground club beside the Naviglio Grande.",
                rocket,
                now.plusDays(23)
                        .withHour(23)
                        .withMinute(0),
                MusicGenre.POP,
                "Casual",
                "18+",
                "Standard ticket",
                15,
                25,
                280,
                80,
                false,
                "/images/events/tempio-del-futuro-perduto-1-club-milano-xceed-efaa.jpg",
                rocket.getManager(),
                84,
                88,
                72,
                66
        );

        Event magazziniWarehouseSignal = event(
                "Warehouse Signal",
                "Raw industrial techno, warehouse visuals and an extended closing set at Magazzini Generali.",
                magazzini,
                now.plusDays(25)
                        .withHour(23)
                        .withMinute(45),
                MusicGenre.TECHNO,
                "Black casual",
                "21+",
                "Advance ticket only",
                26,
                45,
                900,
                94,
                true,
                "/images/events/magazzini-generali.jpg",
                magazzini.getManager(),
                91,
                97,
                76,
                45
        );

        Event magnoliaOpenAirEchoes = event(
                "Open Air Echoes",
                "An open-air programme of alternative rock and live bands beside the Idroscalo.",
                magnolia,
                now.plusDays(27)
                        .withHour(20)
                        .withMinute(30),
                MusicGenre.ROCK,
                "Relaxed outdoor",
                "16+",
                "Standard ticket",
                22,
                35,
                1200,
                88,
                true,
                "/images/events/circolo-magnolia.jpg",
                magnolia.getManager(),
                95,
                94,
                80,
                70
        );

        Event deusVinylCourtyard = event(
                "Vinyl Courtyard",
                "Selectors spin funk, soul and house records in Deus Cafe's hidden Isola courtyard.",
                deus,
                now.plusDays(29)
                        .withHour(19)
                        .withMinute(30),
                MusicGenre.HOUSE,
                "Relaxed",
                "18+",
                "Free entry before 21:00",
                0,
                18,
                160,
                74,
                false,
                "/images/events/santeria-toscana-31.jpg",
                deus.getManager(),
                89,
                84,
                91,
                85
        );

        Event fabriqueLatinVoltage = event(
                "Latin Voltage",
                "A large-format Latin and reggaeton night with live performers, dance crews and a full-stage finale.",
                fabrique,
                now.plusDays(31)
                        .withHour(22)
                        .withMinute(0),
                MusicGenre.LATIN,
                "Colourful clubwear",
                "18+",
                "Standard ticket or VIP area",
                24,
                45,
                1500,
                92,
                true,
                "/images/events/reggaeton-latin-urban-night.jpg",
                fabrique.getManager(),
                95,
                93,
                82,
                50
        );

        eventRepository.saveAll(
                List.of(
                        crushFriday,
                        fabricNight,
                        voltHouse,
                        pinetaPop,
                        fullHollywood,
                        amnesiaMidnightPulse,
                        plasticNeonDistrict,
                        justmeSunsetRitual,
                        gattopardoVelvetNights,
                        oldFashionElectricGarden,
                        hollywoodAfterdark,
                        blueNoteMoonlightSessions,
                        bikoUrbanFrequencies,
                        ceresioSkylineBeats,
                        apolloSecretRoom,
                        rocketNavigliResonance,
                        magazziniWarehouseSignal,
                        magnoliaOpenAirEchoes,
                        deusVinylCourtyard,
                        fabriqueLatinVoltage
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

        importWorkbookAssignments(
                workbookSeed,
                seedContext,
                List.of(
                        crushFriday,
                        fabricNight,
                        voltHouse,
                        pinetaPop,
                        fullHollywood,
                        amnesiaMidnightPulse,
                        plasticNeonDistrict,
                        justmeSunsetRitual,
                        gattopardoVelvetNights,
                        oldFashionElectricGarden,
                        hollywoodAfterdark,
                        blueNoteMoonlightSessions,
                        bikoUrbanFrequencies,
                        ceresioSkylineBeats,
                        apolloSecretRoom,
                        rocketNavigliResonance,
                        magazziniWarehouseSignal,
                        magnoliaOpenAirEchoes,
                        deusVinylCourtyard,
                        fabriqueLatinVoltage
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
                        "Pre-Electronic Sessions da Marco",
                        marco,
                        fabricNight,
                        "Via Borsieri 12",
                        fabricNight
                                .getStartsAt()
                                .minusHours(3),
                        8,
                        "Relaxed pre-serata before Electronic Sessions. Ticket holders only.",
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
                        "Casual aperitivo before Midnight House.",
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
                        "Your VIP ticket for Electronic Sessions is confirmed.",
                        false,
                        now.minusMinutes(35)
                )
        );

        notificationRepository.save(
                new UserNotification(
                        marco,
                        NotificationType.FRIEND_JOINED_EVENT,
                        "Sara joined Urban Beats.",
                        false,
                        now.minusMinutes(20)
                )
        );

        notificationRepository.save(
                new UserNotification(
                        paolo,
                        NotificationType.WAITING_LIST_AVAILABLE,
                        "You are currently on the Late Night Flow waiting list.",
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

    private SeedContext createWorkbookSeedContext(
            WorkbookSeedData seedData
    ) {
        validateWorkbookSeedCounts(seedData);

        Map<String, String> preservedUserAvatars =
                Map.of(
                        "U001", "/demo/avatar-marco.jpg",
                        "U002", "/demo/avatar-sara.jpg",
                        "U003", "/demo/avatar-luca.jpg",
                        "U004", "/demo/avatar-gioia.jpg",
                        "U005", "/demo/avatar-paolo.jpg",
                        "PR001", "/demo/avatar-pr-marco.jpg"
                );

        Map<String, String> preservedVenueImages =
                Map.of(
                        "V001", "/demo/crush.jpg",
                        "V002", "/demo/fabric.jpg",
                        "V003", "/demo/volt.jpg",
                        "V004", "/demo/pineta.jpg",
                        "V005", "/demo/botanist.jpg",
                        "V006", "/demo/nottingham.jpg"
                );

        List<AppUser> users = new ArrayList<>();
        Map<String, AppUser> usersByWorkbookId =
                new LinkedHashMap<>();
        Map<String, AppUser> prsByWorkbookId =
                new LinkedHashMap<>();
        Map<String, AppUser> managersByEmail =
                new LinkedHashMap<>();
        Map<String, AppUser> usersByEmail =
                new LinkedHashMap<>();

        for (WorkbookSeedData.UserSeed seed : seedData.users()) {
            if (seed.role() != UserRole.NORMAL_USER) {
                throw new IllegalStateException(
                        seed.workbookId()
                                + " must use NORMAL_USER"
                );
            }

            validateCoordinates(
                    seed.workbookId(),
                    seed.latitude(),
                    seed.longitude()
            );

            AppUser appUser = user(
                    seed.fullName(),
                    seed.email(),
                    seed.role(),
                    seed.city(),
                    seed.latitude(),
                    seed.longitude(),
                    seed.verified(),
                    seed.points(),
                    firstNonBlank(
                            seed.avatarUrl(),
                            preservedUserAvatars.get(
                                    seed.workbookId()
                            )
                    ),
                    seed.musicPreferences()
                            .toArray(String[]::new)
            );
            appUser.setPassword(seed.password());

            registerProfile(
                    seed.workbookId(),
                    appUser,
                    users,
                    usersByWorkbookId,
                    usersByEmail
            );
        }

        for (WorkbookSeedData.PrSeed seed : seedData.prs()) {
            if (seed.role() != UserRole.PR_MANAGER) {
                throw new IllegalStateException(
                        seed.workbookId()
                                + " must use PR_MANAGER"
                );
            }

            validateCoordinates(
                    seed.workbookId(),
                    seed.latitude(),
                    seed.longitude()
            );

            AppUser appUser = user(
                    seed.fullName(),
                    seed.email(),
                    seed.role(),
                    seed.city(),
                    seed.latitude(),
                    seed.longitude(),
                    seed.verified(),
                    seed.points(),
                    firstNonBlank(
                            seed.avatarUrl(),
                            preservedUserAvatars.get(
                                    seed.workbookId()
                            )
                    ),
                    seed.musicPreferences()
                            .toArray(String[]::new)
            );
            appUser.setPassword(seed.password());

            registerProfile(
                    seed.workbookId(),
                    appUser,
                    users,
                    prsByWorkbookId,
                    usersByEmail
            );
        }

        Map<String, WorkbookSeedData.ManagerSeed>
                managerSeedsByEmail = new LinkedHashMap<>();

        for (WorkbookSeedData.VenueSeed venueSeed
                : seedData.venues()) {
            WorkbookSeedData.ManagerSeed managerSeed =
                    venueSeed.manager();
            String managerEmail =
                    normalizeEmail(managerSeed.email());

            WorkbookSeedData.ManagerSeed previousSeed =
                    managerSeedsByEmail.putIfAbsent(
                            managerEmail,
                            managerSeed
                    );

            if (previousSeed != null) {
                validateRepeatedManager(
                        managerEmail,
                        previousSeed,
                        managerSeed
                );
                continue;
            }

            boolean preservedManager = managerEmail.equals(
                    "matteo.conti@nightout.demo"
            );

            AppUser appUser = user(
                    managerSeed.fullName(),
                    managerSeed.email(),
                    UserRole.VENUE_MANAGER,
                    managerSeed.city(),
                    preservedManager ? 45.4720 : null,
                    preservedManager ? 9.1880 : null,
                    managerSeed.verified(),
                    0,
                    firstNonBlank(
                            managerSeed.avatarUrl(),
                            preservedManager
                                    ? "/demo/avatar-manager.jpg"
                                    : null
                    ),
                    preservedManager
                            ? new String[]{"House", "Techno"}
                            : new String[0]
            );
            appUser.setPassword(managerSeed.password());

            registerEmail(appUser, usersByEmail);
            managersByEmail.put(managerEmail, appUser);
            users.add(appUser);
        }

        if (managersByEmail.size() != 19) {
            throw new IllegalStateException(
                    "Expected 19 unique venue managers, found "
                            + managersByEmail.size()
            );
        }

        List<Venue> venues = new ArrayList<>();
        Map<String, Venue> venuesByWorkbookId =
                new LinkedHashMap<>();

        for (WorkbookSeedData.VenueSeed seed
                : seedData.venues()) {
            validateCoordinates(
                    seed.workbookId(),
                    seed.latitude(),
                    seed.longitude()
            );

            if (seed.rating() < 0 || seed.rating() > 5) {
                throw new IllegalStateException(
                        seed.workbookId()
                                + " has rating outside 0-5"
                );
            }

            AppUser venueManager = managersByEmail.get(
                    normalizeEmail(seed.manager().email())
            );

            Venue venue = venue(
                    seed.name(),
                    seed.category(),
                    seed.address(),
                    seed.city(),
                    seed.area(),
                    seed.latitude(),
                    seed.longitude(),
                    seed.description(),
                    seed.partnerBar(),
                    seed.rating(),
                    firstNonBlank(
                            seed.imageUrl(),
                            preservedVenueImages.get(
                                    seed.workbookId()
                            )
                    ),
                    venueManager
            );

            String venueId = normalizeId(seed.workbookId());
            if (venuesByWorkbookId.putIfAbsent(
                    venueId,
                    venue
            ) != null) {
                throw new IllegalStateException(
                        "Duplicate venue workbook ID: "
                                + seed.workbookId()
                );
            }

            venues.add(venue);
        }

        return new SeedContext(
                List.copyOf(users),
                List.copyOf(venues),
                Map.copyOf(usersByWorkbookId),
                Map.copyOf(prsByWorkbookId),
                Map.copyOf(managersByEmail),
                Map.copyOf(usersByEmail),
                Map.copyOf(venuesByWorkbookId)
        );
    }

    private void importWorkbookAssignments(
            WorkbookSeedData seedData,
            SeedContext seedContext,
            List<Event> events
    ) {
        Set<String> assignmentIds = new HashSet<>();
        Set<String> prEventKeys = new HashSet<>();
        Set<String> eventPromoKeys = new HashSet<>();

        for (PrEventAssignment assignment
                : prAssignmentRepository.findAll()) {
            prEventKeys.add(
                    assignment.getPr().getId()
                            + "|"
                            + assignment.getEvent().getId()
            );
            eventPromoKeys.add(
                    assignment.getEvent().getId()
                            + "|"
                            + normalizeText(
                                    assignment.getPromoCode()
                            )
            );
        }

        List<PrEventAssignment> resolvedAssignments =
                new ArrayList<>();
        int unresolvedAssignments = 0;

        for (WorkbookSeedData.AssignmentSeed seed
                : seedData.assignments()) {
            if (!assignmentIds.add(
                    normalizeId(seed.assignmentId())
            )) {
                throw new IllegalStateException(
                        "Duplicate assignment workbook ID: "
                                + seed.assignmentId()
                );
            }

            AppUser pr = seedContext.usersByEmail().get(
                    normalizeEmail(seed.prEmail())
            );
            if (pr == null || pr.getRole() != UserRole.PR_MANAGER) {
                throw new IllegalStateException(
                        seed.assignmentId()
                                + " references an invalid PR"
                );
            }

            Venue venue = seedContext.venuesByWorkbookId().get(
                    normalizeId(seed.venueId())
            );
            if (venue == null) {
                throw new IllegalStateException(
                        seed.assignmentId()
                                + " references an invalid venue"
                );
            }

            if (!normalizeText(venue.getName()).equals(
                    normalizeText(seed.venueName())
            )) {
                throw new IllegalStateException(
                        seed.assignmentId()
                                + " has an inconsistent venue name"
                );
            }

            Event event = resolveEvent(
                    events,
                    seed.eventReference(),
                    venue
            );
            if (event == null) {
                unresolvedAssignments++;
                continue;
            }

            String prEventKey = pr.getId()
                    + "|"
                    + event.getId();
            String eventPromoKey = event.getId()
                    + "|"
                    + normalizeText(seed.promoCode());

            if (!prEventKeys.add(prEventKey)) {
                throw new IllegalStateException(
                        seed.assignmentId()
                                + " duplicates a PR/event relationship"
                );
            }
            if (!eventPromoKeys.add(eventPromoKey)) {
                throw new IllegalStateException(
                        seed.assignmentId()
                                + " duplicates an event promo code"
                );
            }

            resolvedAssignments.add(
                    new PrEventAssignment(
                            pr,
                            event,
                            seed.promoCode(),
                            seed.discountPercentage(),
                            seed.commissionPerTicket(),
                            seed.active(),
                            LocalDateTime.parse(seed.createdAt())
                    )
            );
        }

        if (!resolvedAssignments.isEmpty()) {
            prAssignmentRepository.saveAll(resolvedAssignments);
        }

        LOGGER.info(
                "Workbook seed loaded: {} users, {} venues, {} PRs, "
                        + "{} resolved assignments, {} unresolved assignments",
                seedData.users().size(),
                seedData.venues().size(),
                seedData.prs().size(),
                resolvedAssignments.size(),
                unresolvedAssignments
        );
    }

    private Event resolveEvent(
            List<Event> events,
            String eventReference,
            Venue venue
    ) {
        String normalizedReference =
                normalizeText(eventReference);

        List<Event> matches = events.stream()
                .filter(event -> event.getVenue().getId()
                        .equals(venue.getId()))
                .filter(event -> {
                    if (normalizedReference.matches("\\d+")) {
                        return event.getId().equals(
                                Long.valueOf(normalizedReference)
                        );
                    }
                    return normalizeText(event.getTitle()).equals(
                            normalizedReference
                    );
                })
                .toList();

        if (matches.size() > 1) {
            throw new IllegalStateException(
                    "Ambiguous event reference: "
                            + eventReference
                            + " at "
                            + venue.getName()
            );
        }

        return matches.isEmpty() ? null : matches.getFirst();
    }

    private void registerProfile(
            String workbookId,
            AppUser appUser,
            List<AppUser> users,
            Map<String, AppUser> profilesByWorkbookId,
            Map<String, AppUser> usersByEmail
    ) {
        String normalizedId = normalizeId(workbookId);
        if (profilesByWorkbookId.putIfAbsent(
                normalizedId,
                appUser
        ) != null) {
            throw new IllegalStateException(
                    "Duplicate profile workbook ID: "
                            + workbookId
            );
        }

        registerEmail(appUser, usersByEmail);
        users.add(appUser);
    }

    private void registerEmail(
            AppUser appUser,
            Map<String, AppUser> usersByEmail
    ) {
        String email = normalizeEmail(appUser.getEmail());
        if (usersByEmail.putIfAbsent(email, appUser) != null) {
            throw new IllegalStateException(
                    "Duplicate profile email: "
                            + appUser.getEmail()
            );
        }
    }

    private void validateRepeatedManager(
            String email,
            WorkbookSeedData.ManagerSeed first,
            WorkbookSeedData.ManagerSeed repeated
    ) {
        if (!normalizeText(first.fullName()).equals(
                normalizeText(repeated.fullName())
        )
                || !normalizeText(first.city()).equals(
                        normalizeText(repeated.city())
                )
                || first.verified() != repeated.verified()
                || !Objects.equals(
                        first.avatarUrl(),
                        repeated.avatarUrl()
                )
                || !Objects.equals(
                        first.password(),
                        repeated.password()
                )) {
            throw new IllegalStateException(
                    "Conflicting manager rows for " + email
            );
        }
    }

    private void validateWorkbookSeedCounts(
            WorkbookSeedData seedData
    ) {
        if (seedData.users().size() != 20
                || seedData.venues().size() != 30
                || seedData.prs().size() != 10
                || seedData.assignments().size() != 30) {
            throw new IllegalStateException(
                    "Workbook seed row counts do not match "
                            + "20 users, 30 venues, 10 PRs, "
                            + "and 30 assignments"
            );
        }
    }

    private void validateCoordinates(
            String recordId,
            Double latitude,
            Double longitude
    ) {
        if (latitude == null
                || longitude == null
                || !Double.isFinite(latitude)
                || !Double.isFinite(longitude)
                || latitude < -90
                || latitude > 90
                || longitude < -180
                || longitude > 180) {
            throw new IllegalStateException(
                    recordId + " has invalid coordinates"
            );
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Workbook email cannot be blank"
            );
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeId(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalStateException(
                    "Workbook ID cannot be blank"
            );
        }
        return id.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeText(String text) {
        if (text == null) {
            return "";
        }
        return text.trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    private String firstNonBlank(
            String preferred,
            String fallback
    ) {
        return preferred == null || preferred.isBlank()
                ? fallback
                : preferred;
    }

    private record SeedContext(
            List<AppUser> users,
            List<Venue> venues,
            Map<String, AppUser> usersByWorkbookId,
            Map<String, AppUser> prsByWorkbookId,
            Map<String, AppUser> managersByEmail,
            Map<String, AppUser> usersByEmail,
            Map<String, Venue> venuesByWorkbookId
    ) {

        AppUser user(String workbookId) {
            return required(
                    usersByWorkbookId,
                    workbookId,
                    "user"
            );
        }

        AppUser pr(String workbookId) {
            return required(
                    prsByWorkbookId,
                    workbookId,
                    "PR"
            );
        }

        AppUser manager(String email) {
            return required(
                    managersByEmail,
                    email.toLowerCase(Locale.ROOT),
                    "venue manager"
            );
        }

        Venue venue(String workbookId) {
            return required(
                    venuesByWorkbookId,
                    workbookId.toUpperCase(Locale.ROOT),
                    "venue"
            );
        }

        private static <T> T required(
                Map<String, T> values,
                String key,
                String label
        ) {
            T value = values.get(key);
            if (value == null) {
                throw new IllegalStateException(
                        "Missing workbook " + label + ": " + key
                );
            }
            return value;
        }
    }

    private AppUser user(
            String name,
            String email,
            UserRole role,
            String city,
            Double latitude,
            Double longitude,
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

        user.setMusicPreferences(
                new LinkedHashSet<>(List.of(preferences))
        );

        return user;
    }

    private Venue venue(
            String name,
            VenueCategory category,
            String address,
            String city,
            String area,
            Double latitude,
            Double longitude,
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
