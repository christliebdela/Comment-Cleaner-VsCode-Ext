-- Lua Test File for Comment Cleaner Pro

-- Single line comment in Lua

-- TODO: Add error handling for file operations
-- FIXME: Fix table serialization issues

--[[
  Multi-line Lua comment
  that spans multiple lines
  with indentation
]]

-- Global variables with comments
local MAX_PLAYERS = 4      -- Maximum number of players
local GAME_VERSION = "1.0" -- Game version string

-- Function definition with comments
function calculate_distance(x1, y1, x2, y2)
    -- Calculate the differences
    local dx = x2 - x1 -- X-axis difference
    local dy = y2 - y1 -- Y-axis difference
    
    --[[
      Using the Pythagorean theorem:
      distance = sqrt(dx^2 + dy^2)
    ]]
    local distance = math.sqrt(dx*dx + dy*dy) -- Calculate Euclidean distance
    
    return distance -- Return the result
end

-- Table definition with comments
local player = {
    name = "Player1", -- Player name
    health = 100,     -- Initial health
    position = {      -- Player position
        x = 0,        -- X coordinate
        y = 0         -- Y coordinate
    },
    -- FIXME: Inventory system needs redesign
    inventory = {
        "sword",      -- Starting weapon
        "potion",     -- Starting item
        "map"         -- Navigation tool
    }
}

-- Class-like structure using tables and metatables
local Person = {} -- Person class
Person.__index = Person

-- Constructor function
function Person.new(name, age)
    local self = setmetatable({}, Person) -- Create instance with Person as metatable
    
    self.name = name  -- Person's name
    self.age = age    -- Person's age
    
    return self -- Return the new instance
end

-- Method to get greeting
function Person:get_greeting()
    -- Return a formatted greeting string
    return string.format("Hello, my name is %s and I'm %d years old", 
                         self.name, self.age) -- String formatting
end

-- Create a person instance
local john = Person.new("John", 30)
print(john:get_greeting()) -- Print greeting

-- Conditional example
if john.age >= 18 then
    print(john.name .. " is an adult") -- String concatenation
else
    print(john.name .. " is a minor")
end

-- TODO: Add validation for player input

-- Loop example
for i=1, 5 do
    print("Counter: " .. i) -- Print counter value
end

-- Comment containing code
--[[
local function unimplemented_function()
    local sum = 0
    for i=1, 100 do
        sum = sum + i
    end
    return sum
end
]]

-- FIXME: This might not work in all Lua versions
local lua_version = _VERSION
print("Lua version: " .. lua_version)

-- Comment at end of file