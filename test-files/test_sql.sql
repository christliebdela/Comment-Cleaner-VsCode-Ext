-- Single line comment in SQL

-- TODO: Add foreign key constraint
-- FIXME: Fix index performance

-- Table definition with comments
CREATE TABLE users (
    id INT PRIMARY KEY,  -- Primary key
    name VARCHAR(100),   -- User's name
    email VARCHAR(100)   -- User's email
);

/*
 * Multi-line SQL comment
 * that spans multiple lines
 */

-- Insert statements with comments
INSERT INTO users (id, name, email) -- Add a new user
VALUES (1, 'John Doe', 'john@example.com');

-- Query with comments
SELECT 
    u.id,     -- User ID
    u.name,   -- User name
    u.email   -- User email
FROM 
    users u   -- Users table with alias
WHERE 
    u.id > 10 -- Only users with ID greater than 10
ORDER BY 
    u.name;   -- Sort by name

/* TODO: Add more complex queries
 * with joins and aggregations
 */

-- FIXME: Add proper error handling for duplicate emails

-- Comment with SQL-like content:
-- SELECT * FROM fake_table WHERE non_existent_column = 'value';

-- Comment at end of file