package com.homefix.service;

import com.homefix.exception.InvalidFileException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final List<String> allowedTypes;
    private final long maxSizeBytes;

    public FileStorageService(
            @Value("${app.upload.dir:uploads}") String uploadDir,
            @Value("${app.upload.allowed-types:image/jpeg,image/png,image/webp}") String allowedTypesStr,
            @Value("${app.upload.max-file-size-bytes:10485760}") long maxSizeBytes) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.allowedTypes = Arrays.stream(allowedTypesStr.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .toList();
        this.maxSizeBytes = maxSizeBytes;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where uploaded files will be stored", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Cannot store an empty file");
        }

        if (file.getSize() > maxSizeBytes) {
            throw new InvalidFileException("File size exceeds maximum allowed limit of " + (maxSizeBytes / (1024 * 1024)) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new InvalidFileException("Unsupported file type: " + contentType + ". Allowed types: JPEG, PNG, WebP");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        if (originalFilename.contains("..")) {
            throw new InvalidFileException("Filename contains invalid path sequence: " + originalFilename);
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        } else if (contentType.equalsIgnoreCase("image/png")) {
            extension = ".png";
        } else if (contentType.equalsIgnoreCase("image/webp")) {
            extension = ".webp";
        } else {
            extension = ".jpg";
        }

        String storedFilename = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return storedFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file " + storedFilename, ex);
        }
    }

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new InvalidFileException("Invalid file access attempt");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new InvalidFileException("File not found or unreadable: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new InvalidFileException("Malformed file path: " + filename);
        }
    }

    public byte[] getFileBytes(String filename) {
        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new InvalidFileException("Invalid file access attempt");
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + filename, e);
        }
    }

    public String getFileAsBase64(String filename) {
        byte[] bytes = getFileBytes(filename);
        return Base64.getEncoder().encodeToString(bytes);
    }

    public String getContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }

    public Path getStorageLocation() {
        return this.fileStorageLocation;
    }
}
