CREATE TABLE IF NOT EXISTS inquiries (
    "ID" BIGINT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    city_market VARCHAR(120) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    line_preference VARCHAR(30) NOT NULL,
    source VARCHAR(60) NOT NULL DEFAULT 'landing_page',
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
);
