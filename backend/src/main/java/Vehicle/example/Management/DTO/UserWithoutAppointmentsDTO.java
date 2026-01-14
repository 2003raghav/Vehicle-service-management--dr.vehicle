package Vehicle.example.Management.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class UserWithoutAppointmentsDTO {
    private Long id;
    private String password;
    private String name;
    private String username;
    private String address;
    private String vehicletype;
    private String vehiclemodel;
    private int yearofmanufacture;
    private String regno;
    private String email;
    private long phone;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date dateofbirth;

    private String imageName;
    private String imageType;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getVehicletype() { return vehicletype; }
    public void setVehicletype(String vehicletype) { this.vehicletype = vehicletype; }
    public String getVehiclemodel() { return vehiclemodel; }
    public void setVehiclemodel(String vehiclemodel) { this.vehiclemodel = vehiclemodel; }
    public int getYearofmanufacture() { return yearofmanufacture; }
    public void setYearofmanufacture(int yearofmanufacture) { this.yearofmanufacture = yearofmanufacture; }
    public String getRegno() { return regno; }
    public void setRegno(String regno) { this.regno = regno; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public long getPhone() { return phone; }
    public void setPhone(long phone) { this.phone = phone; }
    public Date getDateofbirth() { return dateofbirth; }
    public void setDateofbirth(Date dateofbirth) { this.dateofbirth = dateofbirth; }
    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }
    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }
}
