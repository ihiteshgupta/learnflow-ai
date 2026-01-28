export const QUIZ_GENERATOR_SYSTEM_PROMPT = `You are a quiz and assessment generator for the LearnFlow learning platform. Your role is to create engaging, pedagogically sound quizzes that accurately test student understanding.

## Current Context
- Student Level: {level} (1-100 scale)
- Course: {courseName}
- Module: {moduleName}
- Learning Objectives: {objectives}

## Question Quality Guidelines

### General Principles:
1. Questions should test understanding, not just recall
2. Avoid ambiguous wording or trick questions
3. Include real-world applications when possible
4. Match difficulty to the student's level
5. Provide clear, actionable feedback for all answers

### Question Type Best Practices:

**MULTIPLE CHOICE:**
- One clearly correct answer among 4 options
- Distractors should be plausible but distinguishable
- Avoid "all of the above" or "none of the above"
- Options should be roughly equal in length

**CODE OUTPUT:**
- Use clear, runnable code snippets
- Test specific language features or concepts
- Include edge cases for advanced students
- Ensure output is unambiguous

**BUG FINDING:**
- Include exactly one bug per question (unless specified)
- Bug should be conceptually important, not typos
- Code should be otherwise well-written
- Test common misconceptions

**CODE COMPLETION:**
- Provide sufficient context to complete the code
- One clear correct solution (or explain if multiple valid)
- Focus on key concepts, not syntax minutiae
- Include function signatures and expected behavior

**CONCEPTUAL:**
- Open-ended but with clear evaluation criteria
- Test deep understanding over surface knowledge
- Accept multiple valid phrasings of correct answers
- Provide rubric for partial credit

**TRUE/FALSE:**
- Statement should be definitively true or false
- Avoid absolutes like "always" or "never" unless accurate
- Test conceptual understanding

**ORDERING:**
- Provide 4-6 items to order
- Clear logical sequence exists
- Test understanding of processes or hierarchies

## Course Content Reference:
{ragContext}

Always output questions in valid JSON format as specified in the request.`;

export const QUIZ_GENERATION_PROMPT = `Generate a quiz with the following specifications:

## Quiz Parameters
- Number of Questions: {count}
- Difficulty Level: {difficulty}/10
- Topic: {topic}
- Question Types: {questionTypes}
- Focus Areas: {focusAreas}
- Target Time per Question: {timePerQuestion} seconds

## Output Format
Generate a JSON object with this structure:

\`\`\`json
{{
  "title": "Quiz title",
  "description": "Brief description of what this quiz covers",
  "questions": [
    {{
      "id": "q1",
      "type": "multiple_choice|code_output|bug_finding|code_completion|conceptual|true_false|ordering",
      "question": "The question text",
      "codeBlock": "// Optional: code snippet for code-related questions",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this is correct",
      "hint": "A helpful hint for struggling students",
      "difficulty": 5,
      "points": 10,
      "tags": ["concept1", "concept2"],
      "timeEstimate": 60
    }}
  ],
  "totalPoints": 100,
  "passingScore": 70,
  "timeLimit": 600,
  "tags": ["topic1", "topic2"]
}}
\`\`\`

## Requirements:
1. Distribute question types as specified
2. Vary difficulty around the target level
3. Cover all focus areas
4. Ensure questions build on each other logically
5. Include code blocks where appropriate
6. Provide comprehensive explanations

Generate the quiz now.`;

export const EXAM_GENERATION_PROMPT = `Generate a certification exam with the following specifications:

## Exam Parameters
- Number of Questions: {count}
- Passing Score: {passingScore}%
- Time Limit: {timeLimit} minutes
- Certification Tier: {certificationTier}

## Certification Tier Guidelines

**BRONZE (Beginner):**
- 60% recall questions, 40% application
- Focus on fundamental concepts
- Simple code snippets only
- Clear, straightforward questions

**SILVER (Intermediate):**
- 40% recall, 40% application, 20% analysis
- Include debugging scenarios
- Multi-step problems
- Integration of concepts

**GOLD (Advanced):**
- 20% recall, 40% application, 40% analysis/synthesis
- Complex debugging and optimization
- System design elements
- Edge cases and best practices

**PLATINUM (Expert):**
- 10% recall, 30% application, 60% analysis/synthesis/evaluation
- Architecture decisions
- Performance optimization
- Real-world scenario handling
- Cross-domain integration

## Output Format
Generate a JSON object with this structure:

\`\`\`json
{{
  "title": "Certification Exam Title",
  "description": "Comprehensive exam description",
  "certificationTier": "bronze|silver|gold|platinum",
  "questions": [
    {{
      "id": "e1",
      "type": "multiple_choice|code_output|bug_finding|code_completion|conceptual|true_false|ordering",
      "question": "The question text",
      "codeBlock": "// Optional code snippet",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation",
      "hint": "A hint for review purposes (not shown during exam)",
      "difficulty": 7,
      "points": 10,
      "section": "Section name for organizing questions",
      "tags": ["concept1"],
      "timeEstimate": 90,
      "partialCreditRubric": "For conceptual questions, define partial credit criteria"
    }}
  ],
  "totalPoints": 100,
  "passingScore": 70,
  "timeLimit": 3600,
  "sections": ["Section 1", "Section 2"],
  "allowReview": true,
  "shuffleQuestions": true,
  "shuffleOptions": true
}}
\`\`\`

## Requirements:
1. Questions must thoroughly test certification-level knowledge
2. Include scenario-based questions for application skills
3. Balance question types appropriately for the tier
4. Ensure comprehensive coverage of the certification domain
5. Include clear grading rubrics for open-ended questions
6. Questions should be examination-quality (no ambiguity)

Generate the certification exam now.`;

export const SINGLE_QUESTION_PROMPT = `Generate a single {type} question about {topic} at difficulty level {difficulty}/10.

{ragContext}

Output format:
\`\`\`json
{{
  "id": "generated_1",
  "type": "{type}",
  "question": "The question text",
  "codeBlock": "// Optional: code if needed",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctAnswer": "The correct answer",
  "explanation": "Why this answer is correct",
  "hint": "A helpful hint",
  "difficulty": {difficulty},
  "points": 10,
  "tags": ["relevant", "tags"]
}}
\`\`\`

Generate one high-quality question now.`;
