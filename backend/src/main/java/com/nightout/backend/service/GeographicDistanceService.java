package com.nightout.backend.service;

import com.nightout.backend.entity.AppUser;
import com.nightout.backend.entity.Venue;
import org.springframework.stereotype.Service;

@Service
public class GeographicDistanceService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    public Double calculateDistance(
            AppUser user,
            Venue venue
    ) {
        if (user == null || venue == null) {
            return null;
        }

        if (!user.hasCoordinates()
                || !venue.hasCoordinates()) {
            return null;
        }

        return calculateDistance(
                user.getLatitude(),
                user.getLongitude(),
                venue.getLatitude(),
                venue.getLongitude()
        );
    }

    public double calculateDistance(
            double startLatitude,
            double startLongitude,
            double endLatitude,
            double endLongitude
    ) {
        double latitudeDifference = Math.toRadians(
                endLatitude - startLatitude
        );

        double longitudeDifference = Math.toRadians(
                endLongitude - startLongitude
        );

        double startLatitudeRadians =
                Math.toRadians(startLatitude);

        double endLatitudeRadians =
                Math.toRadians(endLatitude);

        double haversine = Math.pow(
                Math.sin(latitudeDifference / 2),
                2
        ) + Math.cos(startLatitudeRadians)
                * Math.cos(endLatitudeRadians)
                * Math.pow(
                        Math.sin(longitudeDifference / 2),
                        2
                );

        double angularDistance = 2 * Math.atan2(
                Math.sqrt(haversine),
                Math.sqrt(1 - haversine)
        );

        double distance = EARTH_RADIUS_KM
                * angularDistance;

        return Math.round(distance * 10.0) / 10.0;
    }
}