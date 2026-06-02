-- Tabla de roles
CREATE TABLE roles (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100) NOT NULL,
                       active BOOLEAN NOT NULL DEFAULT true,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia usuarios-roles
CREATE TABLE user_roles (
                            user_id UUID NOT NULL,
                            role_id UUID NOT NULL,
                            PRIMARY KEY (user_id, role_id),
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Tabla de clientes
CREATE TABLE customers (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           full_name VARCHAR(150) NOT NULL,
                           document VARCHAR(30) UNIQUE,
                           phone VARCHAR(20),
                           address VARCHAR(255),
                           registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                           status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                           CONSTRAINT chk_customer_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- Tabla de categorias
CREATE TABLE categories (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            name VARCHAR(100) NOT NULL UNIQUE,
                            description TEXT
);

-- Tabla de productos
CREATE TABLE products (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          code VARCHAR(30) NOT NULL UNIQUE,
                          name VARCHAR(150) NOT NULL,
                          category_id UUID,
                          purchase_price DECIMAL(10,2) NOT NULL,
                          sale_price DECIMAL(10,2) NOT NULL,
                          stock INTEGER NOT NULL DEFAULT 0,
                          minimum_stock INTEGER NOT NULL DEFAULT 5,
                          active BOOLEAN NOT NULL DEFAULT true,
                          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Insertar roles por defecto
INSERT INTO roles (name) VALUES ('ADMIN'), ('EMPLOYEE');