package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.entity.Subject;
import edu.cit.pureza.tutortime.entity.TutoringLocation;
import edu.cit.pureza.tutortime.repository.SubjectRepository;
import edu.cit.pureza.tutortime.repository.TutoringLocationRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class SubjectLocationController {

    @Autowired private SubjectRepository          subjectRepository;
    @Autowired private TutoringLocationRepository locationRepository;

    // ══════════ SUBJECTS ══════════════════════════════════════════════════

    /** GET /api/catalog/subjects — all active subjects (any role) */
    @GetMapping("/subjects")
    public ApiResponse<List<Subject>> getSubjects() {
        return ApiResponse.success(subjectRepository.findByIsActiveTrueOrderByNameAsc());
    }

    /** GET /api/catalog/subjects/all — all including inactive (admin) */
    @GetMapping("/subjects/all")
    public ApiResponse<List<Subject>> getAllSubjects() {
        return ApiResponse.success(subjectRepository.findAll());
    }

    /** POST /api/catalog/subjects */
    @PostMapping("/subjects")
    public ApiResponse<Subject> createSubject(@RequestBody NameRequest req) {
        if (req.getName() == null || req.getName().isBlank())
            return ApiResponse.error("INVALID", "Subject name is required.");
        if (subjectRepository.existsByNameIgnoreCase(req.getName().trim()))
            return ApiResponse.error("DUPLICATE", "A subject with that name already exists.");
        return ApiResponse.success(subjectRepository.save(
                Subject.builder().name(req.getName().trim()).build()));
    }

    /** PUT /api/catalog/subjects/{id} */
    @PutMapping("/subjects/{id}")
    public ApiResponse<Subject> updateSubject(@PathVariable Long id, @RequestBody NameRequest req) {
        return subjectRepository.findById(id).map(s -> {
            if (req.getName() != null && !req.getName().isBlank()) s.setName(req.getName().trim());
            if (req.getIsActive() != null) s.setIsActive(req.getIsActive());
            return ApiResponse.success(subjectRepository.save(s));
        }).orElse(ApiResponse.error("NOT_FOUND", "Subject not found."));
    }

    /** DELETE /api/catalog/subjects/{id} */
    @DeleteMapping("/subjects/{id}")
    public ApiResponse<String> deleteSubject(@PathVariable Long id) {
        if (!subjectRepository.existsById(id))
            return ApiResponse.error("NOT_FOUND", "Subject not found.");
        subjectRepository.deleteById(id);
        return ApiResponse.success("Subject deleted.");
    }

    // ══════════ LOCATIONS ═════════════════════════════════════════════════

    /** GET /api/catalog/locations — all active (any role) */
    @GetMapping("/locations")
    public ApiResponse<List<TutoringLocation>> getLocations() {
        return ApiResponse.success(locationRepository.findByIsActiveTrueOrderByNameAsc());
    }

    /** GET /api/catalog/locations/all — all including inactive (admin) */
    @GetMapping("/locations/all")
    public ApiResponse<List<TutoringLocation>> getAllLocations() {
        return ApiResponse.success(locationRepository.findAll());
    }

    /** POST /api/catalog/locations */
    @PostMapping("/locations")
    public ApiResponse<TutoringLocation> createLocation(@RequestBody LocationRequest req) {
        if (req.getName() == null || req.getName().isBlank())
            return ApiResponse.error("INVALID", "Location name is required.");
        if (locationRepository.existsByNameIgnoreCase(req.getName().trim()))
            return ApiResponse.error("DUPLICATE", "A location with that name already exists.");
        return ApiResponse.success(locationRepository.save(
                TutoringLocation.builder()
                        .name(req.getName().trim())
                        .description(req.getDescription())
                        .build()));
    }

    /** PUT /api/catalog/locations/{id} */
    @PutMapping("/locations/{id}")
    public ApiResponse<TutoringLocation> updateLocation(@PathVariable Long id, @RequestBody LocationRequest req) {
        return locationRepository.findById(id).map(l -> {
            if (req.getName() != null && !req.getName().isBlank()) l.setName(req.getName().trim());
            if (req.getDescription() != null) l.setDescription(req.getDescription());
            if (req.getIsActive() != null) l.setIsActive(req.getIsActive());
            return ApiResponse.success(locationRepository.save(l));
        }).orElse(ApiResponse.error("NOT_FOUND", "Location not found."));
    }

    /** DELETE /api/catalog/locations/{id} */
    @DeleteMapping("/locations/{id}")
    public ApiResponse<String> deleteLocation(@PathVariable Long id) {
        if (!locationRepository.existsById(id))
            return ApiResponse.error("NOT_FOUND", "Location not found.");
        locationRepository.deleteById(id);
        return ApiResponse.success("Location deleted.");
    }
}

@Data class NameRequest     { private String name; private Boolean isActive; }
@Data class LocationRequest { private String name; private String description; private Boolean isActive; }