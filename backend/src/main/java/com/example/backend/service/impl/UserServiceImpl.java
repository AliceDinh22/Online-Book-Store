package com.example.backend.service.impl;

import com.example.backend.dto.BookDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Book;
import com.example.backend.entity.Order;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.Role;
import com.example.backend.repository.BookRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User getUserEntityByEmail(String email) {
        return (User) userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return mapToDTO(userRepository.findAll());
    }

    @Override
    @Transactional
    public void updateUserInfo(Long id, UserDTO userDTO) {
        User existingUser = (User) userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        existingUser.setFirstName(userDTO.getFirstName());
        existingUser.setLastName(userDTO.getLastName());
        existingUser.setPhoneNumber(userDTO.getPhoneNumber());
        existingUser.setAddress(userDTO.getAddress());
        existingUser.setCity(userDTO.getCity());
        existingUser.setActive(userDTO.getActive());

        userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public void createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        if (user.getRole() == null) {
            user.setRole(Role.STAFF);
        }
        if (user.getActive() == null) {
            user.setActive(true);
        }

        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        userRepository.deleteById(id);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setActive(user.getActive());
        dto.setProvider(user.getProvider() != null ? user.getProvider().name() : null);
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);

        dto.setOrderIds(user.getOrders() != null
                ? user.getOrders().stream().map(Order::getId).toList()
                : new ArrayList<>());

        dto.setReviewIds(user.getReviews() != null
                ? user.getReviews().stream().map(Review::getId).toList()
                : new ArrayList<>());

        return dto;
    }

    private List<UserDTO> mapToDTO(List<User> users) {
        return users.stream()
                .map(this::mapToDTO)
                .toList();
    }

    private List<BookDTO> mapToBookDTO(List<Book> books) {
        return books.stream().map(book -> new BookDTO(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getPublisher(),
                book.getCategory(),
                book.getDescription(),
                book.getOriginalPrice(),
                book.getDiscountPrice(),
                book.getStock(),
                book.getSold(),
                book.getYearPublished(),
                book.getRating(),
                book.getIsDeleted(),
                book.getCoverImages(),
                null
        )).toList();
    }
}
