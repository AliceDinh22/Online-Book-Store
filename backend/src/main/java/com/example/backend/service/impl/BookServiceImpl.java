package com.example.backend.service.impl;

import com.example.backend.dto.BookDTO;
import com.example.backend.entity.Book;
import com.example.backend.repository.BookRepository;
import com.example.backend.service.BookService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {
    private final BookRepository bookRepository;
    private final CloudinaryServiceImpl cloudinaryServiceImpl;

    @Override
    public List<BookDTO> getAll() {
        return mapToDTO(bookRepository.findAll());
    }

    @Override
    public List<BookDTO> getAllActiveBook() {
        return mapToDTO(bookRepository.findByIsDeletedFalse());
    }

    @Override
    public List<BookDTO> getAllInactiveBook() {
        return mapToDTO(bookRepository.findByIsDeletedTrue());
    }

    @Override
    public BookDTO getById(Long id) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy cuốn sách!"));
        return mapToDTO(book);
    }

    @Override
    public void create(BookDTO bookDTO) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        if (bookDTO.getFiles() != null) {
            imageUrls = handleFileSaveCloud(bookDTO.getFiles());
        } else {
            throw new EntityNotFoundException("Hãy chọn ảnh!");
        }

        Book book = new Book();
        mapToEntity(book, bookDTO);
        book.setSold(0);
        book.setIsDeleted(false);
        book.setCoverImages(imageUrls);

        bookRepository.save(book);
    }

    @Override
    public void update(BookDTO bookDTO, Long id) throws IOException {
        Book book = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Khong tìm thấy cuốn sách!"));

        List<String> imageUrls = new ArrayList<>();
        if (bookDTO.getFiles() != null) {
            imageUrls = handleFileSaveCloud(bookDTO.getFiles());
        } else {
            imageUrls = book.getCoverImages();
        }

        mapToEntity(book, bookDTO);
        book.setCoverImages(imageUrls);
        bookRepository.save(book);
    }

    @Override
    public void delete(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tìm thấy cuốn sách!"));

        bookRepository.deleteById(id);
    }

    public List<String> handleFileSaveCloud(List<MultipartFile> files) {
        List<String> result = new ArrayList<>();
        for (MultipartFile multipartFile : files) {
            try {
                String url = cloudinaryServiceImpl.uploadFile(multipartFile, "Ecomm");
                if (url == null) {
                    throw new RuntimeException("Could not upload!");
                }
                result.add(url);
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
        return result;
    }

    private BookDTO mapToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setPublisher(book.getPublisher());
        dto.setCategory(book.getCategory());
        dto.setDescription(book.getDescription());
        dto.setOriginalPrice(book.getOriginalPrice());
        dto.setDiscountPrice(book.getDiscountPrice());
        dto.setStock(book.getStock());
        dto.setSold(book.getSold());
        dto.setYearPublished(book.getYearPublished());
        dto.setRating(book.getRating());
        dto.setIsDeleted(book.getIsDeleted());
        dto.setCoverImages(book.getCoverImages());
        dto.setFiles(null);
        return dto;
    }

    private List<BookDTO> mapToDTO(List<Book> books) {
        return books.stream()
                .map(this::mapToDTO)
                .toList();
    }

    private void mapToEntity(Book book, BookDTO bookDTO) {
        book.setTitle(bookDTO.getTitle());
        book.setAuthor(bookDTO.getAuthor());
        book.setPublisher(bookDTO.getPublisher());
        book.setCategory(bookDTO.getCategory());
        book.setDescription(bookDTO.getDescription());
        book.setOriginalPrice(bookDTO.getOriginalPrice());
        book.setDiscountPrice(bookDTO.getDiscountPrice());
        book.setStock(bookDTO.getStock());
        book.setYearPublished(bookDTO.getYearPublished());
        book.setRating(bookDTO.getRating());
        book.setIsDeleted(bookDTO.getIsDeleted());
    }
}
