% filepath: c:\Users\Christlieb Dela\Desktop\.codes\Comment-Cleaner-VsCode-Ext\test-files\test_matlab.m
% Single line comment in MATLAB

% TODO: Add error handling for matrix calculations
% FIXME: Fix scalar handling in vector operations

%{
  Multi-line MATLAB comment block
  that spans multiple lines
  with formatting
%}

% Function to calculate factorial
function result = factorial(n)
    % Base case
    if n <= 1
        result = 1; % Return 1 for 0 or 1
        return;
    end
    
    % Recursive case
    result = n * factorial(n - 1); % Recursive call
end

% Create a test matrix
A = [1, 2, 3; 4, 5, 6; 7, 8, 9]; % 3x3 matrix

% Constants
PI = 3.14159; % Mathematical constant
MAX_ITERATIONS = 100; % Maximum number of iterations

%{
  Function to calculate matrix determinant
  using built-in functions
%}
function det_value = calculate_determinant(matrix)
    % Calculate determinant
    det_value = det(matrix); % Using built-in det function
end

% For loop with comments
for i = 1:10
    % Calculate square
    square = i^2; % Square the value
    
    % Display result
    disp(['Square of ', num2str(i), ' is ', num2str(square)]);
end

% TODO: Add input validation

% Plot a sine wave
t = linspace(0, 2*pi, 100); % Time vector
y = sin(t); % Generate sine wave

% Create the plot
figure; % Create new figure
plot(t, y); % Plot sine wave
title('Sine Wave'); % Add title
xlabel('Time (radians)'); % X-axis label
ylabel('Amplitude'); % Y-axis label

%{
  This block demonstrates matrix operations:
  - Matrix multiplication
  - Matrix addition
  - Transpose operation
%}
B = eye(3); % 3x3 identity matrix
C = A * B; % Matrix multiplication
D = A + B; % Matrix addition
E = A'; % Matrix transpose

% FIXME: This is not efficient for large matrices
eigenvalues = eig(A); % Calculate eigenvalues

% Conditionals with comments
if trace(A) > 10
    disp('Trace is large'); % Large trace message
else
    disp('Trace is small'); % Small trace message
end

% Comment with code-like content
%{
function unused_function(x)
    % Calculate sum of elements
    result = sum(x(:));
    
    % Display result
    disp(['Sum is ', num2str(result)]);
end
%}

% Create a function handle
square_func = @(x) x.^2; % Anonymous function to square input

% Apply to vector
vector = 1:5; % Create vector [1,2,3,4,5]
squared = square_func(vector); % Apply square function
disp(squared); % Display result

% Comment at end of file