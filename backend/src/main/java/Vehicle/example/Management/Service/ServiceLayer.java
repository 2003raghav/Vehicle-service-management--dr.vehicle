package Vehicle.example.Management.Service;

import Vehicle.example.Management.List.Appointment;
import Vehicle.example.Management.List.ServiceDetails;
import Vehicle.example.Management.List.Update;
import Vehicle.example.Management.List.UserList;
import Vehicle.example.Management.Repository.AppointmentRepository;
import Vehicle.example.Management.Repository.ServiceRepo;
import Vehicle.example.Management.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServiceLayer {

    @Autowired
    private ServiceRepo serviceRepo;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepo userRepository;


    public List<ServiceDetails> getServicesByUsername(String username) {
        // First try to get existing service details
        List<ServiceDetails> existingServices = serviceRepo.findByUsername(username);

        if (!existingServices.isEmpty()) {
            return existingServices;
        }

        // If no service details exist, create them from appointments
        return createServiceDetailsFromAppointments(username);
    }

    private List<ServiceDetails> createServiceDetailsFromAppointments(String username) {
        Optional<UserList> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return List.of();
        }

        List<Appointment> appointments = appointmentRepository.findByUser(userOpt.get());

        return appointments.stream().map(this::convertAppointmentToServiceDetails).collect(Collectors.toList());
    }

    private ServiceDetails convertAppointmentToServiceDetails(Appointment appointment) {
        ServiceDetails service = new ServiceDetails();
        service.setUsername(appointment.getUser().getUsername());
        service.setVehicleModel(appointment.getVehicleName());
        service.setLicensePlate(appointment.getVehicleNumber());
        service.setServiceType(appointment.getServiceType());
        service.setDescription(appointment.getServiceType() + " service for " + appointment.getVehicleName());
        service.setStatus(mapAppointmentStatusToServiceStatus(appointment.getStatus()));
        service.setPriority(determinePriority(appointment.getServiceType()));
        service.setTechnician("Technician " + (appointment.getProvider() != null ? appointment.getProvider().getOwnername() : "Not Assigned"));

        // Create sample updates based on status
        service.setUpdates(createSampleUpdates(service.getStatus()));

        return service;
    }

    private String mapAppointmentStatusToServiceStatus(String appointmentStatus) {
        if (appointmentStatus == null) return "scheduled";
        switch (appointmentStatus.toLowerCase()) {
            case "completed": return "completed";
            case "in-progress": return "in-progress";
            case "confirmed": return "in-progress";
            default: return "scheduled";
        }
    }

    private String determinePriority(String serviceType) {
        if (serviceType == null) return "medium";
        switch (serviceType.toLowerCase()) {
            case "emergency":
            case "brake service":
                return "high";
            case "oil change":
            case "tire rotation":
                return "low";
            default:
                return "medium";
        }
    }

    private List<Update> createSampleUpdates(String status) {
        List<Update> updates = new ArrayList<>();

        // Common steps for all services
        updates.add(createUpdate("Vehicle Check-in", "Vehicle arrived at service center", true, "09:00 AM"));
        updates.add(createUpdate("Initial Inspection", "Basic inspection completed", true, "09:30 AM"));

        if ("in-progress".equals(status)) {
            updates.add(createUpdate("Service In Progress", "Currently working on the vehicle", false, "10:00 AM"));
        } else if ("completed".equals(status)) {
            updates.add(createUpdate("Service Completed", "All services completed successfully", true, "11:00 AM"));
            updates.add(createUpdate("Quality Check", "Final quality inspection passed", true, "11:30 AM"));
            updates.add(createUpdate("Ready for Pickup", "Vehicle ready for customer pickup", true, "12:00 PM"));
        }

        return updates;
    }

    private Update createUpdate(String step, String note, boolean completed, String timestamp) {
        Update update = new Update();
        update.setStep(step);
        update.setNote(note);
        update.setCompleted(completed);
        update.setTimestamp(timestamp);
        update.setTechnician("Auto Technician");
        return update;
    }

    public ServiceDetails saveService(ServiceDetails service) {
        return serviceRepo.save(service);
    }

    public ServiceDetails getServiceById(Long id) {
        return serviceRepo.findById(id).orElse(null);
    }
}




