package Vehicle.example.Management.Service;

import Vehicle.example.Management.List.Appointment; // CORRECT IMPORT
import Vehicle.example.Management.List.UserList;
import Vehicle.example.Management.Repository.AppointmentRepository;
import Vehicle.example.Management.Repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final UserRepo userRepository;

    public AppointmentService(AppointmentRepository appointmentRepo, UserRepo userRepository) {
        this.appointmentRepo = appointmentRepo;
        this.userRepository = userRepository;
    }

    // Book appointment by username
    @Transactional
    public Appointment bookAppointmentByUsername(Appointment appointment, String username) {
        Optional<UserList> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found with username: " + username);
        }

        appointment.setUser(userOpt.get());
        if (appointment.getStatus() == null) {
            appointment.setStatus("Pending");
        }

        return appointmentRepo.save(appointment);
    }

    // Fetch all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    // Get appointments by provider name
    public List<Appointment> getAppointmentsByOwnerName(String ownerName) {
        return appointmentRepo.findByProviderOwnername(ownerName);
    }

    // Get appointments by provider ID
    public List<Appointment> getAppointmentsByProviderId(int providerId) {
        return appointmentRepo.findByProviderId(providerId);
    }
}