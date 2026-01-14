package Vehicle.example.Management.Controller;

import Vehicle.example.Management.List.ProviderList;
import Vehicle.example.Management.Repository.ProviderRepo;
import Vehicle.example.Management.Service.ProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/provider")
@CrossOrigin
public class ProviderController {

    @Autowired
    private ProviderRepo providerRepo;
    @Autowired
    private ProviderService service;

    // Get all providers
    @GetMapping("/providerList")
    public ResponseEntity<List<ProviderList>> getList() {
        List<ProviderList> providers = service.getAllProviders();
        return ResponseEntity.ok(providers);
    }

    // Register provider
    @PostMapping("/register")
    public ResponseEntity<?> registerProvider(
            @RequestPart("provider") ProviderList provider,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            ProviderList savedProvider = service.registerProvider(provider, image);
            return new ResponseEntity<>(savedProvider, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>("Failed to register provider: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> loginProvider(@RequestBody Map<String, String> loginData) {
        String ownername = loginData.get("ownername");
        String password = loginData.get("password");

        if (ownername == null || password == null) {
            return ResponseEntity.badRequest().body("Ownername and password are required");
        }

        ProviderList provider = service.login(ownername, password);
        if (provider != null) {
            return ResponseEntity.ok(provider);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }
    }

    // Forgot password
    @PutMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String ownername = request.get("ownername");
        String newPassword = request.get("newPassword");

        String result = service.resetPassword(ownername, newPassword);
        if (result.contains("successful")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }

    // In ProviderController.java - Update the image endpoint
    @GetMapping("/images/{id}")
    public ResponseEntity<?> getProviderImage(@PathVariable int id) {
        try {
            byte[] imageData = service.getProviderImage(id);
            ProviderList provider = service.getProviderById(id);

            if (imageData == null || imageData.length == 0) {
                // Return a default image or 404 without image data
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Image not found for provider ID: " + id);
            }

            if (provider == null || provider.getImageType() == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(provider.getImageType()))
                    .body(imageData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving image: " + e.getMessage());
        }

    }

    // Get provider by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProviderList> getProvider(@PathVariable int id) {
        ProviderList provider = service.getProviderById(id);
        if (provider == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(provider);
    }
    // UPDATE PROVIDER PROFILE - CORRECTED METHOD
    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProviderProfile(
            @PathVariable int id,
            @RequestParam String garagename,
            @RequestParam String ownername,
            @RequestParam String garageaddress,
            @RequestParam String email,
            @RequestParam String phoneno,
            @RequestParam String specializations,
            @RequestParam String availableservices,
            @RequestParam(required = false) MultipartFile image) {

        try {
            // Find existing provider
            ProviderList existingProvider = service.getProviderById(id);
            if (existingProvider == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Provider not found"));
            }

            // Update provider fields
            existingProvider.setGaragename(garagename);
            existingProvider.setOwnername(ownername);
            existingProvider.setGarageaddress(garageaddress);
            existingProvider.setEmail(email);
            existingProvider.setPhoneno(Long.parseLong(phoneno));
            existingProvider.setSpecializations(specializations);
            existingProvider.setAvailableservices(availableservices);

            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                existingProvider.setImageName(image.getOriginalFilename());
                existingProvider.setImageType(image.getContentType());
                existingProvider.setImageData(image.getBytes());
            }

            // Save updated provider
            ProviderList updatedProvider = service.updateProvider(existingProvider);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("provider", updatedProvider);

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid phone number format"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update profile: " + e.getMessage()));
        }
    }


}
