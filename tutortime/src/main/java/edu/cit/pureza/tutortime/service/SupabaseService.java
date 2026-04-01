package edu.cit.pureza.tutortime.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String supabaseKey;

    @Value("${supabase.storage.bucket}")
    private String bucket;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadProfilePhoto(MultipartFile file, Long userId) throws Exception {
        String originalFilename = file.getOriginalFilename();
        String ext = "jpg";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        }
        
        String filename = "user-" + userId + "-" + System.currentTimeMillis() + "." + ext;
        String path = bucket + "/" + filename;
        String url = supabaseUrl + "/storage/v1/object/" + path;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseKey);
        String contentType = file.getContentType();
        headers.setContentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"));
        headers.set("x-upsert", "true");

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to upload photo to Supabase");
        }

        return supabaseUrl + "/storage/v1/object/public/" + path;
    }
}
