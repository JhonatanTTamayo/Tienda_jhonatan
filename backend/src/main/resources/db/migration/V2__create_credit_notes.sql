-- Tabla de notas de credito (fiados)
CREATE TABLE credit_notes (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              customer_id UUID NOT NULL,
                              seller_id UUID NOT NULL,
                              total_amount DECIMAL(12,2) NOT NULL,
                              pending_balance DECIMAL(12,2) NOT NULL,
                              status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                              CONSTRAINT fk_credit_note_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
                              CONSTRAINT fk_credit_note_seller FOREIGN KEY (seller_id) REFERENCES users(id),
                              CONSTRAINT chk_credit_note_status CHECK (status IN ('PENDING', 'PARTIALLY_PAID', 'PAID'))
);

-- Tabla de items de la nota de credito
CREATE TABLE credit_note_items (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   credit_note_id UUID NOT NULL,
                                   product_id UUID NOT NULL,
                                   quantity INTEGER NOT NULL,
                                   unit_price DECIMAL(10,2) NOT NULL,
                                   subtotal DECIMAL(12,2) NOT NULL,
                                   CONSTRAINT fk_cni_credit_note FOREIGN KEY (credit_note_id) REFERENCES credit_notes(id) ON DELETE CASCADE,
                                   CONSTRAINT fk_cni_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabla de pagos/abonos
CREATE TABLE payments (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          credit_note_id UUID NOT NULL,
                          amount DECIMAL(12,2) NOT NULL,
                          payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                          payment_method VARCHAR(30) DEFAULT 'EFECTIVO',
                          CONSTRAINT fk_payment_credit_note FOREIGN KEY (credit_note_id) REFERENCES credit_notes(id)
);

-- Tabla de movimientos de inventario
CREATE TABLE inventory_movements (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     product_id UUID NOT NULL,
                                     reference_id UUID,
                                     movement_type VARCHAR(10) NOT NULL,
                                     quantity INTEGER NOT NULL,
                                     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                     CONSTRAINT fk_im_product FOREIGN KEY (product_id) REFERENCES products(id),
                                     CONSTRAINT chk_movement_type CHECK (movement_type IN ('INPUT', 'OUTPUT'))
);