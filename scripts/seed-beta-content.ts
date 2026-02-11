/**
 * Seed script for Dronacharya Beta Launch
 * Creates domains, tracks, courses, modules, and lessons for the beta
 *
 * Run with: npx tsx scripts/seed-beta-content.ts
 */

import { db } from '../src/lib/db';
import { domains, tracks, courses, modules, lessons } from '../src/lib/db/schema/content';
import { achievements } from '../src/lib/db/schema/gamification';

// ========================================
// DOMAINS
// ========================================
const DOMAINS = [
  {
    name: 'Python',
    slug: 'python',
    description: 'Master Python programming from fundamentals to advanced concepts',
    icon: 'code',
    order: 1,
  },
  {
    name: 'Data Science',
    slug: 'data-science',
    description: 'Learn data analysis, visualization, and statistical methods',
    icon: 'brain',
    order: 2,
  },
  {
    name: 'AI & Machine Learning',
    slug: 'machine-learning',
    description: 'Build intelligent systems with machine learning and deep learning',
    icon: 'zap',
    order: 3,
  },
];

// ========================================
// TRACKS
// ========================================
const TRACKS = [
  // Python Tracks
  {
    domainSlug: 'python',
    name: 'Python Fundamentals',
    slug: 'python-fundamentals',
    description: 'Start your programming journey with Python basics',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: [],
    skillsGained: ['Variables & Data Types', 'Control Flow', 'Functions', 'Basic OOP'],
    isPublished: true,
  },
  {
    domainSlug: 'python',
    name: 'Python Intermediate',
    slug: 'python-intermediate',
    description: 'Level up with advanced Python concepts and patterns',
    difficulty: 'intermediate',
    estimatedHours: 30,
    prerequisites: ['Python Fundamentals'],
    skillsGained: ['OOP Mastery', 'Error Handling', 'File I/O', 'Modules & Packages'],
    isPublished: false, // No courses yet — unpublish until content is added
  },
  // Data Science Tracks
  {
    domainSlug: 'data-science',
    name: 'Data Analysis with Python',
    slug: 'data-analysis-python',
    description: 'Learn to analyze data with pandas, numpy, and matplotlib',
    difficulty: 'beginner',
    estimatedHours: 25,
    prerequisites: ['Python Fundamentals'],
    skillsGained: ['pandas', 'numpy', 'Data Cleaning', 'Visualization'],
    isPublished: true,
  },
  {
    domainSlug: 'data-science',
    name: 'Statistical Analysis',
    slug: 'statistical-analysis',
    description: 'Master statistical methods for data-driven decisions',
    difficulty: 'intermediate',
    estimatedHours: 30,
    prerequisites: ['Data Analysis with Python'],
    skillsGained: ['Hypothesis Testing', 'Regression', 'Probability', 'Statistical Inference'],
    isPublished: false, // No courses yet — unpublish until content is added
  },
  // ML Tracks
  {
    domainSlug: 'machine-learning',
    name: 'Machine Learning Foundations',
    slug: 'ml-foundations',
    description: 'Understand core ML concepts and algorithms',
    difficulty: 'intermediate',
    estimatedHours: 35,
    prerequisites: ['Data Analysis with Python', 'Statistical Analysis'],
    skillsGained: ['Supervised Learning', 'Model Evaluation', 'scikit-learn', 'Feature Engineering'],
    isPublished: true,
  },
];

// ========================================
// COURSES (Sample for Python Fundamentals)
// ========================================
const COURSES = [
  // Python Fundamentals Track
  {
    trackSlug: 'python-fundamentals',
    name: 'Getting Started with Python',
    slug: 'getting-started-python',
    description: 'Your first steps in Python programming',
    order: 1,
    estimatedMinutes: 120,
    isPublished: true,
  },
  {
    trackSlug: 'python-fundamentals',
    name: 'Variables and Data Types',
    slug: 'variables-data-types',
    description: 'Understanding Python\'s data types and variables',
    order: 2,
    estimatedMinutes: 180,
    isPublished: true,
  },
  {
    trackSlug: 'python-fundamentals',
    name: 'Control Flow',
    slug: 'control-flow',
    description: 'If statements, loops, and program control',
    order: 3,
    estimatedMinutes: 200,
    isPublished: true,
  },
  {
    trackSlug: 'python-fundamentals',
    name: 'Functions',
    slug: 'functions',
    description: 'Creating reusable code with functions',
    order: 4,
    estimatedMinutes: 180,
    isPublished: true,
  },
  // Data Analysis Track
  {
    trackSlug: 'data-analysis-python',
    name: 'Introduction to pandas',
    slug: 'intro-pandas',
    description: 'Learn the fundamentals of pandas DataFrames',
    order: 1,
    estimatedMinutes: 150,
    isPublished: true,
  },
  {
    trackSlug: 'data-analysis-python',
    name: 'Data Cleaning',
    slug: 'data-cleaning',
    description: 'Handle missing data, duplicates, and outliers',
    order: 2,
    estimatedMinutes: 180,
    isPublished: true,
  },
  // ML Foundations Track
  {
    trackSlug: 'ml-foundations',
    name: 'What is Machine Learning?',
    slug: 'what-is-ml',
    description: 'Introduction to ML concepts and types',
    order: 1,
    estimatedMinutes: 90,
    isPublished: true,
  },
  {
    trackSlug: 'ml-foundations',
    name: 'Supervised Learning',
    slug: 'supervised-learning',
    description: 'Classification and regression fundamentals',
    order: 2,
    estimatedMinutes: 240,
    isPublished: true,
  },
];

// ========================================
// MODULES (Sample for "Variables and Data Types" course)
// ========================================
const MODULES = [
  {
    courseSlug: 'variables-data-types',
    name: 'Understanding Variables',
    description: 'Learn what variables are and how to use them',
    order: 1,
    type: 'concept',
    estimatedMinutes: 30,
  },
  {
    courseSlug: 'variables-data-types',
    name: 'Numeric Types',
    description: 'Working with integers, floats, and complex numbers',
    order: 2,
    type: 'concept',
    estimatedMinutes: 45,
  },
  {
    courseSlug: 'variables-data-types',
    name: 'Strings',
    description: 'Text manipulation and string operations',
    order: 3,
    type: 'concept',
    estimatedMinutes: 45,
  },
  {
    courseSlug: 'variables-data-types',
    name: 'Lists and Tuples',
    description: 'Ordered collections in Python',
    order: 4,
    type: 'concept',
    estimatedMinutes: 45,
  },
  {
    courseSlug: 'variables-data-types',
    name: 'Practice Challenge',
    description: 'Apply your knowledge',
    order: 5,
    type: 'challenge',
    estimatedMinutes: 15,
  },
  // Getting Started with Python
  {
    courseSlug: 'getting-started-python',
    name: 'Introduction to Python',
    description: 'Learn what Python is, how to install it, and write your first program',
    order: 1,
    type: 'concept',
    estimatedMinutes: 30,
  },
  // Control Flow
  {
    courseSlug: 'control-flow',
    name: 'Conditionals and Loops',
    description: 'Master if statements, for loops, and while loops',
    order: 1,
    type: 'concept',
    estimatedMinutes: 45,
  },
  // Functions
  {
    courseSlug: 'functions',
    name: 'Functions Basics',
    description: 'Learn to define and use functions in Python',
    order: 1,
    type: 'concept',
    estimatedMinutes: 40,
  },
  // Introduction to pandas
  {
    courseSlug: 'intro-pandas',
    name: 'DataFrame Basics',
    description: 'Understand the core pandas data structure',
    order: 1,
    type: 'concept',
    estimatedMinutes: 35,
  },
  // Data Cleaning
  {
    courseSlug: 'data-cleaning',
    name: 'Handling Missing Data',
    description: 'Strategies for dealing with missing and incomplete data',
    order: 1,
    type: 'concept',
    estimatedMinutes: 35,
  },
  // What is Machine Learning?
  {
    courseSlug: 'what-is-ml',
    name: 'ML Concepts',
    description: 'Core concepts and vocabulary of machine learning',
    order: 1,
    type: 'concept',
    estimatedMinutes: 30,
  },
  // Supervised Learning
  {
    courseSlug: 'supervised-learning',
    name: 'Classification Basics',
    description: 'Learn the fundamentals of classification algorithms',
    order: 1,
    type: 'concept',
    estimatedMinutes: 40,
  },
];

