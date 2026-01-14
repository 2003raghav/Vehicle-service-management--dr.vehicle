package Vehicle.example.Management.DTO;

import Vehicle.example.Management.DTO.Mapper;
import Vehicle.example.Management.DTO.UserDTO;
import Vehicle.example.Management.List.UserList;

import Vehicle.example.Management.Service.ServiceClass;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class UserController {

    @Autowired
    private ServiceClass userService;

    @GetMapping("/users/{username}/appointments")
    public ResponseEntity<UserDTO> getUserWithAppointments(@PathVariable String username) {
        Optional<UserList> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            UserDTO dto = Mapper.toUserDTO(userOpt.get());
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
