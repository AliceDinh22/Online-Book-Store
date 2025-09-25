package com.example.backend.service.impl;

import com.example.backend.dto.BookDTO;
import com.example.backend.dto.CartDTO;
import com.example.backend.dto.CartItemDTO;
import com.example.backend.entity.Book;
import com.example.backend.entity.Cart;
import com.example.backend.entity.CartItem;
import com.example.backend.entity.User;
import com.example.backend.repository.BookRepository;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Override
    public CartDTO getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
        return mapToDTO(cart);
    }

    @Override
    public CartDTO addBook(Long userId, Long bookId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        CartItem item = cartItemRepository.findByCartAndBook(cart, book)
                .orElse(new CartItem());

        int currentQty = item.getId() == null ? 0 : item.getQuantity();
        if (currentQty + quantity > book.getStock()) {
            throw new RuntimeException("Số lượng vượt quá tồn kho");
        }

        if (item.getId() == null) {
            item.setCart(cart);
            item.setBook(book);
            item.setQuantity(quantity);
        } else {
            item.setQuantity(item.getQuantity() + quantity);
        }

        cartItemRepository.save(item);
        cart = cartRepository.findById(cart.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));

        return mapToDTO(cart);
    }

    @Override
    public CartDTO updateBookQuantity(Long userId, Long bookId, int newQuantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách"));

        if (newQuantity > book.getStock()) {
            throw new RuntimeException("Số lượng vượt quá tồn kho");
        }

        CartItem item = cartItemRepository.findByCartAndBook(cart, book)
                .orElse(null);

        if (newQuantity <= 0) {
            if (item != null) cartItemRepository.delete(item);
        } else {
            if (item == null) {
                item = new CartItem();
                item.setCart(cart);
                item.setBook(book);
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        cart = cartRepository.findById(cart.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));

        return mapToDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO removeBook(Long userId, Long bookId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));

        int deleted = cartItemRepository.deleteByCartIdAndBookId(cart.getId(), bookId);
        if (deleted == 0) {
            throw new RuntimeException("Không tìm thấy sản phẩm trong giỏ");
        }

        cart.setUpdatedAt(LocalDateTime.now());

        return mapToDTO(cart);
    }

    @Override
    public Cart createCartForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    private CartDTO mapToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());

        List<CartItemDTO> items = cart.getItems().stream().map(item -> {
            CartItemDTO itemDTO = new CartItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setQuantity(item.getQuantity());

            Book book = item.getBook();
            BookDTO bookDTO = new BookDTO();
            bookDTO.setId(book.getId());
            bookDTO.setTitle(book.getTitle());
            bookDTO.setAuthor(book.getAuthor());
            bookDTO.setPublisher(book.getPublisher());
            bookDTO.setCategory(book.getCategory());
            bookDTO.setDescription(book.getDescription());
            bookDTO.setOriginalPrice(book.getOriginalPrice());
            bookDTO.setDiscountPrice(book.getDiscountPrice());
            bookDTO.setStock(book.getStock());
            bookDTO.setSold(book.getSold());
            bookDTO.setYearPublished(book.getYearPublished());
            bookDTO.setRating(book.getRating());
            bookDTO.setIsDeleted(book.getIsDeleted());
            bookDTO.setCoverImages(book.getCoverImages());

            itemDTO.setBook(bookDTO);
            return itemDTO;
        }).toList();

        dto.setItems(items);
        return dto;
    }
}

