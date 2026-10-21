CREATE DATABASE IF NOT EXISTS swiftpos;
USE swiftpos;

-- The Spring Boot application will automatically create the tables via Hibernate (ddl-auto=update)
-- We just need to insert some initial data here, or you can run the whole schema.

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    minimum_stock INT NOT NULL
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    date DATETIME NOT NULL,
    cashier_id BIGINT,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);

-- Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- INSERT DEMO USERS
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@swiftpos.com', 'admin123', 'ADMIN'),
('Cashier Demo', 'cashier@swiftpos.com', 'cashier123', 'CASHIER');

-- INSERT DEMO PRODUCTS
INSERT IGNORE INTO products (name, sku, category, price, stock, minimum_stock) VALUES 
('Laptop', 'LAP-001', 'Electronics', 55000.00, 15, 5),
('Wireless Mouse', 'MOU-001', 'Accessories', 1000.00, 50, 10),
('Keyboard', 'KEY-001', 'Accessories', 1200.00, 40, 10),
('USB Cable', 'USB-001', 'Accessories', 300.00, 100, 20),
('Headphones', 'HDP-001', 'Audio', 2500.00, 30, 5),
('Webcam', 'WEB-001', 'Electronics', 3500.00, 2, 5),
('Power Bank', 'PWR-001', 'Accessories', 1500.00, 25, 10),
('Bluetooth Speaker', 'SPK-001', 'Audio', 4000.00, 0, 5);
