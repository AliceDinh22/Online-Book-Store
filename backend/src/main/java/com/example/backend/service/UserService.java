package com.example.backend.service;

import com.example.backend.dto.BookDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;

import java.util.List;

public interface UserService {
    User getUserEntityByEmail(String email);

    List<UserDTO> getAllUsers();

    void updateUserInfo(Long id, UserDTO userDTO);

    void createUser(User user);

    void deleteUser(Long id);
}
