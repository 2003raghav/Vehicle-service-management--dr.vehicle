package Vehicle.example.Management.Controller;

import Vehicle.example.Management.List.ServiceDetails;
import Vehicle.example.Management.List.UserList;
import Vehicle.example.Management.Repository.UserRepo;
import Vehicle.example.Management.Service.ServiceClass;
import Vehicle.example.Management.Service.ServiceLayer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class ControllerClass {

    @Autowired
    private ServiceClass userService;

    @Autowired
    private UserRepo userRepository;


    // Get user by username
    @GetMapping("/users/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        Optional<UserList> userOpt = userService.getUserByUsername(username);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserList loginRequest) {
        UserList user = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (user != null) {
            return ResponseEntity.ok(Map.of(
                    "username", user.getUsername(),
                    "name", user.getName(),
                    "id", user.getId()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestParam String name,
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String email,
            @RequestParam Long phone,
            @RequestParam String address,
            @RequestParam String vehicletype,
            @RequestParam String vehiclemodel,
            @RequestParam Integer yearofmanufacture,
            @RequestParam String regno,
            @RequestParam String dateofbirth, // Make sure this parameter exists
            @RequestParam(required = false) MultipartFile image) {

        try {
            // Debug: Print received date
            System.out.println("Received dateofbirth: " + dateofbirth);

            // Parse the date string to Date object
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date dob = dateFormat.parse(dateofbirth);

            UserList user = new UserList();
            user.setName(name);
            user.setUsername(username);
            user.setPassword(password);
            user.setEmail(email);
            user.setPhone(phone);
            user.setAddress(address);
            user.setVehicletype(vehicletype);
            user.setVehiclemodel(vehiclemodel);
            user.setYearofmanufacture(yearofmanufacture);
            user.setRegno(regno);
            user.setDateofbirth(dob); // Make sure this is set

            // Handle image upload...

            UserList savedUser = userRepository.save(user);
            return ResponseEntity.ok("User registered successfully");

        } catch (ParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
    // Forgot password
    @PutMapping("/users/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String newPassword = request.get("newPassword");

        String result = userService.resetPassword(username, newPassword);
        if (result.toLowerCase().contains("successful")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }

    @GetMapping("/images/{imageName}")
    public ResponseEntity<Resource> getImage(@PathVariable String imageName) throws IOException {
        Path path = Paths.get(System.getProperty("user.dir"), "uploads", imageName);
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // detect content type dynamically
        String contentType = "image/jpeg";
        if(imageName.toLowerCase().endsWith(".png")) contentType = "image/png";
        else if(imageName.toLowerCase().endsWith(".gif")) contentType = "image/gif";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }


    @GetMapping("/{username}")
    public Optional<UserList> getUserServiceDetails(@PathVariable String username) {

        return userService.findByUsername(username);
    }

    // Update user profile
    @PutMapping("/users/{username}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String username,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam String address,
            @RequestParam String vehicletype,
            @RequestParam String vehiclemodel,
            @RequestParam String yearofmanufacture,
            @RequestParam String regno,
            @RequestParam String dateofbirth,
            @RequestParam(required = false) MultipartFile image) {

        try {
            // Find existing user
            Optional<UserList> existingUserOpt = userService.getUserByUsername(username);
            if (existingUserOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            UserList existingUser = existingUserOpt.get();

            // Update user fields
            existingUser.setName(name);
            existingUser.setEmail(email);
            existingUser.setPhone(Long.parseLong(phone));
            existingUser.setAddress(address);
            existingUser.setVehicletype(vehicletype);
            existingUser.setVehiclemodel(vehiclemodel);
            existingUser.setYearofmanufacture(Integer.parseInt(yearofmanufacture));
            existingUser.setRegno(regno);

            // Parse and set date of birth (from dd-MM-yyyy format)
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date dob = dateFormat.parse(dateofbirth);
            existingUser.setDateofbirth(dob);

            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                existingUser.setImageName(image.getOriginalFilename());
                existingUser.setImageType(image.getContentType());
                // If you have imageData field, set it here
                // existingUser.setImageData(image.getBytes());
            }

            // Save updated user
            UserList updatedUser = userService.updateUser(existingUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid number format for phone or year"));
        } catch (java.text.ParseException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use DD-MM-YYYY"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }


}
