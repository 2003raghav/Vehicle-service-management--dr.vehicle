package Vehicle.example.Management.DTO;


import Vehicle.example.Management.List.Appointment;
import Vehicle.example.Management.List.UserList;

import java.util.List;
import java.util.stream.Collectors;

public class Mapper {

    public static AppointmentDTO toAppointmentDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setVehicleName(appointment.getVehicleName());
        dto.setServiceType(appointment.getServiceType());
        dto.setStatus(appointment.getStatus());
        dto.setDate(appointment.getDate());
        dto.setTime(appointment.getTime());
        return dto;
    }

    public static UserDTO toUserDTO(UserList user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());

        List<AppointmentDTO> appointments = user.getAppointments() == null ?
                List.of() : user.getAppointments().stream()
                .map(Mapper::toAppointmentDTO)
                .collect(Collectors.toList());

        dto.setAppointments(appointments);
        return dto;
    }
    public static UserWithoutAppointmentsDTO toUserWithoutAppointmentsDTO(UserList user) {
        UserWithoutAppointmentsDTO dto = new UserWithoutAppointmentsDTO();
        dto.setId(user.getId());
        dto.setPassword(user.getPassword());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setAddress(user.getAddress());
        dto.setVehicletype(user.getVehicletype());
        dto.setVehiclemodel(user.getVehiclemodel());
        dto.setYearofmanufacture(user.getYearofmanufacture());
        dto.setRegno(user.getRegno());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setDateofbirth(user.getDateofbirth());
        dto.setImageName(user.getImageName());
        dto.setImageType(user.getImageType());
        return dto;
    }
}
