package Vehicle.example.Management.DTO;

public class PaymentRequest {
    private String paymentStatus;
    private String paymentDate;
    private String paymentMethod;

    // Constructors
    public PaymentRequest() {}

    public PaymentRequest(String paymentStatus, String paymentDate, String paymentMethod) {
        this.paymentStatus = paymentStatus;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
    }

    // Getters and Setters
    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(String paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}