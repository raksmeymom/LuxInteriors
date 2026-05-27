-- ── LuxInteriors Database ────────────────────────────────
DROP DATABASE IF EXISTS luxinteriors;
CREATE DATABASE luxinteriors;
USE luxinteriors;

-- ─────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200)  NOT NULL,
  category    VARCHAR(100)  NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  rating      DECIMAL(3,1)  DEFAULT 4.5,
  badge       VARCHAR(50)   DEFAULT NULL,
  img         VARCHAR(500)  NOT NULL,
  description TEXT,
  stock       INT           DEFAULT 100,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('customer','admin') DEFAULT 'customer',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────
-- CART ITEMS
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product (user_id, product_id)
);

-- ─────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT             NOT NULL,
  total              DECIMAL(12,2)   NOT NULL,
  status             ENUM('pending','paid','processing','shipped','delivered','cancelled')
                     DEFAULT 'pending',
  stripe_session_id  VARCHAR(300)    DEFAULT NULL,
  stripe_payment_id  VARCHAR(300)    DEFAULT NULL,
  shipping_name      VARCHAR(150),
  shipping_address   VARCHAR(300),
  shipping_city      VARCHAR(100),
  shipping_country   VARCHAR(100),
  shipping_zip       VARCHAR(20),
  created_at         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT           NOT NULL,
  product_id INT,
  quantity   INT           NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────
-- CONTACTS / INQUIRIES
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  subject    VARCHAR(200),
  message    TEXT         NOT NULL,
  status     ENUM('new','read','replied') DEFAULT 'new',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────
-- NEWSLETTER
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  subscribed BOOLEAN      DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────
-- SEED: Products
-- ─────────────────────────────────────────────────────────
INSERT IGNORE INTO products (name, category, price, rating, badge, img, description) VALUES
  ('Velvet Sectional Sofa',  'Sofas',     2499, 4.8, 'Bestseller', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',  'Cloud-like comfort meets refined elegance. Modular design.'),
  ('Cloud Lounge Chair',     'Chairs',    1299, 4.9, 'New',        'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&q=80', 'Sculpted form for effortless, hours-long relaxation.'),
  ('Arc Floor Lamp',         'Lighting',  649,  4.7, NULL,         'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',  'Warm ambient glow that transforms every corner.'),
  ('Walnut Dining Table',    'Tables',    1899, 4.6, 'Sale',       'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80', 'Solid walnut with a hand-oiled finish. Seats 6-8.'),
  ('Linen Storage Cupboard', 'Cupboards', 1199, 4.5, NULL,         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',  'Spacious, minimal, and utterly timeless storage.'),
  ('Canopy King Bed',        'Beds',      3299, 4.9, 'Premium',    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', 'Sleep surrounded by architectural beauty. Solid oak.'),
  ('Ceramic Vase Set',       'Decor',     299,  4.8, NULL,         'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',  'Handthrown in matte earth tones. Set of three.'),
  ('Marble Side Table',      'Tables',    799,  4.7, 'New',        'https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=600&q=80',  'Calacatta marble top on brushed brass legs.'),
  ('Rattan Accent Chair',    'Chairs',    899,  4.6, NULL,         'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=600&q=80',  'Natural textures for a warm, organic atmosphere.'),
  ('Pendant Cluster Light',  'Lighting',  849,  4.8, 'New',        'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80',  'Statement lighting for dining and living spaces.'),
  ('Oak Bookshelf',          'Cupboards', 1499, 4.7, NULL,         'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',   'Solid oak with open and closed storage sections.'),
  ('Linen Platform Bed',     'Beds',      2199, 4.6, NULL,         'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80',  'Minimalist low-profile frame, maximum comfort.');

-- ─────────────────────────────────────────────────────────
-- SEED: Admin user  (password = Admin@1234)
-- ─────────────────────────────────────────────────────────
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
  ('Admin', 'admin@luxinteriors.com',
   '$2a$12$tFkou1VtPrMTNKq.TSgcQu9e8xas1mMUYGMAvO4G/lkOxjsUXtxHS',
   'admin');

-- ─────────────────────────────────────────────────────────
-- SEED: Newsletter Subscribers
-- ─────────────────────────────────────────────────────────
INSERT IGNORE INTO newsletter (email, subscribed, created_at) VALUES
  ('sarah.mitchell@email.com', TRUE, NOW() - INTERVAL 45 DAY),
  ('james.cooper@email.com', TRUE, NOW() - INTERVAL 32 DAY),
  ('emma.johnson@email.com', TRUE, NOW() - INTERVAL 28 DAY),
  ('david.chen@email.com', TRUE, NOW() - INTERVAL 15 DAY),
  ('olivia.martinez@email.com', TRUE, NOW() - INTERVAL 12 DAY),
  ('michael.thompson@email.com', TRUE, NOW() - INTERVAL 8 DAY),
  ('sophia.anderson@email.com', TRUE, NOW() - INTERVAL 5 DAY),
  ('christopher.lee@email.com', TRUE, NOW() - INTERVAL 2 DAY),
  ('isabella.brown@email.com', TRUE, NOW() - INTERVAL 1 DAY),
  ('ethan.rodriguez@email.com', TRUE, NOW()),
  ('ava.wilson@email.com', TRUE, NOW()),
  ('noah.garcia@email.com', TRUE, NOW());

-- ─────────────────────────────────────────────────────────
-- SEED: Contact Inquiries
-- ─────────────────────────────────────────────────────────
INSERT IGNORE INTO contacts (name, email, subject, message, status, created_at) VALUES
  ('Margaret Stevens', 'margaret.stevens@email.com', 'Custom Order Inquiry', 
   'Hello, I am interested in a custom sectional sofa in emerald green. Can you provide details on customization options and lead times?',
   'new', NOW() - INTERVAL 3 DAY),
  
  ('Robert Patterson', 'robert.patterson@email.com', 'Shipping to Canada',
   'Do you ship internationally? I am interested in the Canopy King Bed but I live in Toronto, Canada.',
   'read', NOW() - INTERVAL 2 DAY),
  
  ('Catherine Lewis', 'catherine.lewis@email.com', 'Warranty Information',
   'I purchased the Velvet Sectional Sofa last month. What is the warranty coverage?',
   'replied', NOW() - INTERVAL 18 HOUR),
  
  ('James Morgan', 'james.morgan@email.com', 'Product Recommendation',
   'We are redesigning our office space. Can you recommend suitable furniture from your collection? We need around 8 workstations.',
   'new', NOW() - INTERVAL 12 HOUR),
  
  ('Diana Foster', 'diana.foster@email.com', 'Return & Exchange',
   'I received my order but the color of the lamp does not match my space. Can I exchange it for the pendant cluster light?',
   'read', NOW() - INTERVAL 6 HOUR),
  
  ('Victor Hayes', 'victor.hayes@email.com', 'Bulk Order Discount',
   'We run a boutique hotel and are interested in purchasing multiple items for a suite renovation. Can you provide bulk pricing?',
   'new', NOW() - INTERVAL 4 HOUR),
  
  ('Rachel King', 'rachel.king@email.com', 'Product Care Tips',
   'I just received the Walnut Dining Table. Can you send me care and maintenance instructions?',
   'replied', NOW() - INTERVAL 1 HOUR);
