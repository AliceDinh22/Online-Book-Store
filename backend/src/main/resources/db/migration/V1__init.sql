CREATE TABLE book
(
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255)          NOT NULL,
    author          VARCHAR(255),
    publisher       VARCHAR(255),
    description     TEXT,
    category        VARCHAR(100),
    original_price  DECIMAL(10, 2)        NOT NULL,
    discount_price  DECIMAL(10, 2)        NULL,
    stock           INT     DEFAULT 0,
    sold            INT     DEFAULT 0,
    year_published  INT,
    rating          FLOAT,
    is_deleted      BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE book_cover_image
(
    book_id   BIGINT NOT NULL,
    image_url TEXT,
    CONSTRAINT fk_book_cover FOREIGN KEY (book_id) REFERENCES book (id) ON DELETE CASCADE
);


CREATE TABLE users
(
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    email               VARCHAR(150) UNIQUE NOT NULL,
    password            VARCHAR(255)        NOT NULL,
    phone_number        VARCHAR(20),
    address             VARCHAR(255),
    city                VARCHAR(100),
    active              BOOLEAN DEFAULT TRUE,
    activation_code     VARCHAR(255),
    password_reset_code VARCHAR(255),
    role                VARCHAR(50)         NOT NULL,
    provider            VARCHAR(50)
);

CREATE TABLE cart
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE cart_item
(
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id  BIGINT NOT NULL,
    book_id  BIGINT NOT NULL,
    quantity INT    NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES cart (id),
    FOREIGN KEY (book_id) REFERENCES book (id)
);


CREATE TABLE orders
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT         NOT NULL,
    date         DATETIME    DEFAULT CURRENT_TIMESTAMP,
    total_price  DECIMAL(12, 2) NOT NULL,
    status       VARCHAR(50) DEFAULT 'PENDING',
    address      VARCHAR(255),
    city         VARCHAR(100),
    phone_number VARCHAR(20),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE order_item
(
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT         NOT NULL,
    book_id  BIGINT         NOT NULL,
    quantity INT            NOT NULL,
    price    DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_book FOREIGN KEY (book_id) REFERENCES book (id)
);

CREATE TABLE payment
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id       BIGINT         NOT NULL,
    amount         DECIMAL(10, 2) NOT NULL,
    method         VARCHAR(50)    NOT NULL,
    currency       VARCHAR(10)    NOT NULL,
    status         VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(255),
    created_at     TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP               DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders (id)
);


CREATE TABLE review
(
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating  INT CHECK (rating BETWEEN 1 AND 5),
    message TEXT,
    date    DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_book FOREIGN KEY (book_id) REFERENCES book (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE store_info
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    email       VARCHAR(255),
    phone       VARCHAR(50),
    address     VARCHAR(255),
    city        VARCHAR(100),
    country     VARCHAR(100),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
