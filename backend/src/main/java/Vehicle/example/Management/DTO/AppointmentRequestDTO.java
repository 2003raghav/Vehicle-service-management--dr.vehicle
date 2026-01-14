package Vehicle.example.Management.DTO;

import Vehicle.example.Management.List.Appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;

public class AppointmentRequestDTO {
    private String name;
    private String phone;
    private String vehicleName;
    private String vehicleNumber;
    private String serviceType;
    private String date; // String date from frontend
    private String time; // String time from frontend
    private String username;
    private Integer providerId;

    // Convert to Appointment entity
    public Appointment toAppointment() {
        Appointment appointment = new Appointment();
        appointment.setName(this.name);
        appointment.setPhone(this.phone);
        appointment.setVehicleName(this.vehicleName);
        appointment.setVehicleNumber(this.vehicleNumber);
        appointment.setServiceType(this.serviceType);

        // Convert String to LocalDate
        if (this.date != null && !this.date.isEmpty()) {
            try {
                LocalDate localDate = LocalDate.parse(this.date);
                appointment.setDate(localDate);
            } catch (DateTimeParseException e) {
                throw new RuntimeException("Invalid date format: " + this.date);
            }
        }

        // Convert String to LocalTime
        if (this.time != null && !this.time.isEmpty()) {
            try {
                LocalTime localTime = LocalTime.parse(this.time);
                appointment.setTime(localTime);
            } catch (DateTimeParseException e) {
                throw new RuntimeException("Invalid time format: " + this.time);
            }
        }

        return appointment;
    }

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Integer getProviderId() { return providerId; }
    public void setProviderId(Integer providerId) { this.providerId = providerId; }
}