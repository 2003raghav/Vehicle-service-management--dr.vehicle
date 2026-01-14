package Vehicle.example.Management.Controller;

import Vehicle.example.Management.List.Feedback;
import Vehicle.example.Management.Repository.FeedbackRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5173") // allow frontend React app
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @PostMapping
    public ResponseEntity<String> saveFeedback(@RequestBody Feedback feedback) {
        feedbackRepository.save(feedback);
        return ResponseEntity.ok("Feedback saved successfully!");
    }

    @GetMapping("/all")
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }
}
