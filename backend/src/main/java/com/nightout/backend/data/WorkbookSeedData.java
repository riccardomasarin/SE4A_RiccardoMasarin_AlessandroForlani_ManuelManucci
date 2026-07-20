package com.nightout.backend.data;

import tools.jackson.databind.ObjectMapper;
import com.nightout.backend.entity.UserRole;
import com.nightout.backend.entity.VenueCategory;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.springframework.core.io.ClassPathResource;

/**
 * Development seed records converted once from
 * Template_raccolta_dati_NightOut.xlsx.
 *
 * <p>The application reads JSON at startup and never parses Excel at runtime.
 */
record WorkbookSeedData(
        String sourceWorkbook,
        List<String> importedSheets,
        List<UserSeed> users,
        List<VenueSeed> venues,
        List<PrSeed> prs,
        List<AssignmentSeed> assignments
) {

    private static final String RESOURCE_PATH =
            "demo/nightout-workbook-seed.json";

    static WorkbookSeedData load(ObjectMapper objectMapper) {
        ClassPathResource resource =
                new ClassPathResource(RESOURCE_PATH);

        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(
                    inputStream,
                    WorkbookSeedData.class
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not load " + RESOURCE_PATH,
                    exception
            );
        }
    }

    record UserSeed(
            String workbookId,
            UserRole role,
            String firstName,
            String surname,
            String fullName,
            Integer age,
            String birthDate,
            String email,
            String city,
            String area,
            Double latitude,
            Double longitude,
            boolean verified,
            int points,
            List<String> musicPreferences,
            String avatarUrl,
            String notes
    ) {
    }

    record PrSeed(
            String workbookId,
            UserRole role,
            String firstName,
            String surname,
            String fullName,
            Integer age,
            String birthDate,
            String email,
            String city,
            Double latitude,
            Double longitude,
            boolean verified,
            int points,
            List<String> musicPreferences,
            String avatarUrl,
            String contact,
            String notes
    ) {
    }

    record ManagerSeed(
            String firstName,
            String surname,
            String fullName,
            String email,
            String city,
            boolean verified,
            String avatarUrl
    ) {
    }

    record VenueSeed(
            String workbookId,
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
            ManagerSeed manager,
            String notes
    ) {
    }

    record AssignmentSeed(
            String assignmentId,
            String prEmail,
            String venueId,
            String venueName,
            String eventReference,
            String promoCode,
            double discountPercentage,
            double commissionPerTicket,
            boolean active,
            String createdAt,
            String note
    ) {
    }
}
