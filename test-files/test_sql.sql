-- Single line comment in SQL
SELECT * 
FROM users
WHERE id > 100; -- End of line comment

/* Multi-line
   SQL comment */
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100), -- Product name
    price DECIMAL(10,2) -- Product price
);

/*
 * Formatted block comment
 * that should be removed
 */
INSERT INTO products VALUES (1, 'Test Product', 9.99);