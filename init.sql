
-- PostgreSQL Veritabanı Kurulum Betiği
-- Proje: BlokDeprem

-- locations tablosu
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- officials tablosu
CREATE TABLE officials (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    location_id INTEGER REFERENCES locations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- aid_items tablosu
CREATE TABLE aid_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255)
);

-- needs tablosu
CREATE TABLE needs (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    item_id INTEGER REFERENCES aid_items(id),
    needed_quantity INTEGER,
    supplied_quantity INTEGER DEFAULT 0,
    priority INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- shipments tablosu
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(255) UNIQUE NOT NULL,
    source_location_id INTEGER REFERENCES locations(id),
    destination_location_id INTEGER REFERENCES locations(id),
    created_by_official_id INTEGER REFERENCES officials(id),
    status VARCHAR(50) CHECK (status IN ('Registered', 'InTransit', 'Delivered')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- shipment_details tablosu
CREATE TABLE shipment_details (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    item_id INTEGER REFERENCES aid_items(id),
    quantity INTEGER
);

-- tracking_logs tablosu
CREATE TABLE tracking_logs (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id),
    status VARCHAR(255),
    transaction_hash VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP
);
