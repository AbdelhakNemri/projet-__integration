package com.iset.controller;

import com.iset.dto.FieldDTO;
import com.iset.service.FieldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Field Controller
 * US13: Create field (OWNER only)
 * US14: Modify field (OWNER only)
 * US17: View available fields (PLAYER, OWNER, ADMIN)
 */
@RestController
@RequestMapping("/fields")
@CrossOrigin(origins = "http://localhost:4200")
public class FieldController {

    @Autowired
    private FieldService fieldService;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Field Service is running");
    }

    /**
     * Create a new field (US13)
     * Only OWNER role can create fields
     */
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping
    public ResponseEntity<FieldDTO> createField(@RequestBody FieldDTO fieldDTO) {
        try {
            FieldDTO createdField = fieldService.createField(fieldDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdField);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get field by ID
     * Accessible by any authenticated user
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<FieldDTO> getFieldById(@PathVariable Long id) {
        try {
            FieldDTO field = fieldService.getFieldById(id);
            return ResponseEntity.ok(field);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all available fields (US17)
     * Any authenticated user can view available fields
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<FieldDTO>> getAllAvailableFields() {
        List<FieldDTO> fields = fieldService.getAllAvailableFields();
        return ResponseEntity.ok(fields);
    }

    /**
     * Get current user's fields
     * OWNER can view their own fields
     */
    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/my-fields")
    public ResponseEntity<List<FieldDTO>> getMyFields() {
        try {
            List<FieldDTO> fields = fieldService.getMyFields();
            return ResponseEntity.ok(fields);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Search fields by city (US17)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/search/city/{city}")
    public ResponseEntity<List<FieldDTO>> searchByCity(@PathVariable String city) {
        List<FieldDTO> fields = fieldService.searchFieldsByCity(city);
        return ResponseEntity.ok(fields);
    }

    /**
     * Search fields by type (US17)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/search/type/{type}")
    public ResponseEntity<List<FieldDTO>> searchByType(@PathVariable String type) {
        List<FieldDTO> fields = fieldService.searchFieldsByType(type);
        return ResponseEntity.ok(fields);
    }

    /**
     * Search fields (general search) (US17)
     */
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER', 'ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<List<FieldDTO>> searchFields(@RequestParam String query) {
        List<FieldDTO> fields = fieldService.searchFields(query);
        return ResponseEntity.ok(fields);
    }

    /**
     * Update field (US14)
     * Only the owner can update their field
     */
    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<FieldDTO> updateField(@PathVariable Long id, @RequestBody FieldDTO fieldDTO) {
        try {
            FieldDTO updatedField = fieldService.updateField(id, fieldDTO);
            return ResponseEntity.ok(updatedField);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete field
     * Only the owner can delete their field
     */
    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteField(@PathVariable Long id) {
        try {
            fieldService.deleteField(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
