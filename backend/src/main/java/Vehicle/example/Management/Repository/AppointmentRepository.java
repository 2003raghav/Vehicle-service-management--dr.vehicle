package Vehicle.example.Management.Repository;

import Vehicle.example.Management.List.Appointment;
import Vehicle.example.Management.List.UserList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUser(UserList user);
    List<Appointment> findByProviderId(int providerId);
    List<Appointment> findByProviderOwnername(String ownerName);

    // Add this missing method
    List<Appointment> findByVehicleNameAndVehicleNumber(String vehicleName, String vehicleNumber);

    // Alternative method with custom query if the above doesn't work
    @Query("SELECT a FROM Appointment a WHERE a.vehicleName = :vehicleName AND a.vehicleNumber = :vehicleNumber")
    List<Appointment> findAppointmentsByVehicleDetails(@Param("vehicleName") String vehicleName,
                                                       @Param("vehicleNumber") String vehicleNumber);

    // Additional helpful methods
    List<Appointment> findByUserId(Long userId);
    List<Appointment> findByProviderId(Long providerId);
}
