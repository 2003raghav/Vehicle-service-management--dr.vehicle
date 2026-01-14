package Vehicle.example.Management.Controller;

import Vehicle.example.Management.List.ServiceDetails;
import Vehicle.example.Management.Service.ServiceLayer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin
public class ServiceDetailsController {

    @Autowired
    private ServiceLayer serviceDetailsService;

    // Get all services for a user
    @GetMapping("/{username}")
    public ResponseEntity<?> getServicesByUsername(@PathVariable String username) {
        try {
            List<ServiceDetails> services = serviceDetailsService.getServicesByUsername(username);
            if (services.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body("No services found for user: " + username);
            }
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching services: " + e.getMessage());
        }
    }

    // Add this endpoint to create a service if it doesn't exist
    @PostMapping("/create")
    public ResponseEntity<ServiceDetails> createService(@RequestBody ServiceDetails serviceDetails) {
        try {
            ServiceDetails savedService = serviceDetailsService.saveService(serviceDetails);
            return ResponseEntity.ok(savedService);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}