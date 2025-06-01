-- Single line comment in Haskell

-- TODO: Add error handling for edge cases
-- FIXME: Fix performance issues with large lists

{-
  Multi-line Haskell comment
  that spans multiple lines
  with indentation
-}

-- Import modules with comments
import Data.List (sort, nub) -- For list operations
import Control.Monad (when)  -- For monadic operations
import Data.Maybe (fromMaybe) -- For Maybe operations

-- Type definition with comments
data Person = Person {
    name :: String,  -- Person's name
    age  :: Int      -- Person's age
} deriving (Show, Eq)  -- Derive Show and Eq instances

-- Create a person
john :: Person -- Type annotation
john = Person "John Doe" 30 -- John is 30 years old

{-
  Function to determine if a person is an adult
  based on their age property
-}
isAdult :: Person -> Bool -- Function type signature
isAdult person = age person >= 18 -- Return True if 18 or older

-- TODO: Add address field to Person type

-- Function with pattern matching and comment
factorial :: Integer -> Integer
factorial 0 = 1                     -- Base case
factorial n = n * factorial (n - 1) -- Recursive case

{-
  Higher-order function example
  that applies a function twice to a value
-}
applyTwice :: (a -> a) -> a -> a
applyTwice f x = f (f x) -- Apply function twice

-- List comprehension with comments
squares :: [Int] -> [Int]
squares xs = [x * x | x <- xs] -- Square each element

-- FIXME: This function needs optimization
fibonacci :: Int -> Integer
fibonacci n = fibs !! n  -- Get nth fibonacci number
  where
    fibs = 0 : 1 : zipWith (+) fibs (tail fibs) -- Infinite list of fibonacci numbers

{-
  Maybe monad example with multiple
  nested operations
-}
findPerson :: String -> [Person] -> Maybe Person
findPerson searchName people = 
    -- Find person by name
    find (\p -> name p == searchName) people
  where
    find :: (a -> Bool) -> [a] -> Maybe a
    find _ [] = Nothing            -- Empty list case
    find f (x:xs)                  -- Non-empty list
        | f x       = Just x       -- Found match
        | otherwise = find f xs    -- Continue searching

-- Comment with code-like content
{-
unusedFunction :: [Int] -> Int
unusedFunction xs = 
    let doubled = map (*2) xs
        summed = sum doubled
    in summed `div` length xs
-}

-- Main function with do notation
main :: IO ()
main = do
    putStrLn "Hello, Haskell!" -- Print greeting
    
    -- Print factorial result
    putStrLn $ "Factorial of 5: " ++ show (factorial 5)
    
    -- Print if John is an adult
    when (isAdult john) $ do
        putStrLn $ name john ++ " is an adult" -- Show status
    
    -- Print some squares
    print $ squares [1..5] -- [1,4,9,16,25]
    
    {-
      Nested block comment
      that spans multiple lines
    -}
    putStrLn "Goodbye!" -- Farewell message

-- Comment at end of file