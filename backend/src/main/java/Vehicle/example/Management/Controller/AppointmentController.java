package Vehicle.example.Management.Controller;

import Vehicle.example.Management.DTO.BookAppointmentRequest;
import Vehicle.example.Management.List.Appointment;
import Vehicle.example.Management.List.ProviderList;
import Vehicle.example.Management.Repository.AppointmentRepository;
import Vehicle.example.Management.Service.AppointmentService;
import Vehicle.example.Management.Repository.ProviderRepo;
import Vehicle.example.Management.DTO.AppointmentResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/appointment")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private ProviderRepo providerRepo;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // Simple booking endpoint
    @PostMapping("/book/simple")
    public ResponseEntity<?> bookAppointmentSimple(@RequestBody BookAppointmentRequest request) {
        try {
            // Create new Appointment object (CORRECT SPELLING)
            Appointment appointment = new Appointment();
            appointment.setName(request.getName());
            appointment.setPhone(request.getPhone());
            appointment.setVehicleName(request.getVehicleName());
            appointment.setVehicleNumber(request.getVehicleNumber());
            appointment.setServiceType(request.getServiceType());

            // Convert String to LocalDate
            if (request.getDate() != null && !request.getDate().isEmpty()) {
                try {
                    LocalDate date = LocalDate.parse(request.getDate());
                    appointment.setDate(date);
                } catch (DateTimeParseException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid date format. Please use YYYY-MM-DD format.");
                }
            }

            // Convert String to LocalTime
            if (request.getTime() != null && !request.getTime().isEmpty()) {
                try {
                    LocalTime time = LocalTime.parse(request.getTime());
                    appointment.setTime(time);
                } catch (DateTimeParseException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid time format. Please use HH:mm format.");
                }
            }

            // Set provider if provided
            if (request.getProviderId() != null) {
                ProviderList provider = new ProviderList();
                provider.setId(request.getProviderId());
                appointment.setProvider(provider);
            }

            Appointment saved = appointmentService.bookAppointmentByUsername(appointment, request.getUsername());
            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error booking appointment: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }

    // Get appointments by provider name (owner name)
    @GetMapping("/owner/{ownerName}")
    public ResponseEntity<?> getAppointmentsByOwner(@PathVariable String ownerName) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByOwnerName(ownerName);
            if (appointments.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body("No appointments found for owner: " + ownerName);
            }

            List<AppointmentResponseDTO> dtos = appointments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching appointments: " + e.getMessage());
        }
    }

    // Get appointments by provider ID
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getAppointmentsByProvider(@PathVariable int providerId) {
        try {
            List<Appointment> appointments = appointmentService.getAppointmentsByProviderId(providerId);
            if (appointments.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body("No appointments found for provider ID: " + providerId);
            }

            List<AppointmentResponseDTO> dtos = appointments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching appointments: " + e.getMessage());
        }
    }

    // Get All Appointments
    @GetMapping("/all")
    public ResponseEntity<?> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentService.getAllAppointments();
            if (appointments.isEmpty()) {
                return ResponseEntity.status(HttpStatus.OK).body("No appointments found");
            }

            List<AppointmentResponseDTO> dtos = appointments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching appointments: " + e.getMessage());
        }
    }

    // Convert Appointment to DTO
    private AppointmentResponseDTO convertToDTO(Appointment appointment) {
        return new AppointmentResponseDTO(
                appointment.getId(),
                appointment.getName(),
                appointment.getPhone(),
                appointment.getVehicleName(),
                appointment.getVehicleNumber(),
                appointment.getServiceType(),
                appointment.getDate(),
                appointment.getTime(),
                appointment.getStatus() != null ? appointment.getStatus() : "Pending",
                appointment.getUser() != null ? appointment.getUser().getName() : null,
                appointment.getUser() != null ? appointment.getUser().getUsername() : null,
                appointment.getProvider() != null ? appointment.getProvider().getGaragename() : null,
                appointment.getProvider() != null ? appointment.getProvider().getOwnername() : null,
                appointment.getProvider() != null ? appointment.getProvider().getId() : null
        );
    }

    // Get All Providers (for dropdown)
    @GetMapping("/providers")
    public ResponseEntity<?> getAllProviders() {
        try {
            List<ProviderList> providers = providerRepo.findAll();
            return ResponseEntity.ok(providers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching providers: " + e.getMessage());
        }
    }
    // Add this to your AppointmentController.java
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {

        try {
            String newStatus = statusUpdate.get("status");
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);

            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Appointment not found with ID: " + id);
            }

            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(newStatus);

            Appointment updated = appointmentRepository.save(appointment);
            return ResponseEntity.ok(convertToDTO(updated));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating appointment status: " + e.getMessage());
        }
    }
}