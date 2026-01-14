package Vehicle.example.Management.Repository;

import Vehicle.example.Management.List.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BillingRepo extends JpaRepository<Billing, Long> {
        List<Billing> findByAppointmentId(Long appointmentId);
        List<Billing> findByUserId(Long userId);
        List<Billing> findByProviderName(String providerName);
        List<Billing> findByPaymentStatus(String paymentStatus);


        // New methods for combined queries
        List<Billing> findByUserIdAndPaymentStatus(Long userId, String paymentStatus);
        List<Billing> findByProviderNameAndPaymentStatus(String providerName, String paymentStatus);

        // Custom query to find billings by vehicle details
        @Query("SELECT b FROM Billing b WHERE b.vehicleName = :vehicleName AND b.vehicleNumber = :vehicleNumber")
        List<Billing> findByVehicleNameAndVehicleNumber(@Param("vehicleName") String vehicleName,
                                                        @Param("vehicleNumber") String vehicleNumber);
}


