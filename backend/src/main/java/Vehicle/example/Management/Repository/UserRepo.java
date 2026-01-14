package Vehicle.example.Management.Repository;

import Vehicle.example.Management.List.UserList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<UserList,Long> {
    UserList findByusernameAndPassword(String username, String password);
    Optional<UserList> findByUsername(String username);
}
