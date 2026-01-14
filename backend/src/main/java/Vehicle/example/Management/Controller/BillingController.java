package Vehicle.example.Management.Controller;

import Vehicle.example.Management.DTO.PaymentRequest;
import Vehicle.example.Management.List.Billing;
import Vehicle.example.Management.Service.BillingService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/billing")
@Transactional
public class BillingController {

    @Autowired
    private BillingService billingService;

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<Billing>> getBillingByUser(@PathVariable Long userId) {
        try {
            System.out.println("Fetching billing for user ID: " + userId);
            List<Billing> billings = billingService.getBillingByUser(userId);
            System.out.println("Found " + billings.size() + " billing records");
            return ResponseEntity.ok(billings);
        } catch (Exception e) {
            System.out.println("Error fetching billing for user " + userId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/provider/{providerName}")
    public ResponseEntity<List<Billing>> getBillingByProvider(@PathVariable String providerName) {
        try {
            System.out.println("Fetching billing for provider: " + providerName);
            List<Billing> billings = billingService.getBillingByProvider(providerName);
            System.out.println("Found " + billings.size() + " billing records for provider " + providerName);
            return ResponseEntity.ok(billings);
        } catch (Exception e) {
            System.out.println("Error fetching billing for provider " + providerName + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<Billing>> getBillingByAppointment(@PathVariable Long appointmentId) {
        try {
            System.out.println("Fetching billing for appointment ID: " + appointmentId);
            List<Billing> billings = billingService.getBillingByAppointment(appointmentId);
            System.out.println("Found " + billings.size() + " billing records for appointment " + appointmentId);
            return ResponseEntity.ok(billings);
        } catch (Exception e) {
            System.out.println("Error fetching billing for appointment " + appointmentId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Billing> createBilling(@RequestBody Billing billing) {
        try {
            System.out.println("Creating billing for user: " + billing.getUserId());
            System.out.println("Appointment ID: " + billing.getAppointmentId());
            System.out.println("Billing details: " + billing.getVehicleName() + ", Amount: " + billing.getTotalAmount());

            // Validate that appointmentId is set
            if (billing.getAppointmentId() == null) {
                System.out.println("⚠️ WARNING: Creating billing without appointmentId!");
            }

            Billing saved = billingService.saveBilling(billing);
            System.out.println("Billing saved with ID: " + saved.getId() + ", Appointment ID: " + saved.getAppointmentId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("Error creating billing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/create-from-appointment/{appointmentId}")
    public ResponseEntity<Billing> createBillingFromAppointment(@PathVariable Long appointmentId) {
        try {
            System.out.println("Creating billing from appointment ID: " + appointmentId);
            Billing billing = billingService.createBillingFromAppointment(appointmentId);
            if (billing != null) {
                System.out.println("Billing created with ID: " + billing.getId() + " for appointment: " + billing.getAppointmentId());
                return ResponseEntity.ok(billing);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            System.out.println("Error creating billing from appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Billing> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody PaymentRequest paymentRequest
    ) {
        try {
            System.out.println("Updating payment status for billing ID: " + id);
            System.out.println("Payment request - Status: " + paymentRequest.getPaymentStatus() +
                    ", Method: " + paymentRequest.getPaymentMethod() +
                    ", Date: " + paymentRequest.getPaymentDate());

            Billing billing = billingService.updatePayment(
                    id,
                    paymentRequest.getPaymentStatus(),
                    paymentRequest.getPaymentMethod()
            );

            System.out.println("Payment updated successfully for billing ID: " + id);
            System.out.println("New payment status: " + billing.getPaymentStatus());
            System.out.println("Payment method: " + billing.getPaymentMethod());
            System.out.println("Payment date: " + billing.getPaymentDate());

            return ResponseEntity.ok(billing);

        } catch (Exception e) {
            System.out.println("Error updating payment status for billing " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Billing> updatePaymentStatusOnly(
            @PathVariable Long id,
            @RequestBody PaymentRequest paymentRequest
    ) {
        try {
            System.out.println("Updating payment status only for billing ID: " + id);

            Billing billing = billingService.updatePaymentStatus(id, paymentRequest.getPaymentStatus());

            System.out.println("Payment status updated successfully for billing ID: " + id);
            return ResponseEntity.ok(billing);

        } catch (Exception e) {
            System.out.println("Error updating payment status for billing " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/paid")
    public ResponseEntity<List<Billing>> getAllPaidBilling() {
        try {
            System.out.println("Fetching all paid billing records");
            List<Billing> paidBillings = billingService.getBillingByPaymentStatus("paid");
            System.out.println("Found " + paidBillings.size() + " paid billing records");
            return ResponseEntity.ok(paidBillings);
        } catch (Exception e) {
            System.out.println("Error fetching paid billing records: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{paymentStatus}")
    public ResponseEntity<List<Billing>> getBillingByStatus(@PathVariable String paymentStatus) {
        try {
            System.out.println("Fetching billing records with status: " + paymentStatus);
            List<Billing> billings = billingService.getBillingByPaymentStatus(paymentStatus);
            System.out.println("Found " + billings.size() + " billing records with status: " + paymentStatus);
            return ResponseEntity.ok(billings);
        } catch (Exception e) {
            System.out.println("Error fetching billing with status " + paymentStatus + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Temporary endpoint to fix existing data
    @PostMapping("/fix-appointment-ids")
    public ResponseEntity<String> fixAppointmentIds() {
        try {
            String result = billingService.fixMissingAppointmentIds();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fixing appointment IDs: " + e.getMessage());
        }
    }
}