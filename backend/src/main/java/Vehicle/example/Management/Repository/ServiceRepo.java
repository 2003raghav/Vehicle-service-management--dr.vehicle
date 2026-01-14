package Vehicle.example.Management.Repository;

import Vehicle.example.Management.List.ServiceDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepo extends JpaRepository<ServiceDetails, Long> {
    List<ServiceDetails> findByUsername(String username);
}
