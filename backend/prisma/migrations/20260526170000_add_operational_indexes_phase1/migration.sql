-- CreateIndex
CREATE INDEX svc_user_status_idx ON services(user_id, status);
CREATE INDEX svc_listing_idx ON services(status, category_id, is_featured, created_at);

-- CreateIndex
CREATE INDEX svc_img_cover_idx ON service_images(service_id, is_cover, order_index, id);

-- CreateIndex
CREATE INDEX so_seller_status_idx ON service_orders(seller_id, status, created_at);
CREATE INDEX so_buyer_status_idx ON service_orders(buyer_id, status, created_at);
CREATE INDEX so_payment_idx ON service_orders(payment_status, created_at);

-- CreateIndex
CREATE INDEX ord_msg_order_idx ON order_messages(order_id, created_at);

-- CreateIndex
CREATE INDEX ord_file_order_idx ON order_files(order_id, uploaded_at);

-- CreateIndex
CREATE INDEX prod_user_status_idx ON products(user_id, status);
CREATE INDEX prod_listing_idx ON products(status, language, category_id, is_featured, created_at);

-- CreateIndex
CREATE INDEX po_seller_pay_idx ON product_orders(seller_id, payment_status, order_status, created_at);
CREATE INDEX po_buyer_pay_idx ON product_orders(buyer_id, payment_status, order_status, created_at);

-- CreateIndex
CREATE INDEX notif_user_created_idx ON notifications(user_id, created_at);
CREATE INDEX notif_user_read_idx ON notifications(user_id, is_read);
