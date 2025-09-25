package com.example.backend.repository;

import com.example.backend.entity.Book;
import com.example.backend.entity.Cart;
import com.example.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndBook(Cart cart, Book book);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.book.id = :bookId")
    int deleteByCartIdAndBookId(@Param("cartId") Long cartId, @Param("bookId") Long bookId);

    Optional<CartItem> findByCartIdAndBookId(Long id, Long bookId);
}
