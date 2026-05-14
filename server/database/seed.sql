-- ============================================
-- Seed Data — Restaurants, Tables, Admin User
-- ============================================
-- Admin password: admin123 (bcrypt hash)

INSERT INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@restaurant.com', '$2b$10$255OUyv4yyHXv5PObbp2iesF20cAPHvT4jDtx2rN56f1i9PBf4p4O', 'admin'),
  ('Staff User', 'staff@restaurant.com', '$2b$10$255OUyv4yyHXv5PObbp2iesF20cAPHvT4jDtx2rN56f1i9PBf4p4O', 'staff')
ON CONFLICT (email) DO NOTHING;

INSERT INTO restaurants (name, location, description, image_url) VALUES
  ('The Golden Fork', 'Anna Nagar, Chennai', 'Premium fine dining with international cuisine and elegant ambience.', ''),
  ('Spice Garden', 'T. Nagar, Chennai', 'Authentic South Indian flavors with modern presentation.', ''),
  ('La Piazza', 'Adyar, Chennai', 'Italian restaurant with wood-fired pizzas and handmade pasta.', ''),
  ('Dragon Wok', 'Velachery, Chennai', 'Asian fusion cuisine with a vibrant atmosphere.', '')
ON CONFLICT DO NOTHING;

-- Tables for The Golden Fork (restaurant_id = 1)
INSERT INTO restaurant_tables (restaurant_id, table_number, capacity) VALUES
  (1, 1, 2), (1, 2, 2), (1, 3, 4), (1, 4, 4), (1, 5, 6), (1, 6, 8)
ON CONFLICT DO NOTHING;

-- Tables for Spice Garden (restaurant_id = 2)
INSERT INTO restaurant_tables (restaurant_id, table_number, capacity) VALUES
  (2, 1, 2), (2, 2, 4), (2, 3, 4), (2, 4, 6), (2, 5, 8)
ON CONFLICT DO NOTHING;

-- Tables for La Piazza (restaurant_id = 3)
INSERT INTO restaurant_tables (restaurant_id, table_number, capacity) VALUES
  (3, 1, 2), (3, 2, 2), (3, 3, 4), (3, 4, 6)
ON CONFLICT DO NOTHING;

-- Tables for Dragon Wok (restaurant_id = 4)
INSERT INTO restaurant_tables (restaurant_id, table_number, capacity) VALUES
  (4, 1, 2), (4, 2, 4), (4, 3, 4), (4, 4, 6), (4, 5, 8), (4, 6, 10)
ON CONFLICT DO NOTHING;
