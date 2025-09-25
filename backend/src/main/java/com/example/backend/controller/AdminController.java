package com.example.backend.controller;

import com.example.backend.dto.BookDTO;
import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.ResponseDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.StoreInfo;
import com.example.backend.entity.User;
import com.example.backend.service.BookService;
import com.example.backend.service.OrderService;
import com.example.backend.service.StoreInfoService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {
    private final UserService userService;
    private final BookService bookService;
    private final OrderService orderService;
    private final StoreInfoService storeInfoService;

    @GetMapping("/books")
    public ResponseDTO<List<BookDTO>> getAllBook() {
        return ResponseDTO.<List<BookDTO>>builder()
                .data(bookService.getAll())
                .status(200)
                .message("Lấy tất cả sản phẩm thành công!")
                .build();
    }

    @GetMapping("/books/inactive")
    public ResponseDTO<List<BookDTO>> getAllInactiveBook() {
        return ResponseDTO.<List<BookDTO>>builder()
                .data(bookService.getAllInactiveBook())
                .status(200)
                .message("Lấy tất cả sản phẩm không hoạt động thành công!")
                .build();
    }

    @PostMapping("/books")
    public ResponseDTO<Void> create(@ModelAttribute @Valid BookDTO BookDTO) throws IOException {
        bookService.create(BookDTO);
        return ResponseDTO.<Void>builder()
                .status(201)
                .message("Tạo sản phẩm thành công!")
                .build();
    }

    @PutMapping("/books/{id}")
    public ResponseDTO<Void> update(
            @PathVariable Long id,
            @ModelAttribute @Valid BookDTO bookDTO) throws IOException {
        bookService.update(bookDTO, id);
        return ResponseDTO.<Void>builder()
                .status(200)
                .message("Cập nhật sản phẩm thành công!")
                .build();
    }

    @DeleteMapping("/books/{id}")
    public ResponseDTO<Void> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseDTO.<Void>builder()
                .status(200)
                .message("Xóa sản phẩm thành công!")
                .build();
    }

    @GetMapping("/users")
    public ResponseDTO<List<UserDTO>> getAll() {
        return ResponseDTO.<List<UserDTO>>builder()
                .data(userService.getAllUsers())
                .status(200)
                .message("Lấy tất cả người dùng thành công!")
                .build();
    }

    @PostMapping("/users")
    public ResponseDTO<String> createUser(@RequestBody User user) {
        userService.createUser(user);
        return ResponseDTO.<String>builder()
                .data("success")
                .status(201)
                .message("Tạo user mới thành công!")
                .build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseDTO<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseDTO.<Void>builder()
                .status(200)
                .message("Xóa người dùng thành công!")
                .build();
    }

    @GetMapping("/store")
    public ResponseDTO<List<StoreInfo>> getAllStoreInfo() {
        return ResponseDTO.<List<StoreInfo>>builder()
                .data(storeInfoService.getAllStoreInfo())
                .status(200)
                .message("Lấy tất cả thông tin cửa hàng thành công!")
                .build();
    }

    @PostMapping("/store")
    public ResponseDTO<Void> createStoreInfo(@RequestBody @Valid StoreInfo storeInfo) {
        storeInfoService.createStoreInfo(storeInfo);
        return ResponseDTO.<Void>builder()
                .status(201)
                .message("Tạo thông tin cửa hàng thành công!")
                .build();
    }
}