// ========================================
// LESSONS (Sample for "Understanding Variables" module)
// ========================================
const LESSONS = [
  {
    moduleSlug: 'understanding-variables-variables-data-types',
    name: 'What is a Variable?',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'What is a Variable?',
      objectives: [
        'Understand what variables are',
        'Learn how to create variables in Python',
        'Understand variable naming conventions',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `A **variable** is like a labeled container that holds data in your program. Think of it as a box with a name tag - you can put things in it, look at what's inside, or replace its contents.

In Python, you create a variable by choosing a name and using the assignment operator (=) to give it a value.`,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `# Creating your first variable
message = "Hello, Dronacharya!"
print(message)

# Variables can hold different types of data
age = 25
price = 19.99
is_student = True`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'What symbol do we use to assign a value to a variable in Python?',
          options: ['==', '=', ':=', '->'],
          correctAnswer: 1,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'encouraging and patient',
      hints: [
        'Think about what connects the variable name to its value',
        'The symbol is commonly used in math, but with a slightly different meaning',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'understanding-variables-variables-data-types',
    name: 'Variable Naming Rules',
    type: 'concept',
    order: 2,
    estimatedMinutes: 8,
    contentJson: {
      type: 'concept' as const,
      title: 'Variable Naming Rules',
      objectives: [
        'Learn Python variable naming rules',
        'Understand naming conventions (snake_case)',
        'Identify valid vs invalid variable names',
      ],
      steps: [
        {
          id: 'rules',
          type: 'text' as const,
          content: `Python has rules for variable names:

✅ **Must start with** a letter (a-z, A-Z) or underscore (_)
✅ **Can contain** letters, numbers, and underscores
❌ **Cannot start with** a number
❌ **Cannot contain** spaces or special characters
❌ **Cannot be** a reserved keyword (like \`if\`, \`for\`, \`class\`)`,
        },
        {
          id: 'examples',
          type: 'code' as const,
          content: `# Valid variable names
user_name = "Alice"      # snake_case (recommended)
userName = "Bob"         # camelCase (works but not Pythonic)
_private = "secret"      # starts with underscore
age2 = 30                # contains a number

# Invalid variable names (will cause errors)
# 2nd_place = "silver"   # starts with number
# user-name = "Alice"    # contains hyphen
# class = "Python"       # reserved keyword`,
        },
        {
          id: 'question',
          type: 'question' as const,
          content: 'Which of these is a VALID Python variable name?',
          options: ['1st_name', 'user-age', 'my_variable', 'for'],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'friendly and detailed',
      hints: [
        'Check if it starts with a number',
        'Look for special characters that might not be allowed',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'understanding-variables-variables-data-types',
    name: 'Practice: Variables',
    type: 'code',
    order: 3,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'Practice: Working with Variables',
      objectives: [
        'Create variables of different types',
        'Print variable values',
        'Perform basic operations with variables',
      ],
      code: {
        language: 'python',
        initialCode: `# Create a variable called 'name' with your name as a string
# YOUR CODE HERE

# Create a variable called 'age' with your age as an integer
# YOUR CODE HERE

# Create a variable called 'greeting' that combines "Hello, " with your name
# YOUR CODE HERE

# Print the greeting
print(greeting)`,
        testCases: [
          {
            input: '',
            expected: 'Hello,',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'helpful and encouraging',
      hints: [
        'Remember to use quotes around string values',
        'You can combine strings using the + operator',
        'Make sure your variable names match exactly what\'s asked',
      ],
      maxHints: 3,
    },
  },

  {
    moduleSlug: 'understanding-variables-variables-data-types',
    name: 'Quiz: Understanding Variables',
    type: 'quiz',
    order: 4,
    estimatedMinutes: 10,
    contentJson: {
      type: 'quiz' as const,
      title: 'Quiz: Understanding Variables',
      questions: [
        {
          id: 'q1',
          question: 'What symbol is used to assign a value to a variable in Python?',
          options: ['==', '=', ':=', '<-'],
          correctAnswer: 1,
          explanation: 'The single equals sign (=) is the assignment operator in Python. The double equals (==) is for comparison.',
        },
        {
          id: 'q2',
          question: 'Which of the following is NOT a valid Python variable name?',
          options: ['_count', 'my_var', '2nd_item', 'totalPrice'],
          correctAnswer: 2,
          explanation: 'Variable names cannot start with a number. 2nd_item starts with the digit 2, making it invalid.',
        },
        {
          id: 'q3',
          question: 'What naming convention is recommended for Python variables?',
          options: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
          correctAnswer: 2,
          explanation: 'Python convention (PEP 8) recommends snake_case for variable names, e.g., my_variable.',
        },
        {
          id: 'q4',
          question: 'What happens when you assign a new value to an existing variable?',
          options: ['An error occurs', 'The old value is kept', 'The variable holds the new value', 'A new variable is created'],
          correctAnswer: 2,
          explanation: 'In Python, reassigning a variable simply updates it to hold the new value. The old value is discarded.',
        },
      ],
      passingScore: 75,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'supportive and clear',
      hints: [
        'Think about the difference between assignment and comparison',
        'Review the rules about what characters can start a variable name',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // Numeric Types module lessons
  // ========================================
  {
    moduleSlug: 'numeric-types-variables-data-types',
    name: 'Introduction to Integers and Floats',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'Introduction to Integers and Floats',
      objectives: [
        'Understand the difference between integers and floats',
        'Learn when to use each numeric type',
        'Know how Python handles numeric type conversion',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `Python has two main numeric types:

**Integers (int)** are whole numbers without a decimal point: 1, 42, -7, 0

**Floats (float)** are numbers with a decimal point: 3.14, -0.5, 2.0

Python automatically determines the type based on whether you include a decimal point.`,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `# Integers
count = 10
temperature = -5
print(type(count))       # <class 'int'>

# Floats
price = 19.99
pi = 3.14159
print(type(price))       # <class 'float'>

# Converting between types
whole = int(3.7)         # 3 (truncates, does not round)
decimal = float(5)       # 5.0`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'What is the result of int(4.9)?',
          options: ['5', '4', '4.9', 'Error'],
          correctAnswer: 1,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'clear and methodical',
      hints: [
        'Remember that int() truncates toward zero, it does not round',
        'Think about what happens when you remove the decimal part',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'numeric-types-variables-data-types',
    name: 'Number Operations',
    type: 'code',
    order: 2,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'Number Operations',
      objectives: [
        'Use arithmetic operators with numbers',
        'Understand integer division vs float division',
        'Apply the modulo operator',
      ],
      code: {
        language: 'python',
        initialCode: `# Calculate the area of a rectangle
width = 8
height = 5
# Calculate area (width * height) and store in a variable called 'area'
# YOUR CODE HERE

# Calculate the average of three test scores
score1 = 85
score2 = 92
score3 = 78
# Calculate the average and store in a variable called 'average'
# YOUR CODE HERE

# Use integer division to find how many full dozen eggs in 50 eggs
total_eggs = 50
# Store the number of full dozens in 'full_dozens' using //
# YOUR CODE HERE

print(f"Area: {area}")
print(f"Average: {average}")
print(f"Full dozens: {full_dozens}")`,
        testCases: [
          {
            input: '',
            expected: 'Area: 40',
            hidden: false,
          },
          {
            input: '',
            expected: 'Full dozens: 4',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'encouraging and patient',
      hints: [
        'Multiplication uses the * operator',
        'Average = sum of values divided by how many values there are',
        'Integer division (//) gives you the whole number result without the remainder',
      ],
      maxHints: 3,
    },
  },
  {
    moduleSlug: 'numeric-types-variables-data-types',
    name: 'Numeric Types Quiz',
    type: 'quiz',
    order: 3,
    estimatedMinutes: 8,
    contentJson: {
      type: 'quiz' as const,
      title: 'Numeric Types Quiz',
      questions: [
        {
          id: 'q1',
          question: 'What type does Python assign to the value 7?',
          options: ['float', 'int', 'number', 'str'],
          correctAnswer: 1,
          explanation: '7 is a whole number with no decimal point, so Python treats it as an int.',
        },
        {
          id: 'q2',
          question: 'What is the result of 7 / 2 in Python 3?',
          options: ['3', '3.5', '3.0', 'Error'],
          correctAnswer: 1,
          explanation: 'The / operator always returns a float in Python 3, so 7 / 2 = 3.5.',
        },
        {
          id: 'q3',
          question: 'What is the result of 7 // 2?',
          options: ['3', '3.5', '4', '3.0'],
          correctAnswer: 0,
          explanation: 'The // operator performs integer (floor) division, returning 3.',
        },
        {
          id: 'q4',
          question: 'What is 10 % 3?',
          options: ['3', '1', '0', '3.33'],
          correctAnswer: 1,
          explanation: '10 % 3 gives the remainder of 10 divided by 3, which is 1.',
        },
      ],
      passingScore: 75,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'supportive and clear',
      hints: [
        'Think carefully about the difference between / and //',
        'The % operator gives you the remainder',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // Strings module lessons
  // ========================================
  {
    moduleSlug: 'strings-variables-data-types',
    name: 'String Basics',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'String Basics',
      objectives: [
        'Create strings using single and double quotes',
        'Understand string indexing and slicing',
        'Use f-strings for formatting',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `A **string** is a sequence of characters enclosed in quotes. Python lets you use single quotes ('...'), double quotes ("..."), or triple quotes for multi-line strings.

Strings are **immutable** - once created, individual characters cannot be changed. You can, however, create new strings from existing ones.`,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `# Creating strings
name = "Alice"
greeting = 'Hello'
multiline = """This is
a multi-line
string."""

# String indexing (0-based)
first_letter = name[0]    # 'A'
last_letter = name[-1]    # 'e'

# String slicing
print(name[1:4])          # 'lic'

# f-strings (formatted string literals)
age = 25
message = f"My name is {name} and I am {age} years old."
print(message)`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'What does "Python"[0] return?',
          options: ['"P"', '"Python"', '"y"', 'Error'],
          correctAnswer: 0,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'friendly and clear',
      hints: [
        'Remember that Python uses 0-based indexing',
        'The first character is at index 0',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'strings-variables-data-types',
    name: 'String Manipulation',
    type: 'code',
    order: 2,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'String Manipulation',
      objectives: [
        'Use common string methods',
        'Concatenate and repeat strings',
        'Extract substrings with slicing',
      ],
      code: {
        language: 'python',
        initialCode: `sentence = "  Hello, World!  "

# 1. Remove leading and trailing whitespace and store in 'cleaned'
# YOUR CODE HERE

# 2. Convert cleaned to all uppercase and store in 'shouted'
# YOUR CODE HERE

# 3. Replace "World" with "Python" in cleaned and store in 'updated'
# YOUR CODE HERE

# 4. Split the cleaned string by ", " and store in 'parts'
# YOUR CODE HERE

print(cleaned)
print(shouted)
print(updated)
print(parts)`,
        testCases: [
          {
            input: '',
            expected: 'Hello, World!',
            hidden: false,
          },
          {
            input: '',
            expected: 'HELLO, WORLD!',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'patient and encouraging',
      hints: [
        'Use .strip() to remove whitespace',
        'Use .upper() to convert to uppercase',
        'Use .replace(old, new) to replace text',
        'Use .split(separator) to split a string into a list',
      ],
      maxHints: 4,
    },
  },
  {
    moduleSlug: 'strings-variables-data-types',
    name: 'Strings Quiz',
    type: 'quiz',
    order: 3,
    estimatedMinutes: 8,
    contentJson: {
      type: 'quiz' as const,
      title: 'Strings Quiz',
      questions: [
        {
          id: 'q1',
          question: 'Which method removes whitespace from both ends of a string?',
          options: ['.trim()', '.strip()', '.clean()', '.remove()'],
          correctAnswer: 1,
          explanation: 'In Python, .strip() removes leading and trailing whitespace.',
        },
        {
          id: 'q2',
          question: 'What does "hello" + " " + "world" produce?',
          options: ['"helloworld"', '"hello world"', 'Error', '"hello+world"'],
          correctAnswer: 1,
          explanation: 'The + operator concatenates strings, joining them end-to-end.',
        },
        {
          id: 'q3',
          question: 'What is len("Python")?',
          options: ['5', '6', '7', 'Error'],
          correctAnswer: 1,
          explanation: '"Python" has 6 characters: P-y-t-h-o-n.',
        },
      ],
      passingScore: 66,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'supportive and clear',
      hints: [
        'Python uses different method names than some other languages',
        'Count each character carefully',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // Lists and Tuples module lessons
  // ========================================
  {
    moduleSlug: 'lists-and-tuples-variables-data-types',
    name: 'Lists Introduction',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'Lists Introduction',
      objectives: [
        'Create and access list elements',
        'Understand list mutability',
        'Know the difference between lists and tuples',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `A **list** is an ordered, mutable collection of items. Lists can hold items of any type and are created with square brackets [].

A **tuple** is similar but **immutable** - once created, you cannot change its contents. Tuples use parentheses ().

Lists are one of the most commonly used data structures in Python.`,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `# Creating lists
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]

# Accessing elements (0-based indexing)
print(fruits[0])     # "apple"
print(fruits[-1])    # "cherry"

# Lists are mutable
fruits[1] = "blueberry"
print(fruits)        # ["apple", "blueberry", "cherry"]

# Tuples are immutable
coordinates = (10, 20)
# coordinates[0] = 5  # This would cause an error!`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'What is the key difference between a list and a tuple?',
          options: [
            'Lists use {} and tuples use []',
            'Lists can hold more items',
            'Lists are mutable, tuples are immutable',
            'There is no difference',
          ],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'encouraging and clear',
      hints: [
        'Think about whether you can change the contents after creation',
        'Mutable means changeable, immutable means unchangeable',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'lists-and-tuples-variables-data-types',
    name: 'List Operations',
    type: 'code',
    order: 2,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'List Operations',
      objectives: [
        'Add and remove items from lists',
        'Use common list methods',
        'Iterate over lists',
      ],
      code: {
        language: 'python',
        initialCode: `colors = ["red", "green", "blue"]

# 1. Add "yellow" to the end of the list
# YOUR CODE HERE

# 2. Insert "orange" at index 1
# YOUR CODE HERE

# 3. Remove "green" from the list
# YOUR CODE HERE

# 4. Sort the list alphabetically
# YOUR CODE HERE

print(colors)
print(f"Number of colors: {len(colors)}")`,
        testCases: [
          {
            input: '',
            expected: 'Number of colors: 4',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'helpful and patient',
      hints: [
        'Use .append(item) to add to the end',
        'Use .insert(index, item) to insert at a specific position',
        'Use .remove(item) to remove by value',
        'Use .sort() to sort in place',
      ],
      maxHints: 4,
    },
  },
  {
    moduleSlug: 'lists-and-tuples-variables-data-types',
    name: 'Collections Quiz',
    type: 'quiz',
    order: 3,
    estimatedMinutes: 8,
    contentJson: {
      type: 'quiz' as const,
      title: 'Collections Quiz',
      questions: [
        {
          id: 'q1',
          question: 'Which method adds an item to the end of a list?',
          options: ['.add()', '.append()', '.push()', '.insert()'],
          correctAnswer: 1,
          explanation: '.append() adds an item to the end of a list.',
        },
        {
          id: 'q2',
          question: 'What does len([1, 2, 3, 4]) return?',
          options: ['3', '4', '5', 'Error'],
          correctAnswer: 1,
          explanation: 'len() returns the number of items, which is 4.',
        },
        {
          id: 'q3',
          question: 'How do you create an empty tuple?',
          options: ['tuple = []', 'tuple = ()', 'tuple = {}', 'tuple = ""'],
          correctAnswer: 1,
          explanation: 'Tuples use parentheses (), so an empty tuple is ().',
        },
      ],
      passingScore: 66,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'supportive and clear',
      hints: [
        'Lists and tuples use different bracket types',
        'Python list methods have specific names that differ from other languages',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // Practice Challenge module lesson
  // ========================================
  {
    moduleSlug: 'practice-challenge-variables-data-types',
    name: 'Variables Challenge',
    type: 'challenge',
    order: 1,
    estimatedMinutes: 15,
    contentJson: {
      type: 'challenge' as const,
      title: 'Variables and Data Types Challenge',
      objectives: [
        'Demonstrate understanding of variables and all data types covered',
        'Apply string, numeric, and collection operations together',
      ],
      code: {
        language: 'python',
        initialCode: `# CHALLENGE: Student Grade Calculator
# Given a student's name and three test scores, create a summary.

student_name = "Alice"
test1 = 85
test2 = 92
test3 = 78

# 1. Calculate the average score and store in 'average'
# YOUR CODE HERE

# 2. Create a list called 'scores' containing all three test scores
# YOUR CODE HERE

# 3. Find the highest score and store in 'best_score'
#    (Hint: use the max() function)
# YOUR CODE HERE

# 4. Create an f-string 'summary' that reads:
#    "Student: Alice | Average: 85.0 | Best: 92"
# YOUR CODE HERE

# 5. Determine if the student passed (average >= 70) and store True/False in 'passed'
# YOUR CODE HERE

print(summary)
print(f"Passed: {passed}")`,
        testCases: [
          {
            input: '',
            expected: 'Student: Alice | Average: 85.0 | Best: 92',
            hidden: false,
          },
          {
            input: '',
            expected: 'Passed: True',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'motivating and supportive',
      hints: [
        'Average = (test1 + test2 + test3) / 3',
        'Create a list with square brackets: [item1, item2, item3]',
        'max() can take a list and return the largest value',
        'Use f-strings: f"Student: {student_name} | Average: {average} | Best: {best_score}"',
        'A comparison like average >= 70 returns True or False',
      ],
      maxHints: 5,
    },
  },

  // ========================================
  // Introduction to Python module lessons (Getting Started with Python course)
  // ========================================
  {
    moduleSlug: 'introduction-to-python-getting-started-python',
    name: 'What is Python?',
    type: 'concept',
    order: 1,
    estimatedMinutes: 8,
    contentJson: {
      type: 'concept' as const,
      title: 'What is Python?',
      objectives: [
        'Understand what Python is and why it is popular',
        'Know the key features of Python',
        'Identify common use cases for Python',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `**Python** is a high-level, interpreted programming language created by Guido van Rossum in 1991. It is known for its clean, readable syntax that emphasizes simplicity.

Python is one of the most popular languages in the world, used for:
- **Web development** (Django, Flask)
- **Data science** (pandas, NumPy)
- **Machine learning** (scikit-learn, TensorFlow)
- **Automation** and scripting
- **Game development**, desktop apps, and more`,
        },
        {
          id: 'features',
          type: 'text' as const,
          content: `Key features that make Python great for beginners:

1. **Readable syntax** - Python code reads almost like English
2. **Interpreted** - No compilation step; run code immediately
3. **Dynamically typed** - No need to declare variable types
4. **Large standard library** - Batteries included
5. **Huge community** - Abundant tutorials, packages, and support`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'Which of the following is NOT a common use case for Python?',
          options: ['Web development', 'Data science', 'Operating system kernels', 'Machine learning'],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'enthusiastic and welcoming',
      hints: [
        'Think about what kind of programming requires very low-level hardware access',
        'Python is high-level and interpreted, which makes it less suitable for certain tasks',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'introduction-to-python-getting-started-python',
    name: 'Installing Python',
    type: 'concept',
    order: 2,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'Installing Python',
      objectives: [
        'Know how to install Python on your system',
        'Understand the difference between Python 2 and Python 3',
        'Verify your Python installation',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `To start writing Python, you need to install the Python interpreter. Always use **Python 3** (Python 2 reached end-of-life in 2020).

**Installation options:**
- **python.org** - Official installer for Windows, macOS, Linux
- **Anaconda** - Popular distribution for data science (includes many packages)
- **System package manager** - \`brew install python\` (macOS) or \`apt install python3\` (Linux)`,
        },
        {
          id: 'verify',
          type: 'code' as const,
          content: `# Check your Python version from the terminal
# python3 --version
# Python 3.12.0

# Start the interactive Python shell
# python3
# >>> print("Python is ready!")
# Python is ready!
# >>> exit()

# You can also run Python files
# python3 my_script.py`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'Which Python version should you use for new projects?',
          options: ['Python 1', 'Python 2', 'Python 3', 'Any version'],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'helpful and practical',
      hints: [
        'One of the versions has reached end-of-life',
        'Always use the latest major version for new projects',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'introduction-to-python-getting-started-python',
    name: 'Hello World',
    type: 'code',
    order: 3,
    estimatedMinutes: 10,
    contentJson: {
      type: 'code' as const,
      title: 'Hello World',
      objectives: [
        'Write and run your first Python program',
        'Use the print() function',
        'Understand basic Python syntax',
      ],
      code: {
        language: 'python',
        initialCode: `# Write your first Python program!

# 1. Print "Hello, World!" to the screen
# YOUR CODE HERE

# 2. Print your name on a new line
# YOUR CODE HERE

# 3. Print a line that says "I am learning Python with Dronacharya!"
# YOUR CODE HERE`,
        testCases: [
          {
            input: '',
            expected: 'Hello, World!',
            hidden: false,
          },
          {
            input: '',
            expected: 'I am learning Python with Dronacharya!',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'warm and encouraging',
      hints: [
        'Use the print() function with your text inside quotes',
        'print("Hello, World!") is the classic first program',
        'Each print() statement outputs on a new line',
      ],
      maxHints: 3,
    },
  },

  {
    moduleSlug: 'introduction-to-python-getting-started-python',
    name: 'Quiz: Introduction to Python',
    type: 'quiz',
    order: 4,
    estimatedMinutes: 10,
    contentJson: {
      type: 'quiz' as const,
      title: 'Quiz: Introduction to Python',
      questions: [
        {
          id: 'q1',
          question: 'Which version of Python should you use for new projects?',
          options: ['Python 1', 'Python 2', 'Python 3', 'Any version is fine'],
          correctAnswer: 2,
          explanation: 'Python 3 is the current and actively maintained version. Python 2 reached end-of-life in 2020.',
        },
        {
          id: 'q2',
          question: 'What function is used to display output in Python?',
          options: ['echo()', 'console.log()', 'print()', 'display()'],
          correctAnswer: 2,
          explanation: 'The print() function is used to output text and values to the screen in Python.',
        },
        {
          id: 'q3',
          question: 'Which of the following is Python commonly used for?',
          options: ['Operating system kernels', 'Data science and machine learning', 'Writing BIOS firmware', 'Hardware driver development'],
          correctAnswer: 1,
          explanation: 'Python is widely used for data science, machine learning, web development, and automation. It is not typically used for low-level system programming.',
        },
        {
          id: 'q4',
          question: 'What does "interpreted" mean in the context of Python?',
          options: ['Code must be compiled before running', 'Code is executed line by line without a separate compilation step', 'Code is translated to assembly language', 'Code only runs in a browser'],
          correctAnswer: 1,
          explanation: 'An interpreted language like Python executes code directly, line by line, without requiring a separate compilation step.',
        },
      ],
      passingScore: 75,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'welcoming and supportive',
      hints: [
        'Consider which version is still actively maintained',
        'Think about what makes Python beginner-friendly',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // Conditionals and Loops module lessons (Control Flow course)
  // ========================================
  {
    moduleSlug: 'conditionals-and-loops-control-flow',
    name: 'If Statements',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'If Statements',
      objectives: [
        'Write if, elif, and else statements',
        'Use comparison and logical operators',
        'Understand indentation in Python',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `**If statements** let your program make decisions. Based on a condition, Python will execute one block of code or another.

Python uses **indentation** (4 spaces) to define code blocks, unlike other languages that use braces {}.

The basic structure is:
\`\`\`
if condition:
    # code runs if condition is True
elif another_condition:
    # code runs if the first was False and this is True
else:
    # code runs if all conditions were False
\`\`\``,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `age = 18

if age >= 18:
    print("You are an adult")
elif age >= 13:
    print("You are a teenager")
else:
    print("You are a child")

# Comparison operators: ==, !=, <, >, <=, >=
# Logical operators: and, or, not

temperature = 25
if temperature > 30 and temperature < 40:
    print("It's hot!")
elif temperature >= 20:
    print("It's pleasant")  # This will print`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'What keyword is used for "otherwise if" in Python?',
          options: ['else if', 'elseif', 'elif', 'otherwise'],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'patient and clear',
      hints: [
        'Python uses a shortened version of "else if"',
        'It is a unique Python keyword that combines else and if',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'conditionals-and-loops-control-flow',
    name: 'For Loops',
    type: 'code',
    order: 2,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'For Loops',
      objectives: [
        'Iterate over sequences with for loops',
        'Use range() for numeric loops',
        'Apply for loops to solve problems',
      ],
      code: {
        language: 'python',
        initialCode: `# 1. Use a for loop to print each fruit in the list
fruits = ["apple", "banana", "cherry"]
# YOUR CODE HERE

# 2. Use range() to print numbers 1 through 5
# YOUR CODE HERE

# 3. Calculate the sum of numbers from 1 to 10 using a for loop
total = 0
# YOUR CODE HERE

print(f"Sum of 1 to 10: {total}")`,
        testCases: [
          {
            input: '',
            expected: 'apple',
            hidden: false,
          },
          {
            input: '',
            expected: 'Sum of 1 to 10: 55',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'encouraging and step-by-step',
      hints: [
        'for item in list: will loop through each item',
        'range(1, 6) generates numbers 1, 2, 3, 4, 5',
        'range(1, 11) generates 1 through 10; use total += number inside the loop',
      ],
      maxHints: 3,
    },
  },
  {
    moduleSlug: 'conditionals-and-loops-control-flow',
    name: 'While Loops',
    type: 'code',
    order: 3,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'While Loops',
      objectives: [
        'Understand when to use while loops vs for loops',
        'Write while loops with proper termination conditions',
        'Use break and continue statements',
      ],
      code: {
        language: 'python',
        initialCode: `# 1. Use a while loop to count down from 5 to 1, printing each number
countdown = 5
# YOUR CODE HERE

print("Liftoff!")

# 2. Use a while loop to find the first power of 2 greater than 1000
power = 1
# YOUR CODE HERE

print(f"First power of 2 > 1000: {power}")`,
        testCases: [
          {
            input: '',
            expected: 'Liftoff!',
            hidden: false,
          },
          {
            input: '',
            expected: 'First power of 2 > 1000: 1024',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'patient and methodical',
      hints: [
        'while countdown > 0: then print and decrement with countdown -= 1',
        'while power <= 1000: then multiply power by 2 each iteration',
        'Make sure your loop condition will eventually become False to avoid infinite loops',
      ],
      maxHints: 3,
    },
  },

  {
    moduleSlug: 'conditionals-and-loops-control-flow',
    name: 'Quiz: Control Flow',
    type: 'quiz',
    order: 4,
    estimatedMinutes: 10,
    contentJson: {
      type: 'quiz' as const,
      title: 'Quiz: Control Flow',
      questions: [
        {
          id: 'q1',
          question: 'What keyword is used for "otherwise if" in Python?',
          options: ['else if', 'elseif', 'elif', 'otherwise'],
          correctAnswer: 2,
          explanation: 'Python uses "elif" as a shorthand for "else if" to check additional conditions.',
        },
        {
          id: 'q2',
          question: 'What does range(1, 5) generate?',
          options: ['1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '1, 2, 3, 4', '1, 2, 3, 4, 5, 6'],
          correctAnswer: 2,
          explanation: 'range(1, 5) generates numbers starting from 1 up to but not including 5: 1, 2, 3, 4.',
        },
        {
          id: 'q3',
          question: 'What is the key difference between a for loop and a while loop?',
          options: [
            'For loops are faster than while loops',
            'For loops iterate over a sequence; while loops repeat as long as a condition is true',
            'While loops can only run once',
            'There is no difference',
          ],
          correctAnswer: 1,
          explanation: 'For loops iterate over a known sequence (list, range, etc.), while while loops continue executing as long as their condition evaluates to True.',
        },
        {
          id: 'q4',
          question: 'What happens if a while loop condition is always True?',
          options: ['The program crashes immediately', 'The loop runs forever (infinite loop)', 'Python automatically stops it after 1000 iterations', 'It skips the loop entirely'],
          correctAnswer: 1,
          explanation: 'If the while loop condition never becomes False, the loop runs indefinitely, creating an infinite loop.',
        },
        {
          id: 'q5',
          question: 'How does Python define code blocks (e.g., inside an if statement)?',
          options: ['Using curly braces {}', 'Using parentheses ()', 'Using indentation', 'Using the "begin" and "end" keywords'],
          correctAnswer: 2,
          explanation: 'Python uses indentation (typically 4 spaces) to define code blocks, unlike many other languages that use curly braces.',
        },
      ],
      passingScore: 60,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'patient and clear',
      hints: [
        'Remember how Python shortens common keywords',
        'Think about whether the end value in range() is included or excluded',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // Functions Basics module lessons (Functions course)
  // ========================================
  {
    moduleSlug: 'functions-basics-functions',
    name: 'Defining Functions',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'Defining Functions',
      objectives: [
        'Understand why functions are useful',
        'Define functions with the def keyword',
        'Call functions and understand the flow of execution',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `A **function** is a reusable block of code that performs a specific task. Functions help you:

- **Avoid repetition** - Write once, use many times
- **Organize code** - Break complex problems into smaller pieces
- **Improve readability** - Give meaningful names to operations

You define a function using the \`def\` keyword, followed by the function name, parentheses, and a colon.`,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `# Defining a simple function
def greet():
    print("Hello from Dronacharya!")

# Calling the function
greet()       # prints: Hello from Dronacharya!
greet()       # you can call it as many times as you want

# Function with a parameter
def greet_user(name):
    print(f"Hello, {name}! Welcome to Dronacharya.")

greet_user("Alice")   # Hello, Alice! Welcome to Dronacharya.
greet_user("Bob")     # Hello, Bob! Welcome to Dronacharya.`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'Which keyword is used to define a function in Python?',
          options: ['function', 'func', 'def', 'define'],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'encouraging and clear',
      hints: [
        'It is a short abbreviation of the word "define"',
        'Python uses short, readable keywords',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'functions-basics-functions',
    name: 'Parameters and Returns',
    type: 'code',
    order: 2,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'Parameters and Returns',
      objectives: [
        'Use parameters to pass data into functions',
        'Return values from functions',
        'Use default parameter values',
      ],
      code: {
        language: 'python',
        initialCode: `# 1. Define a function 'add' that takes two numbers and returns their sum
# YOUR CODE HERE

# 2. Define a function 'is_even' that takes a number and returns True if even, False if odd
# YOUR CODE HERE

# 3. Define a function 'create_greeting' that takes a name and an optional
#    greeting (default "Hello") and returns a formatted string like "Hello, Alice!"
# YOUR CODE HERE

# Test your functions
print(add(3, 5))
print(is_even(4))
print(is_even(7))
print(create_greeting("Alice"))
print(create_greeting("Bob", "Hi"))`,
        testCases: [
          {
            input: '',
            expected: '8',
            hidden: false,
          },
          {
            input: '',
            expected: 'True',
            hidden: false,
          },
          {
            input: '',
            expected: 'Hello, Alice!',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'supportive and detailed',
      hints: [
        'def add(a, b): return a + b',
        'Use the modulo operator: number % 2 == 0 checks for even',
        'Default parameters: def func(name, greeting="Hello"):',
        'Return the formatted string with f"..."',
      ],
      maxHints: 4,
    },
  },
  {
    moduleSlug: 'functions-basics-functions',
    name: 'Functions Quiz',
    type: 'quiz',
    order: 3,
    estimatedMinutes: 8,
    contentJson: {
      type: 'quiz' as const,
      title: 'Functions Quiz',
      questions: [
        {
          id: 'q1',
          question: 'What does a function return if there is no return statement?',
          options: ['0', '""', 'None', 'Error'],
          correctAnswer: 2,
          explanation: 'A function without a return statement implicitly returns None.',
        },
        {
          id: 'q2',
          question: 'Which of these correctly defines a function with a default parameter?',
          options: [
            'def greet(name = "World"):',
            'def greet(name: "World"):',
            'def greet(name == "World"):',
            'def greet(default name = "World"):',
          ],
          correctAnswer: 0,
          explanation: 'Default parameters use = in the function signature.',
        },
        {
          id: 'q3',
          question: 'What is the output of: def add(a, b): return a + b; print(add(2, 3))?',
          options: ['23', '5', 'None', 'Error'],
          correctAnswer: 1,
          explanation: 'add(2, 3) returns 2 + 3 = 5, which is then printed.',
        },
      ],
      passingScore: 66,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'supportive and clear',
      hints: [
        'Think about what Python does when you do not explicitly tell a function what to return',
        'Default values are assigned with the = operator',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // DataFrame Basics module lessons (Introduction to pandas course)
  // ========================================
  {
    moduleSlug: 'dataframe-basics-intro-pandas',
    name: 'What are DataFrames?',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'What are DataFrames?',
      objectives: [
        'Understand what a DataFrame is',
        'Know the relationship between DataFrames and Series',
        'Recognize when to use pandas for data tasks',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `A **DataFrame** is the primary data structure in pandas. Think of it as a spreadsheet or SQL table in Python - it stores data in rows and columns.

Key concepts:
- A **DataFrame** is a 2D table with labeled rows and columns
- A **Series** is a single column of a DataFrame
- Each column can have a different data type (numbers, strings, dates, etc.)

pandas is the most popular Python library for data analysis, used by data scientists and analysts worldwide.`,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `import pandas as pd

# Create a DataFrame from a dictionary
data = {
    "Name": ["Alice", "Bob", "Charlie"],
    "Age": [25, 30, 35],
    "City": ["New York", "London", "Tokyo"]
}
df = pd.DataFrame(data)
print(df)
#       Name  Age      City
# 0    Alice   25  New York
# 1      Bob   30    London
# 2  Charlie   35     Tokyo

# Access a single column (returns a Series)
print(df["Name"])

# Basic info
print(f"Shape: {df.shape}")       # (3, 3) = 3 rows, 3 columns
print(f"Columns: {list(df.columns)}")`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'What is a single column of a DataFrame called?',
          options: ['Array', 'Series', 'List', 'Vector'],
          correctAnswer: 1,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'clear and practical',
      hints: [
        'pandas has a specific name for a 1D labeled data structure',
        'It is one of the two main data structures in pandas',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'dataframe-basics-intro-pandas',
    name: 'Creating DataFrames',
    type: 'code',
    order: 2,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'Creating DataFrames',
      objectives: [
        'Create DataFrames from dictionaries and lists',
        'Select rows and columns',
        'Perform basic DataFrame operations',
      ],
      code: {
        language: 'python',
        initialCode: `import pandas as pd

# 1. Create a DataFrame 'students' with columns: Name, Score, Grade
#    Use this data:
#    Alice - 92 - A, Bob - 78 - B, Charlie - 85 - B, Diana - 96 - A
# YOUR CODE HERE

# 2. Print only the "Name" and "Score" columns
# YOUR CODE HERE

# 3. Calculate and print the mean score
# YOUR CODE HERE

# 4. Filter and print only students with Score > 80
# YOUR CODE HERE`,
        testCases: [
          {
            input: '',
            expected: 'Alice',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'patient and practical',
      hints: [
        'Create a dictionary with keys as column names and values as lists',
        'Use df[["Name", "Score"]] to select multiple columns',
        'Use df["Score"].mean() to calculate the average',
        'Use df[df["Score"] > 80] to filter rows',
      ],
      maxHints: 4,
    },
  },

  {
    moduleSlug: 'dataframe-basics-intro-pandas',
    name: 'Quiz: DataFrame Basics',
    type: 'quiz',
    order: 3,
    estimatedMinutes: 10,
    contentJson: {
      type: 'quiz' as const,
      title: 'Quiz: DataFrame Basics',
      questions: [
        {
          id: 'q1',
          question: 'What is a single column of a pandas DataFrame called?',
          options: ['Array', 'Series', 'List', 'Vector'],
          correctAnswer: 1,
          explanation: 'A single column of a DataFrame is a pandas Series, which is a 1D labeled data structure.',
        },
        {
          id: 'q2',
          question: 'How do you access a column named "Age" from a DataFrame df?',
          options: ['df.get("Age")', 'df["Age"]', 'df(Age)', 'df->Age'],
          correctAnswer: 1,
          explanation: 'You access a DataFrame column using bracket notation: df["Age"]. You can also use df.Age for simple column names.',
        },
        {
          id: 'q3',
          question: 'What does df.shape return for a DataFrame with 5 rows and 3 columns?',
          options: ['(3, 5)', '(5, 3)', '15', '[5, 3]'],
          correctAnswer: 1,
          explanation: 'df.shape returns a tuple of (rows, columns), so a DataFrame with 5 rows and 3 columns returns (5, 3).',
        },
        {
          id: 'q4',
          question: 'Which function creates a DataFrame from a dictionary?',
          options: ['pd.Series()', 'pd.DataFrame()', 'pd.Table()', 'pd.create()'],
          correctAnswer: 1,
          explanation: 'pd.DataFrame() is the constructor that creates a DataFrame, and it can accept dictionaries, lists, and other data structures.',
        },
      ],
      passingScore: 75,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'practical and clear',
      hints: [
        'DataFrames and Series are the two core pandas data structures',
        'Remember the order of the shape tuple: rows first, then columns',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // Handling Missing Data module lessons (Data Cleaning course)
  // ========================================
  {
    moduleSlug: 'handling-missing-data-data-cleaning',
    name: 'Missing Data Strategies',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'Missing Data Strategies',
      objectives: [
        'Identify missing data in DataFrames',
        'Understand different strategies for handling missing data',
        'Know when to drop vs fill missing values',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `Missing data is one of the most common problems in real-world datasets. In pandas, missing values are represented as **NaN** (Not a Number) or **None**.

**Common strategies for handling missing data:**

1. **Drop** - Remove rows or columns with missing values
   - Use when: Few missing values, large dataset
2. **Fill with a value** - Replace NaN with a constant, mean, median, or mode
   - Use when: You want to preserve all rows
3. **Forward/backward fill** - Use the previous or next valid value
   - Use when: Time-series or ordered data
4. **Interpolation** - Estimate missing values mathematically
   - Use when: Numeric data with a trend`,
        },
        {
          id: 'example1',
          type: 'code' as const,
          content: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "Name": ["Alice", "Bob", "Charlie", "Diana"],
    "Age": [25, np.nan, 35, 28],
    "Score": [92, 85, np.nan, 96]
})

# Check for missing values
print(df.isnull().sum())
# Name     0
# Age      1
# Score    1

# Strategy 1: Drop rows with any NaN
clean1 = df.dropna()

# Strategy 2: Fill with mean
clean2 = df.fillna(df.mean(numeric_only=True))

# Strategy 3: Fill with a specific value
clean3 = df.fillna({"Age": 0, "Score": df["Score"].median()})`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'Which method checks for missing values in a pandas DataFrame?',
          options: ['.missing()', '.isnull()', '.isnan()', '.empty()'],
          correctAnswer: 1,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'analytical and clear',
      hints: [
        'pandas has a built-in method specifically for detecting null/NaN values',
        'The method name uses the word "null"',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'handling-missing-data-data-cleaning',
    name: 'Cleaning with pandas',
    type: 'code',
    order: 2,
    estimatedMinutes: 12,
    contentJson: {
      type: 'code' as const,
      title: 'Cleaning with pandas',
      objectives: [
        'Detect and count missing values',
        'Apply fillna and dropna methods',
        'Clean a realistic dataset',
      ],
      code: {
        language: 'python',
        initialCode: `import pandas as pd
import numpy as np

# A messy dataset
data = {
    "Product": ["Widget A", "Widget B", "Widget C", "Widget D", "Widget E"],
    "Price": [10.99, np.nan, 15.50, 12.00, np.nan],
    "Quantity": [100, 200, np.nan, 150, 80],
    "Category": ["Electronics", "Electronics", "Home", None, "Home"]
}
df = pd.DataFrame(data)

# 1. Print the count of missing values per column
# YOUR CODE HERE

# 2. Fill missing Price values with the median price
# YOUR CODE HERE

# 3. Fill missing Quantity values with 0
# YOUR CODE HERE

# 4. Fill missing Category values with "Unknown"
# YOUR CODE HERE

# 5. Print the cleaned DataFrame
print(df)
print(f"Remaining missing values: {df.isnull().sum().sum()}")`,
        testCases: [
          {
            input: '',
            expected: 'Remaining missing values: 0',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'methodical and supportive',
      hints: [
        'Use print(df.isnull().sum()) to see missing counts',
        'df["Price"] = df["Price"].fillna(df["Price"].median())',
        'df["Quantity"] = df["Quantity"].fillna(0)',
        'df["Category"] = df["Category"].fillna("Unknown")',
      ],
      maxHints: 4,
    },
  },

  {
    moduleSlug: 'handling-missing-data-data-cleaning',
    name: 'Quiz: Handling Missing Data',
    type: 'quiz',
    order: 3,
    estimatedMinutes: 10,
    contentJson: {
      type: 'quiz' as const,
      title: 'Quiz: Handling Missing Data',
      questions: [
        {
          id: 'q1',
          question: 'How are missing values typically represented in pandas?',
          options: ['None only', 'NaN only', 'Both NaN and None', 'Zero (0)'],
          correctAnswer: 2,
          explanation: 'pandas represents missing values as both NaN (Not a Number) and None. Both are treated as missing data in DataFrames.',
        },
        {
          id: 'q2',
          question: 'Which method removes rows that contain missing values?',
          options: ['df.remove_na()', 'df.dropna()', 'df.clean()', 'df.delete_missing()'],
          correctAnswer: 1,
          explanation: 'df.dropna() removes rows (by default) that contain any missing values.',
        },
        {
          id: 'q3',
          question: 'What does df.fillna(0) do?',
          options: ['Removes all zeros', 'Replaces all NaN values with 0', 'Counts the number of zeros', 'Adds a column of zeros'],
          correctAnswer: 1,
          explanation: 'df.fillna(0) replaces all NaN/missing values in the DataFrame with 0.',
        },
        {
          id: 'q4',
          question: 'When is dropping missing values a good strategy?',
          options: ['When you have a small dataset', 'When most rows have missing values', 'When few values are missing and the dataset is large', 'Dropping is always the best strategy'],
          correctAnswer: 2,
          explanation: 'Dropping is appropriate when only a few values are missing and you have a large dataset, so losing some rows does not significantly reduce your data.',
        },
        {
          id: 'q5',
          question: 'Which method detects missing values in a DataFrame?',
          options: ['.missing()', '.isnull()', '.isnan()', '.empty()'],
          correctAnswer: 1,
          explanation: 'The .isnull() method (or its alias .isna()) returns a boolean DataFrame indicating which values are missing.',
        },
      ],
      passingScore: 60,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'analytical and supportive',
      hints: [
        'pandas has specific method names for handling missing data',
        'Consider the trade-offs between dropping and filling missing values',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // ML Concepts module lessons (What is Machine Learning? course)
  // ========================================
  {
    moduleSlug: 'ml-concepts-what-is-ml',
    name: 'Types of Machine Learning',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'Types of Machine Learning',
      objectives: [
        'Understand the three main types of machine learning',
        'Identify real-world examples of each type',
        'Know when to use each approach',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `**Machine Learning (ML)** is a branch of artificial intelligence where computers learn patterns from data instead of being explicitly programmed.

There are three main types:

1. **Supervised Learning** - Learn from labeled data (input-output pairs)
   - Examples: Email spam detection, house price prediction, image classification

2. **Unsupervised Learning** - Find patterns in unlabeled data
   - Examples: Customer segmentation, anomaly detection, topic modeling

3. **Reinforcement Learning** - Learn by interacting with an environment and receiving rewards
   - Examples: Game playing (AlphaGo), robotics, recommendation systems`,
        },
        {
          id: 'details',
          type: 'text' as const,
          content: `**Supervised Learning** is the most common type. You provide the algorithm with examples that include the correct answer (label), and it learns to predict the answer for new data.

Two main tasks in supervised learning:
- **Classification** - Predict a category (spam/not spam, cat/dog)
- **Regression** - Predict a continuous number (price, temperature)`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'Predicting house prices based on historical sales data is an example of:',
          options: ['Unsupervised learning', 'Reinforcement learning', 'Supervised learning (regression)', 'Supervised learning (classification)'],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'clear and insightful',
      hints: [
        'You have labeled data (past prices) and want to predict a continuous number',
        'Classification predicts categories, regression predicts numbers',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'ml-concepts-what-is-ml',
    name: 'The ML Workflow',
    type: 'concept',
    order: 2,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'The ML Workflow',
      objectives: [
        'Understand the end-to-end machine learning pipeline',
        'Know the purpose of train/test splits',
        'Appreciate the importance of evaluation metrics',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `Every ML project follows a general workflow:

1. **Define the problem** - What are you trying to predict or discover?
2. **Collect data** - Gather relevant, quality data
3. **Prepare data** - Clean, transform, and split into training/testing sets
4. **Choose a model** - Select an appropriate algorithm
5. **Train the model** - Let the algorithm learn from training data
6. **Evaluate** - Test performance on unseen data
7. **Tune and improve** - Adjust parameters, try different approaches
8. **Deploy** - Put the model into production`,
        },
        {
          id: 'split',
          type: 'text' as const,
          content: `**Why split data into training and testing sets?**

If you evaluate a model on the same data it trained on, it might just memorize the answers (called **overfitting**). By holding out a test set, you can measure how well the model generalizes to new, unseen data.

A common split is **80% training / 20% testing**.

\`\`\`python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
\`\`\``,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'Why do we split data into training and testing sets?',
          options: [
            'To make the model train faster',
            'To reduce the amount of data needed',
            'To evaluate how well the model generalizes to unseen data',
            'To increase the model accuracy',
          ],
          correctAnswer: 2,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'thoughtful and methodical',
      hints: [
        'Think about what happens if you test on the same data you trained on',
        'The goal is to see if the model can handle data it has never seen before',
      ],
      maxHints: 2,
    },
  },

  {
    moduleSlug: 'ml-concepts-what-is-ml',
    name: 'Quiz: ML Concepts',
    type: 'quiz',
    order: 3,
    estimatedMinutes: 10,
    contentJson: {
      type: 'quiz' as const,
      title: 'Quiz: ML Concepts',
      questions: [
        {
          id: 'q1',
          question: 'Which type of machine learning uses labeled data to learn?',
          options: ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Transfer learning'],
          correctAnswer: 1,
          explanation: 'Supervised learning uses labeled data (input-output pairs) to train models that can predict outputs for new inputs.',
        },
        {
          id: 'q2',
          question: 'Predicting whether an email is spam or not is an example of:',
          options: ['Regression', 'Clustering', 'Classification', 'Dimensionality reduction'],
          correctAnswer: 2,
          explanation: 'Spam detection is a classification task because the model predicts a category (spam or not spam).',
        },
        {
          id: 'q3',
          question: 'Why do we split data into training and testing sets?',
          options: [
            'To make training faster',
            'To reduce memory usage',
            'To evaluate how well the model generalizes to unseen data',
            'To make the dataset smaller',
          ],
          correctAnswer: 2,
          explanation: 'Splitting data ensures we can test the model on data it has never seen, measuring how well it generalizes rather than just memorizes.',
        },
        {
          id: 'q4',
          question: 'What is overfitting?',
          options: [
            'When a model performs well on both training and test data',
            'When a model memorizes training data but fails on new data',
            'When a model is too simple to capture patterns',
            'When the dataset is too large',
          ],
          correctAnswer: 1,
          explanation: 'Overfitting occurs when a model learns the training data too well (including noise), resulting in poor performance on unseen data.',
        },
        {
          id: 'q5',
          question: 'What is the typical train/test split ratio?',
          options: ['50% / 50%', '90% / 10%', '80% / 20%', '70% / 30%'],
          correctAnswer: 2,
          explanation: 'A common split is 80% training data and 20% testing data, though the exact ratio can vary depending on the dataset size.',
        },
      ],
      passingScore: 60,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'insightful and supportive',
      hints: [
        'Think about what kind of data each learning type requires',
        'Consider why evaluating on training data alone can be misleading',
      ],
      maxHints: 2,
    },
  },

  // ========================================
  // Classification Basics module lessons (Supervised Learning course)
  // ========================================
  {
    moduleSlug: 'classification-basics-supervised-learning',
    name: 'Classification Introduction',
    type: 'concept',
    order: 1,
    estimatedMinutes: 10,
    contentJson: {
      type: 'concept' as const,
      title: 'Classification Introduction',
      objectives: [
        'Understand what classification is in machine learning',
        'Know common classification algorithms',
        'Understand accuracy and confusion matrices',
      ],
      steps: [
        {
          id: 'intro',
          type: 'text' as const,
          content: `**Classification** is a supervised learning task where the goal is to predict which **category** (class) a data point belongs to.

**Common classification algorithms:**
- **Logistic Regression** - Simple, fast, good baseline
- **Decision Trees** - Easy to interpret, handles non-linear data
- **Random Forest** - Ensemble of decision trees, very accurate
- **K-Nearest Neighbors (KNN)** - Classifies based on closest examples
- **Support Vector Machines (SVM)** - Finds optimal decision boundaries`,
        },
        {
          id: 'evaluation',
          type: 'text' as const,
          content: `**Evaluating classification models:**

- **Accuracy** - Percentage of correct predictions (works well for balanced datasets)
- **Precision** - Of all positive predictions, how many were correct?
- **Recall** - Of all actual positives, how many did we find?
- **F1 Score** - Harmonic mean of precision and recall

A **confusion matrix** shows the breakdown of predictions vs actual values, helping you understand where the model makes mistakes.`,
        },
        {
          id: 'question1',
          type: 'question' as const,
          content: 'Which metric is best when your dataset has imbalanced classes?',
          options: ['Accuracy', 'F1 Score', 'Training time', 'Number of features'],
          correctAnswer: 1,
        },
      ],
    },
    aiConfig: {
      mode: 'socratic' as const,
      personality: 'analytical and encouraging',
      hints: [
        'Accuracy can be misleading when one class is much more common than another',
        'This metric balances both precision and recall',
      ],
      maxHints: 2,
    },
  },
  {
    moduleSlug: 'classification-basics-supervised-learning',
    name: 'scikit-learn Classification',
    type: 'code',
    order: 2,
    estimatedMinutes: 15,
    contentJson: {
      type: 'code' as const,
      title: 'scikit-learn Classification',
      objectives: [
        'Build a classification model with scikit-learn',
        'Train and evaluate the model',
        'Interpret model results',
      ],
      code: {
        language: 'python',
        initialCode: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

# Load the famous Iris dataset
iris = load_iris()
X = iris.data       # Features: sepal/petal length and width
y = iris.target     # Labels: 0=setosa, 1=versicolor, 2=virginica

# 1. Split data: 80% train, 20% test (use random_state=42)
# YOUR CODE HERE

# 2. Create a DecisionTreeClassifier and store in 'model'
# YOUR CODE HERE

# 3. Train (fit) the model on the training data
# YOUR CODE HERE

# 4. Make predictions on the test data and store in 'predictions'
# YOUR CODE HERE

# 5. Calculate and print the accuracy
# YOUR CODE HERE

print(f"Number of test samples: {len(X_test)}")`,
        testCases: [
          {
            input: '',
            expected: 'Number of test samples: 30',
            hidden: false,
          },
        ],
      },
    },
    aiConfig: {
      mode: 'scaffolded' as const,
      personality: 'methodical and encouraging',
      hints: [
        'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)',
        'model = DecisionTreeClassifier()',
        'model.fit(X_train, y_train)',
        'predictions = model.predict(X_test)',
        'accuracy = accuracy_score(y_test, predictions)',
      ],
      maxHints: 5,
    },
  },
  {
    moduleSlug: 'classification-basics-supervised-learning',
    name: 'Quiz: Classification',
    type: 'quiz',
    order: 3,
    estimatedMinutes: 10,
    contentJson: {
      type: 'quiz' as const,
      title: 'Quiz: Classification',
      questions: [
        {
          id: 'q1',
          question: 'What is the goal of a classification algorithm?',
          options: ['Predict a continuous number', 'Predict a category or class', 'Group similar data points together', 'Reduce the number of features'],
          correctAnswer: 1,
          explanation: 'Classification predicts which category (class) a data point belongs to, such as spam/not spam or cat/dog.',
        },
        {
          id: 'q2',
          question: 'Which metric is best for evaluating a model with imbalanced classes?',
          options: ['Accuracy', 'F1 Score', 'Training time', 'Number of features'],
          correctAnswer: 1,
          explanation: 'F1 Score balances precision and recall, making it more reliable than accuracy when class distribution is imbalanced.',
        },
        {
          id: 'q3',
          question: 'What does model.fit(X_train, y_train) do in scikit-learn?',
          options: ['Makes predictions on test data', 'Trains the model on training data', 'Evaluates model accuracy', 'Splits the data into train and test sets'],
          correctAnswer: 1,
          explanation: 'The fit() method trains (fits) the model by learning patterns from the training features (X_train) and labels (y_train).',
        },
        {
          id: 'q4',
          question: 'Which of the following is NOT a classification algorithm?',
          options: ['Decision Tree', 'Random Forest', 'Linear Regression', 'K-Nearest Neighbors'],
          correctAnswer: 2,
          explanation: 'Linear Regression is a regression algorithm that predicts continuous values. The others are classification algorithms.',
        },
        {
          id: 'q5',
          question: 'What does a confusion matrix show?',
          options: [
            'The training time of the model',
            'The breakdown of correct and incorrect predictions',
            'The number of features used',
            'The learning rate of the algorithm',
          ],
          correctAnswer: 1,
          explanation: 'A confusion matrix shows how many predictions were correct vs incorrect, broken down by predicted and actual classes.',
        },
      ],
      passingScore: 60,
    },
    aiConfig: {
      mode: 'adaptive' as const,
      personality: 'analytical and encouraging',
      hints: [
        'Think about the difference between classification (categories) and regression (numbers)',
        'Consider what each scikit-learn method does in the ML workflow',
      ],
      maxHints: 2,
    },
  },
];

// ========================================
// ACHIEVEMENTS for Beta
// ========================================
const ACHIEVEMENTS = [
  {
    name: 'First Steps',
    description: 'Complete your first lesson',
    category: 'learning',
    xpReward: 50,
    criteria: { type: 'count' as const, target: 1, metric: 'lessons_completed' },
    icon: 'sparkles',
  },
  {
    name: 'Quick Learner',
    description: 'Complete 10 lessons',
    category: 'learning',
    xpReward: 200,
    criteria: { type: 'count' as const, target: 10, metric: 'lessons_completed' },
    icon: 'zap',
  },
  {
    name: 'On Fire',
    description: 'Maintain a 7-day learning streak',
    category: 'streak',
    xpReward: 300,
    criteria: { type: 'streak' as const, target: 7 },
    icon: 'flame',
  },
  {
    name: 'Dedicated',
    description: 'Maintain a 30-day learning streak',
    category: 'streak',
    xpReward: 1000,
    criteria: { type: 'streak' as const, target: 30 },
    icon: 'flame',
  },
  {
    name: 'Python Beginner',
    description: 'Complete the Python Fundamentals track',
    category: 'mastery',
    xpReward: 500,
    criteria: { type: 'custom' as const, target: 1, conditions: { track: 'python-fundamentals' } },
    icon: 'trophy',
  },
  {
    name: 'Data Explorer',
    description: 'Complete the Data Analysis track',
    category: 'mastery',
    xpReward: 750,
    criteria: { type: 'custom' as const, target: 1, conditions: { track: 'data-analysis-python' } },
    icon: 'brain',
  },
  {
    name: 'Perfect Score',
    description: 'Score 100% on any quiz',
    category: 'special',
    xpReward: 150,
    criteria: { type: 'score' as const, target: 100 },
    icon: 'star',
  },
  {
    name: 'Code Reviewer',
    description: 'Get your code reviewed 5 times',
    category: 'special',
    xpReward: 200,
    criteria: { type: 'count' as const, target: 5, metric: 'code_reviews' },
    icon: 'code',
  },
  {
    name: 'Beta Pioneer',
    description: 'Join during the beta launch period',
    category: 'special',
    xpReward: 500,
    criteria: { type: 'custom' as const, target: 1, conditions: { beta_user: true } },
    icon: 'rocket',
  },
];

// ========================================
// SEED FUNCTION
// ========================================
async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Seed Domains
    console.log('📁 Seeding domains...');
    const domainRecords = await db
      .insert(domains)
      .values(DOMAINS)
      .onConflictDoUpdate({
        target: domains.slug,
        set: { name: domains.name, description: domains.description },
      })
      .returning();
    console.log(`  ✓ ${domainRecords.length} domains`);

    // Create domain ID map
    const domainMap = new Map(domainRecords.map((d) => [d.slug, d.id]));

    // Seed Tracks
    console.log('📚 Seeding tracks...');
    const trackData = TRACKS.map((t) => ({
      ...t,
      domainId: domainMap.get(t.domainSlug)!,
    }));
    const trackRecords = await db
      .insert(tracks)
      .values(trackData.map(({ domainSlug, ...rest }) => rest))
      .onConflictDoUpdate({
        target: tracks.slug,
        set: { name: tracks.name, description: tracks.description },
      })
      .returning();
    console.log(`  ✓ ${trackRecords.length} tracks`);

    // Create track ID map
    const trackMap = new Map(trackRecords.map((t) => [t.slug, t.id]));

    // Seed Courses
    console.log('📖 Seeding courses...');
    const courseData = COURSES.map((c) => ({
      ...c,
      trackId: trackMap.get(c.trackSlug)!,
    }));
    const courseRecords = await db
      .insert(courses)
      .values(courseData.map(({ trackSlug, ...rest }) => rest))
      .onConflictDoUpdate({
        target: courses.slug,
        set: { name: courses.name, description: courses.description },
      })
      .returning();
    console.log(`  ✓ ${courseRecords.length} courses`);

    // Create course ID map
    const courseMap = new Map(courseRecords.map((c) => [c.slug, c.id]));

    // Seed Modules
    console.log('📝 Seeding modules...');
    const moduleData = MODULES.map((m) => ({
      ...m,
      courseId: courseMap.get(m.courseSlug)!,
    }));
    const moduleRecords = await db
      .insert(modules)
      .values(moduleData.map(({ courseSlug, ...rest }) => rest))
      .returning();
    console.log(`  ✓ ${moduleRecords.length} modules`);

    // Create module ID map (using composite key)
    const moduleMap = new Map(
      moduleRecords.map((m, i) => [
        `${MODULES[i].name.toLowerCase().replace(/\s+/g, '-')}-${MODULES[i].courseSlug}`,
        m.id,
      ])
    );

    // Seed Lessons
    console.log('📄 Seeding lessons...');
    const lessonData = LESSONS.map((l) => ({
      ...l,
      moduleId: moduleMap.get(l.moduleSlug)!,
    }));
    const lessonRecords = await db
      .insert(lessons)
      .values(lessonData.map(({ moduleSlug, ...rest }) => rest))
      .returning();
    console.log(`  ✓ ${lessonRecords.length} lessons`);

    // Seed Achievements
    console.log('🏆 Seeding achievements...');
    const achievementRecords = await db
      .insert(achievements)
      .values(
        ACHIEVEMENTS.map((a) => ({
          ...a,
          criteria: a.criteria,
        }))
      )
      .returning();
    console.log(`  ✓ ${achievementRecords.length} achievements`);

    console.log('\n✅ Seed complete!');
    console.log(`
Summary:
- ${domainRecords.length} domains
- ${trackRecords.length} tracks
- ${courseRecords.length} courses
- ${moduleRecords.length} modules
- ${lessonRecords.length} lessons
- ${achievementRecords.length} achievements
    `);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
