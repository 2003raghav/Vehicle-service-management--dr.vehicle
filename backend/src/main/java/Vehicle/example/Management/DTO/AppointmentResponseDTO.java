package Vehicle.example.Management.DTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentResponseDTO {
    private Long id;
    private String name;
    private String phone;
    private String vehicleName;
    private String vehicleNumber;
    private String serviceType;
    private LocalDate date;
    private LocalTime time;
    private String status;
    private String userName;
    private String userUsername;
    private String providerGarageName;
    private String providerOwnerName;
    private Integer providerId;

    // Constructors, getters, and setters
    public AppointmentResponseDTO() {}

    public AppointmentResponseDTO(Long id, String name, String phone, String vehicleName,
                                  String vehicleNumber, String serviceType, LocalDate date,
                                  LocalTime time, String status, String userName,
                                  String userUsername, String providerGarageName,
                                  String providerOwnerName, Integer providerId) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.vehicleName = vehicleName;
        this.vehicleNumber = vehicleNumber;
        this.serviceType = serviceType;
        this.date = date;
        this.time = time;
        this.status = status;
        this.userName = userName;
        this.userUsername = userUsername;
        this.providerGarageName = providerGarageName;
        this.providerOwnerName = providerOwnerName;
        this.providerId = providerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserUsername() {
        return userUsername;
    }

    public void setUserUsername(String userUsername) {
        this.userUsername = userUsername;
    }

    public String getProviderGarageName() {
        return providerGarageName;
    }

    public void setProviderGarageName(String providerGarageName) {
        this.providerGarageName = providerGarageName;
    }

    public String getProviderOwnerName() {
        return providerOwnerName;
    }

    public void setProviderOwnerName(String providerOwnerName) {
        this.providerOwnerName = providerOwnerName;
    }

    public Integer getProviderId() {
        return providerId;
    }

    public void setProviderId(Integer providerId) {
        this.providerId = providerId;
    }
// Getters and setters for all fields...
}