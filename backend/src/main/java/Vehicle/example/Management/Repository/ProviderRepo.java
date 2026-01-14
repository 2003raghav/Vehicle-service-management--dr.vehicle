package Vehicle.example.Management.Repository;

import Vehicle.example.Management.List.ProviderList;
import Vehicle.example.Management.List.UserList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProviderRepo extends JpaRepository<ProviderList,Integer> {
    Optional<ProviderList> findByOwnernameAndPassword(String ownername, String password);
    Optional<ProviderList> findByOwnername(String ownername);

}
