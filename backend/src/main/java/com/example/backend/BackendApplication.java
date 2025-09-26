package com.example.backend;

import com.example.backend.entity.User;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.Role;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

//	@Bean
//	CommandLineRunner init(UserRepository userRepo, PasswordEncoder encoder) {
//		return args -> {
//			if (userRepo.findByEmail("dynlinh222@gmail.com").isEmpty()) {
//				User admin = new User();
//				admin.setFirstName("System");
//				admin.setLastName("Admin");
//				admin.setEmail("dynlinh222@gmail.com");
//				admin.setPassword(encoder.encode("22022004"));
//				admin.setPhoneNumber("0123456789");
//				admin.setAddress("123 Cộng Hoà");
//				admin.setCity("Thành phố Hồ Chí Minh");
//				admin.setActive(true);
//				admin.setRole(Role.ADMIN);
//				admin.setProvider(AuthProvider.LOCAL);
//
//				userRepo.save(admin);
//				System.out.println(">>> Default admin created: dynlinh222@gmail.com/ 22022004");
//			}
//		};
//	}
}
