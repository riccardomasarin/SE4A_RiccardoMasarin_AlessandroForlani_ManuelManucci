package com.nightout.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AvatarStorageService {

    private static final long MAX_AVATAR_SIZE =
            5L * 1024 * 1024;

    private static final Map<String, String> ALLOWED_TYPES =
            Map.of(
                    "image/jpeg", ".jpg",
                    "image/png", ".png",
                    "image/webp", ".webp"
            );

    private final Path avatarDirectory =
            Paths.get("uploads", "avatars")
                    .toAbsolutePath()
                    .normalize();

    public AvatarStorageService() {
        try {
            Files.createDirectories(avatarDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not create avatar directory",
                    exception
            );
        }
    }

    public String saveAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Profile picture is required"
            );
        }

        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The profile picture must be smaller than 5 MB"
            );
        }

        String extension =
                ALLOWED_TYPES.get(file.getContentType());

        if (extension == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPG, PNG and WebP images are allowed"
            );
        }

        String fileName =
                UUID.randomUUID() + extension;

        Path destination =
                avatarDirectory
                        .resolve(fileName)
                        .normalize();

        if (!destination.startsWith(avatarDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid avatar file"
            );
        }

        try (
                InputStream inputStream =
                        file.getInputStream()
        ) {
            Files.copy(
                    inputStream,
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save the profile picture"
            );
        }

        return "/uploads/avatars/" + fileName;
    }

    public void deleteAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) {
            return;
        }

        String normalizedUrl =
                avatarUrl.replace("\\", "/");

        int lastSlash =
                normalizedUrl.lastIndexOf('/');

        String fileName =
                lastSlash >= 0
                        ? normalizedUrl.substring(lastSlash + 1)
                        : normalizedUrl;

        if (fileName.isBlank()) {
            return;
        }

        Path avatarPath =
                avatarDirectory
                        .resolve(fileName)
                        .normalize();

        if (!avatarPath.startsWith(avatarDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(avatarPath);
        } catch (IOException exception) {
            System.err.println(
                    "Could not delete old avatar: "
                            + avatarPath
            );
        }
    }
}