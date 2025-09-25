package com.example.backend.service;

import com.example.backend.dto.BookDTO;

import java.io.IOException;
import java.util.List;

public interface BookService {
    List<BookDTO> getAll();

    List<BookDTO> getAllActiveBook();

    List<BookDTO> getAllInactiveBook();

    BookDTO getById(Long id);

    void create(BookDTO bookDTO) throws IOException;

    void update(BookDTO bookDTO, Long id) throws IOException;

    void delete(Long id);
}
