package Vehicle.example.Management.List;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "billing")
public class Billing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String vehicleName;
    private String vehicleNumber;

    // Add this field to link billing to appointment
    private Long appointmentId;

    @Column(name = "appointment_date")
    private String date;

    @Column(name = "appointment_time")
    private String time;

    private Double totalAmount;

    // Payment fields
    private String paymentStatus = "pending"; // pending, paid, failed
    private String paymentMethod;
    private LocalDateTime paymentDate;

    // Provider fields
    private Long providerId;
    private String providerName;

    @OneToMany(mappedBy = "billing", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ServiceItem> services = new ArrayList<>();

    // Constructors
    public Billing() {}

    public Billing(Long userId, String vehicleName, String vehicleNumber, String date, String time, Double totalAmount) {
        this.userId = userId;
        this.vehicleName = vehicleName;
        this.vehicleNumber = vehicleNumber;
        this.date = date;
        this.time = time;
        this.totalAmount = totalAmount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public List<ServiceItem> getServices() { return services; }
    public void setServices(List<ServiceItem> services) {
        this.services = services;
        if (services != null) {
            services.forEach(service -> service.setBilling(this));
        }
    }
}