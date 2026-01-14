package Vehicle.example.Management.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "service_item")
public class ServiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private String providerName;
    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_id")
    @JsonIgnore
    private Billing billing;

    // Constructors
    public ServiceItem() {}

    public ServiceItem(String serviceName, String providerName, Double price) {
        this.serviceName = serviceName;
        this.providerName = providerName;
        this.price = price;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Billing getBilling() { return billing; }
    public void setBilling(Billing billing) { this.billing = billing; }
}