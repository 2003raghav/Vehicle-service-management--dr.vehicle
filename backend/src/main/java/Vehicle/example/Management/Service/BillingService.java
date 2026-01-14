package Vehicle.example.Management.Service;

import Vehicle.example.Management.List.Appointment;
import Vehicle.example.Management.List.Billing;
import Vehicle.example.Management.List.ProviderList;
import Vehicle.example.Management.Repository.AppointmentRepository;
import Vehicle.example.Management.Repository.BillingRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BillingService {

    @Autowired
    private BillingRepo billingRepo;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Transactional
    public List<Billing> getBillingByUser(Long userId) {
        try {
            System.out.println("Fetching billing records for user ID: " + userId);
            List<Billing> billings = billingRepo.findByUserId(userId);
            System.out.println("Found " + billings.size() + " billing records for user " + userId);

            // Initialize lazy collections
            billings.forEach(b -> {
                if (b.getServices() != null) {
                    b.getServices().size(); // Force initialization
                }
            });
            return billings;
        } catch (Exception e) {
            System.out.println("Error fetching billing for user " + userId + ": " + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public List<Billing> getBillingByProvider(String providerName) {
        List<Billing> billings = billingRepo.findByProviderName(providerName);

        // Initialize lazy collections
        billings.forEach(b -> {
            if (b.getServices() != null) {
                b.getServices().size(); // Force initialization
            }
        });

        return billings;
    }

    public Billing saveBilling(Billing billing) {
        return billingRepo.save(billing);
    }

    @Transactional
    public Billing updatePaymentStatus(Long id, String paymentStatus) {
        Optional<Billing> optionalBilling = billingRepo.findById(id);

        if (optionalBilling.isPresent()) {
            Billing billing = optionalBilling.get();
            billing.setPaymentStatus(paymentStatus);

            if ("paid".equals(paymentStatus)) {
                billing.setPaymentDate(LocalDateTime.now());
            }

            return billingRepo.save(billing);
        } else {
            throw new RuntimeException("Billing record not found with id: " + id);
        }
    }

    @Transactional
    public Billing updatePayment(Long id, String paymentStatus, String paymentMethod) {
        Optional<Billing> optionalBilling = billingRepo.findById(id);

        if (optionalBilling.isPresent()) {
            Billing billing = optionalBilling.get();
            billing.setPaymentStatus(paymentStatus);
            billing.setPaymentMethod(paymentMethod);

            if ("paid".equals(paymentStatus)) {
                billing.setPaymentDate(LocalDateTime.now());

                // Also update the associated appointment status if needed
                updateAppointmentStatusIfNeeded(billing.getAppointmentId());
            }

            return billingRepo.save(billing);
        } else {
            throw new RuntimeException("Billing record not found with id: " + id);
        }
    }

    // Helper method to update appointment status when payment is completed
    private void updateAppointmentStatusIfNeeded(Long appointmentId) {
        if (appointmentId != null) {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (appointmentOpt.isPresent()) {
                Appointment appointment = appointmentOpt.get();
                System.out.println("Appointment " + appointmentId + " associated with paid billing");
            }
        }
    }

    @Transactional
    public List<Billing> getBillingByPaymentStatus(String paymentStatus) {
        try {
            System.out.println("Fetching billing records with payment status: " + paymentStatus);
            List<Billing> billings = billingRepo.findByPaymentStatus(paymentStatus);
            System.out.println("Found " + billings.size() + " billing records with status: " + paymentStatus);

            // Initialize lazy collections
            billings.forEach(b -> {
                if (b.getServices() != null) {
                    b.getServices().size(); // Force initialization
                }
            });
            return billings;
        } catch (Exception e) {
            System.out.println("Error fetching billing with status " + paymentStatus + ": " + e.getMessage());
            throw e;
        }
    }

    public List<Billing> getBillingByAppointment(Long appointmentId) {
        List<Billing> billings = billingRepo.findByAppointmentId(appointmentId);

        // If no billing record exists, create a default one with PROPER appointmentId
        if (billings.isEmpty()) {
            Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);

            if (appointment.isPresent() && "completed".equals(appointment.get().getStatus())) {
                Billing defaultBilling = createBillingFromAppointment(appointment.get());
                billings = List.of(billingRepo.save(defaultBilling));
            }
        }

        return billings;
    }

    // NEW METHOD: Create billing from appointment with proper appointmentId
    @Transactional
    public Billing createBillingFromAppointment(Appointment appointment) {
        Billing billing = new Billing();

        // CRITICAL: Set the appointmentId properly
        billing.setAppointmentId(appointment.getId());
        billing.setPaymentStatus("pending");
        billing.setTotalAmount(calculateServiceAmount(appointment.getServiceType()));

        // Set other necessary fields from appointment
        billing.setVehicleName(appointment.getVehicleName());
        billing.setVehicleNumber(appointment.getVehicleNumber());

        // Get user ID from the User object
        if (appointment.getUser() != null) {
            billing.setUserId(appointment.getUser().getId());
        }

        // Get provider information from the ProviderList object
        if (appointment.getProvider() != null) {
            ProviderList provider = appointment.getProvider();
            billing.setProviderId((long) provider.getId());

            // Use garagename as provider name (or ownername if preferred)
            if (provider.getGaragename() != null && !provider.getGaragename().isEmpty()) {
                billing.setProviderName(provider.getGaragename());
            } else if (provider.getOwnername() != null && !provider.getOwnername().isEmpty()) {
                billing.setProviderName(provider.getOwnername());
            } else {
                billing.setProviderName("Service Provider");
            }
        } else {
            billing.setProviderName("Service Provider");
        }

        // Set date and time from appointment
        if (appointment.getDate() != null) {
            billing.setDate(appointment.getDate().toString());
        }
        if (appointment.getTime() != null) {
            billing.setTime(appointment.getTime().toString());
        }

        return billingRepo.save(billing);
    }

    // Overloaded method to create billing from appointment ID
    @Transactional
    public Billing createBillingFromAppointment(Long appointmentId) {
        Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);
        if (appointment.isPresent()) {
            return createBillingFromAppointment(appointment.get());
        } else {
            System.out.println("Appointment not found with ID: " + appointmentId);
            return null;
        }
    }

    // Helper method to calculate service amount
    private Double calculateServiceAmount(String serviceType) {
        if (serviceType == null) return 2000.00;

        switch (serviceType.toLowerCase()) {
            case "oil change":
                return 1500.00;
            case "tire rotation":
                return 1200.00;
            case "brake service":
                return 3500.00;
            case "engine diagnostic":
                return 2500.00;
            case "general maintenance":
                return 1800.00;
            default:
                return 2000.00;
        }
    }

    // Method to fix missing appointment IDs in existing billing records
    @Transactional
    public String fixMissingAppointmentIds() {
        List<Billing> allBillings = billingRepo.findAll();
        int fixedCount = 0;
        int alreadyCorrectCount = 0;

        for (Billing billing : allBillings) {
            if (billing.getAppointmentId() == null) {
                // Try to find matching appointment by vehicle and date
                List<Appointment> matchingAppointments = appointmentRepository
                        .findByVehicleNameAndVehicleNumber(
                                billing.getVehicleName(),
                                billing.getVehicleNumber()
                        );

                // Find the best match based on date
                Optional<Appointment> bestMatch = matchingAppointments.stream()
                        .filter(apt -> billing.getDate() == null ||
                                apt.getDate() != null && apt.getDate().toString().equals(billing.getDate()))
                        .findFirst();

                if (bestMatch.isPresent()) {
                    billing.setAppointmentId(bestMatch.get().getId());
                    billingRepo.save(billing);
                    fixedCount++;
                    System.out.println("Fixed billing " + billing.getId() + " with appointment " + bestMatch.get().getId());
                } else if (!matchingAppointments.isEmpty()) {
                    // Use first match if no date match found
                    billing.setAppointmentId(matchingAppointments.get(0).getId());
                    billingRepo.save(billing);
                    fixedCount++;
                    System.out.println("Fixed billing " + billing.getId() + " with appointment " + matchingAppointments.get(0).getId());
                }
            } else {
                alreadyCorrectCount++;
            }
        }

        return String.format("Fixed %d billing records. %d records already had appointment IDs.",
                fixedCount, alreadyCorrectCount);
    }
}