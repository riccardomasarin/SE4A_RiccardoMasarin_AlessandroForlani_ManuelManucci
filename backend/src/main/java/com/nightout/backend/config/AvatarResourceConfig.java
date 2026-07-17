package com.nightout.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AvatarResourceConfig implements WebMvcConfigurer {

    private final Path avatarDirectory =
            Paths.get("uploads", "avatars")
                    .toAbsolutePath()
                    .normalize();

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {
        String avatarLocation =
                avatarDirectory.toUri().toString();

        if (!avatarLocation.endsWith("/")) {
            avatarLocation += "/";
        }

        registry
                .addResourceHandler(
                        "/uploads/avatars/**"
                )
                .addResourceLocations(
                        avatarLocation
                );
    }
}
