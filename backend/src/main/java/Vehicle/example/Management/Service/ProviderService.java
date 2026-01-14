package Vehicle.example.Management.Service;

import Vehicle.example.Management.List.ProviderList;
import Vehicle.example.Management.Repository.ProviderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ProviderService {

    @Autowired
    private ProviderRepo repo;

    // Get all providers
    public List<ProviderList> getAllProviders() {
        return repo.findAll();
    }

    // Register provider with image
    public ProviderList registerProvider(ProviderList provider, MultipartFile image) throws IOException {
        if (image != null && !image.isEmpty()) {
            provider.setImageName(image.getOriginalFilename());
            provider.setImageType(image.getContentType());
            provider.setImageData(image.getBytes());
        }
        return repo.save(provider);
    }

    // Login
    public ProviderList login(String ownername, String password) {
        return repo.findByOwnernameAndPassword(ownername, password).orElse(null);

    }

    // Reset password
    public String resetPassword(String ownername, String newPassword) {
        Optional<ProviderList> providerOpt = repo.findByOwnername(ownername);
        if (providerOpt.isPresent()) {
            ProviderList provider = providerOpt.get();
            provider.setPassword(newPassword);
            repo.save(provider);
            return "Password reset successful";
        }
        return "Provider not found";
    }

    // Get provider by ID
    public ProviderList getProviderById(int id) {
        return repo.findById(id).orElse(null);
    }

    // Update the getProviderImage method
    public byte[] getProviderImage(int id) {
        Optional<ProviderList> providerOpt = repo.findById(id);
        if (providerOpt.isPresent()) {
            ProviderList provider = providerOpt.get();
            // Check if image data exists and is not empty
            if (provider.getImageData() != null && provider.getImageData().length > 0) {
                return provider.getImageData();
            }
        }
        return null;
    }

    // Update provider
    public ProviderList updateProvider(ProviderList provider) {
        // Check if provider exists
        Optional<ProviderList> existingProvider = repo.findById(provider.getId());
        if (existingProvider.isPresent()) {
            // Save the updated provider
            return repo.save(provider);
        } else {
            throw new RuntimeException("Provider not found with id: " + provider.getId());
        }
    }

}
