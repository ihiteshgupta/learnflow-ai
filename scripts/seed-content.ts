import 'dotenv/config';
import { db } from '../src/lib/db';
import { domains, tracks, courses, modules, lessons, LessonContent, AIConfig } from '../src/lib/db/schema/content';

async function seedContent() {
  console.log('🌱 Seeding content...\n');

  // ==========================================
  // 1. Create Domain: Technology
  // ==========================================
  console.log('Creating domain: Technology...');
  const [domain] = await db.insert(domains).values({
    name: 'Technology',
    slug: 'technology',
    description: 'Master the fundamentals and advanced concepts of modern technology, from programming to system design.',
    icon: 'laptop',
    order: 1,
  }).returning();
  console.log(`   ✅ Domain created: ${domain.name} (${domain.id})\n`);

  // ==========================================
  // 2. Create Track: Web Development Fundamentals
  // ==========================================
  console.log('Creating track: Web Development Fundamentals...');
  const [track] = await db.insert(tracks).values({
    domainId: domain.id,
    name: 'Web Development Fundamentals',
    slug: 'web-development-fundamentals',
    description: 'Learn the core technologies that power the modern web. Start with JavaScript, then progress through HTML, CSS, and responsive design.',
    difficulty: 'beginner',
    estimatedHours: 40,
    prerequisites: [],
    skillsGained: [
      'JavaScript programming',
      'DOM manipulation',
      'Problem solving',
      'Debugging skills',
      'Code organization',
    ],
    isPublished: true,
  }).returning();
  console.log(`   ✅ Track created: ${track.name} (${track.id})\n`);

  // ==========================================
  // 3. Create Course: JavaScript Essentials
  // ==========================================
  console.log('Creating course: JavaScript Essentials...');
  const [course] = await db.insert(courses).values({
    trackId: track.id,
    name: 'JavaScript Essentials',
    slug: 'javascript-essentials',
    description: 'Build a solid foundation in JavaScript programming. Learn variables, data types, functions, and control flow through hands-on exercises.',
    order: 1,
    estimatedMinutes: 180,
    isPublished: true,
  }).returning();
  console.log(`   ✅ Course created: ${course.name} (${course.id})\n`);

  // ==========================================
  // 4. Create Module 1: Introduction to JavaScript
  // ==========================================
  console.log('Creating module 1: Introduction to JavaScript...');
  const [module1] = await db.insert(modules).values({
    courseId: course.id,
    name: 'Introduction to JavaScript',
    description: 'Discover what JavaScript is, where it runs, and write your first program.',
    order: 1,
    type: 'concept',
    estimatedMinutes: 45,
  }).returning();
  console.log(`   ✅ Module created: ${module1.name} (${module1.id})\n`);

  // ==========================================
  // 5. Create Module 2: Variables and Data Types
  // ==========================================
  console.log('Creating module 2: Variables and Data Types...');
  const [module2] = await db.insert(modules).values({
    courseId: course.id,
    name: 'Variables and Data Types',
    description: 'Learn how to store and work with different types of data in JavaScript.',
    order: 2,
    type: 'concept',
    estimatedMinutes: 60,
  }).returning();
  console.log(`   ✅ Module created: ${module2.name} (${module2.id})\n`);

  // ==========================================
  // 6. Create Lessons for Module 1
  // ==========================================
  console.log('Creating lessons for Module 1...');

  // Lesson 1.1: What is JavaScript? (Concept)
  const lesson1_1Content: LessonContent = {
    type: 'concept',
    title: 'What is JavaScript?',
    objectives: [
      'Understand what JavaScript is and its history',
      'Know where JavaScript runs (browser, server, mobile)',
      'Recognize the difference between JavaScript and Java',
    ],
    steps: [
      {
        id: 'intro',
        type: 'text',
        content: `# What is JavaScript?

JavaScript is one of the most popular programming languages in the world. Originally created in 1995 by Brendan Eich at Netscape in just **10 days**, it has evolved into a powerful, versatile language.

## Where JavaScript Runs

JavaScript was initially designed to run only in web browsers, but today it runs almost everywhere:

- **Browsers**: Chrome, Firefox, Safari, Edge
- **Servers**: Node.js, Deno, Bun
- **Mobile Apps**: React Native, Ionic
- **Desktop Apps**: Electron
- **IoT Devices**: Johnny-Five, Espruino

## JavaScript vs Java

Despite the similar names, JavaScript and Java are completely different languages:

| Feature | JavaScript | Java |
|---------|------------|------|
| Typing | Dynamic | Static |
| Execution | Interpreted | Compiled |
| Syntax | C-like, flexible | C-like, strict |
| Primary Use | Web, full-stack | Enterprise, Android |

The naming similarity was actually a marketing decision in the 1990s when Java was very popular.`,
      },
      {
        id: 'key-points',
        type: 'text',
        content: `## Key Takeaways

1. **JavaScript is everywhere** - It's the language of the web and beyond
2. **Easy to start** - You can run JavaScript in any browser right now
3. **Constantly evolving** - New features are added every year (ECMAScript)
4. **Not Java** - Despite the name, they're completely different languages`,
      },
    ],
  };

  const lesson1_1Config: AIConfig = {
    mode: 'socratic',
    personality: 'encouraging and curious',
    hints: [
      'Think about what websites you use daily that rely on JavaScript',
      'Consider how JavaScript enables interactivity on web pages',
    ],
    maxHints: 3,
  };

  const [lesson1_1] = await db.insert(lessons).values({
    moduleId: module1.id,
    name: 'What is JavaScript?',
    type: 'concept',
    order: 1,
    contentJson: lesson1_1Content,
    aiConfig: lesson1_1Config,
    estimatedMinutes: 10,
  }).returning();
  console.log(`   ✅ Lesson created: ${lesson1_1.name}`);

  // Lesson 1.2: Your First JavaScript Program (Code)
  const lesson1_2Content: LessonContent = {
    type: 'code',
    title: 'Your First JavaScript Program',
    objectives: [
      'Write and run your first JavaScript code',
      'Use console.log() to output messages',
      'Understand basic JavaScript syntax',
    ],
    code: {
      language: 'javascript',
      initialCode: `// Welcome to JavaScript!
// Your task: Print "Hello, World!" to the console

// Write your code below:

`,
      testCases: [
        {
          input: '',
          expected: 'Hello, World!',
          hidden: false,
        },
      ],
    },
    steps: [
      {
        id: 'instructions',
        type: 'text',
        content: `# Your First JavaScript Program

Every programmer's journey begins with "Hello, World!" - let's write yours!

## The console.log() Function

In JavaScript, we use \`console.log()\` to print messages. It's incredibly useful for:
- Debugging your code
- Displaying output
- Understanding how your program runs

## Syntax

\`\`\`javascript
console.log("Your message here");
\`\`\`

Note the:
- Parentheses \`()\` around the message
- Quotes \`""\` around the text
- Semicolon \`;\` at the end (optional but recommended)

## Your Task

Write a statement that prints \`Hello, World!\` to the console.`,
      },
    ],
  };

  const lesson1_2Config: AIConfig = {
    mode: 'scaffolded',
    personality: 'supportive and patient',
    hints: [
      'Start by typing console.log()',
      'Put your message inside the parentheses',
      'Make sure to wrap the text in quotes: "Hello, World!"',
    ],
    maxHints: 3,
  };

  const [lesson1_2] = await db.insert(lessons).values({
    moduleId: module1.id,
    name: 'Your First JavaScript Program',
    type: 'code',
    order: 2,
    contentJson: lesson1_2Content,
    aiConfig: lesson1_2Config,
    estimatedMinutes: 15,
  }).returning();
  console.log(`   ✅ Lesson created: ${lesson1_2.name}\n`);

  // ==========================================
  // 7. Create Lessons for Module 2
  // ==========================================
  console.log('Creating lessons for Module 2...');

  // Lesson 2.1: Understanding Variables (Concept)
  const lesson2_1Content: LessonContent = {
    type: 'concept',
    title: 'Understanding Variables',
    objectives: [
      'Understand what variables are and why we need them',
      'Learn the three ways to declare variables: let, const, and var',
      'Know when to use each type of declaration',
    ],
    steps: [
      {
        id: 'what-are-variables',
        type: 'text',
        content: `# Understanding Variables

Variables are like labeled containers that store data in your program. Just like you might label a box "Books" or "Photos", variables have names that describe what they hold.

## Why Do We Need Variables?

Without variables, we'd have to hard-code every value:

\`\`\`javascript
// Without variables - repetitive and hard to maintain
console.log(3.14159 * 5 * 5);  // Area of circle with radius 5
console.log(3.14159 * 10 * 10); // Area of circle with radius 10

// With variables - clean and reusable
const pi = 3.14159;
let radius = 5;
console.log(pi * radius * radius);
radius = 10;
console.log(pi * radius * radius);
\`\`\``,
      },
      {
        id: 'declaring-variables',
        type: 'text',
        content: `## Three Ways to Declare Variables

JavaScript provides three keywords for creating variables:

### 1. \`let\` - For values that change
\`\`\`javascript
let score = 0;
score = 10;  // ✅ Can be reassigned
score = 20;  // ✅ Can be reassigned again
\`\`\`

### 2. \`const\` - For values that stay constant
\`\`\`javascript
const PI = 3.14159;
PI = 3;  // ❌ Error! Cannot reassign a const
\`\`\`

### 3. \`var\` - The old way (avoid in modern code)
\`\`\`javascript
var oldStyle = "legacy";
var oldStyle = "redeclared";  // ⚠️ Allowed but confusing
\`\`\`

## Best Practices

1. **Use \`const\` by default** - It prevents accidental reassignment
2. **Use \`let\` when you need to reassign** - For counters, accumulators, etc.
3. **Avoid \`var\`** - It has confusing scoping rules`,
      },
      {
        id: 'naming-rules',
        type: 'text',
        content: `## Variable Naming Rules

### Must Follow:
- Start with a letter, underscore (_), or dollar sign ($)
- Can contain letters, numbers, underscores, dollar signs
- Cannot use reserved words (let, const, function, etc.)
- Are case-sensitive (\`name\` ≠ \`Name\`)

### Naming Conventions:
\`\`\`javascript
// ✅ Good - camelCase for variables
let userName = "Alice";
let totalPrice = 99.99;
let isLoggedIn = true;

// ✅ Good - UPPER_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = "https://api.example.com";

// ❌ Bad - unclear or misleading names
let x = "Alice";        // What is x?
let data = 99.99;       // What kind of data?
let flag = true;        // What does this flag mean?
\`\`\``,
      },
    ],
  };

  const lesson2_1Config: AIConfig = {
    mode: 'adaptive',
    personality: 'clear and methodical',
    hints: [
      'Think of variables as labeled boxes that hold values',
      'const means the box label is permanent, let means you can change whats inside',
      'Choose descriptive names that explain what the variable stores',
    ],
    maxHints: 3,
  };

  const [lesson2_1] = await db.insert(lessons).values({
    moduleId: module2.id,
    name: 'Understanding Variables',
    type: 'concept',
    order: 1,
    contentJson: lesson2_1Content,
    aiConfig: lesson2_1Config,
    estimatedMinutes: 15,
  }).returning();
  console.log(`   ✅ Lesson created: ${lesson2_1.name}`);

  // Lesson 2.2: Data Types Quiz (Quiz)
  const lesson2_2Content: LessonContent = {
    type: 'quiz',
    title: 'Data Types Quiz',
    objectives: [
      'Identify JavaScript primitive data types',
      'Understand the difference between data types',
      'Choose the correct data type for different scenarios',
    ],
    steps: [
      {
        id: 'q1',
        type: 'question',
        content: 'Which keyword should you use to declare a variable that will never be reassigned?',
        options: ['A) let', 'B) const', 'C) var', 'D) static'],
        correctAnswer: 'B) const',
      },
      {
        id: 'q2',
        type: 'question',
        content: 'What data type is the value `42` in JavaScript?',
        options: ['A) String', 'B) Integer', 'C) Number', 'D) Float'],
        correctAnswer: 'C) Number',
      },
      {
        id: 'q3',
        type: 'question',
        content: 'Which of the following is a valid variable name in JavaScript?',
        options: ['A) 2fast2furious', 'B) my-variable', 'C) _privateVar', 'D) class'],
        correctAnswer: 'C) _privateVar',
      },
      {
        id: 'q4',
        type: 'question',
        content: 'What is the result of `typeof null` in JavaScript?',
        options: ['A) "null"', 'B) "undefined"', 'C) "object"', 'D) "none"'],
        correctAnswer: 'C) "object"',
      },
      {
        id: 'q5',
        type: 'question',
        content: 'Which statement about `let` vs `var` is TRUE?',
        options: [
          'A) let is function-scoped, var is block-scoped',
          'B) let is block-scoped, var is function-scoped',
          'C) Both are block-scoped',
          'D) Both are function-scoped',
        ],
        correctAnswer: 'B) let is block-scoped, var is function-scoped',
      },
    ],
  };

  const lesson2_2Config: AIConfig = {
    mode: 'adaptive',
    personality: 'encouraging and educational',
    hints: [
      'Think about which keyword prevents reassignment',
      'JavaScript has only one numeric type for all numbers',
      'Variable names cannot start with numbers or contain hyphens',
    ],
    maxHints: 2,
  };

  const [lesson2_2] = await db.insert(lessons).values({
    moduleId: module2.id,
    name: 'Data Types Quiz',
    type: 'quiz',
    order: 2,
    contentJson: lesson2_2Content,
    aiConfig: lesson2_2Config,
    estimatedMinutes: 10,
  }).returning();
  console.log(`   ✅ Lesson created: ${lesson2_2.name}\n`);

  // ==========================================
  // Summary
  // ==========================================
  console.log('═══════════════════════════════════════════════');
  console.log('✅ Seeding complete!');
  console.log('═══════════════════════════════════════════════');
  console.log('\nCreated:');
  console.log(`  • 1 Domain: ${domain.name}`);
  console.log(`  • 1 Track: ${track.name}`);
  console.log(`  • 1 Course: ${course.name}`);
  console.log(`  • 2 Modules: ${module1.name}, ${module2.name}`);
  console.log(`  • 4 Lessons across both modules`);
  console.log('\nYou can now explore the content in the application!');
}

seedContent()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
