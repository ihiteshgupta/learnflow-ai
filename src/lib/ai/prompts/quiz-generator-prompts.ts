export const QUIZ_GENERATOR_SYSTEM_PROMPT = `You are a quiz generation specialist for the Dronacharya learning platform. Your role is to create engaging, educational quizzes that assess understanding while promoting learning.

## Student Level: {level}
## Topic: {topic}
## Learning Objectives: {objectives}

## Quiz Generation Principles:
1. **Bloom's Taxonomy**: Progress from remember → understand → apply → analyze
2. **Adaptive Difficulty**: Match student level and past performance
3. **Educational Value**: Every question teaches, even when wrong
4. **Variety**: Mix question types to assess different skills

## Course Content Context:
{ragContext}`;

export const GENERATE_QUIZ_PROMPT = `Generate a complete quiz based on this content:

Topic: {topic}
Course Content: {content}
Student Level: {level}
Previous Quiz Score: {previousScore}
Question Count: {questionCount}
Focus Areas: {focusAreas}

Create a quiz with varied question types that test understanding of the material.

Respond with JSON:
{{
  "title": "Quiz title",
  "description": "Brief description",
  "estimatedMinutes": 10,
  "questions": [
    {{
      "id": "q1",
      "type": "multiple_choice|code_output|fill_blank|true_false|short_answer",
      "difficulty": 1-10,
      "question": "The question text",
      "codeSnippet": "Optional code to display with question",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "The correct answer or option letter",
      "explanation": "Why this is correct and why others are wrong",
      "hint": "A helpful hint without giving away the answer",
      "points": 10,
      "bloomLevel": "remember|understand|apply|analyze",
      "conceptsTested": ["concept1", "concept2"]
    }}
  ],
  "passingScore": 70,
  "totalPoints": 100
}}`;

export const ADAPTIVE_QUESTION_PROMPT = `Generate an adaptive follow-up question based on student performance:

Previous Question: {previousQuestion}
Student Answer: {studentAnswer}
Was Correct: {wasCorrect}
Student Level: {level}
Concepts Being Tested: {concepts}

If correct: Generate a slightly harder question on the same or related concept.
If incorrect: Generate an easier question that reinforces the fundamental concept.

Respond with JSON:
{{
  "question": {{
    "type": "multiple_choice|code_output|fill_blank|true_false|short_answer",
    "difficulty": 1-10,
    "question": "Question text",
    "codeSnippet": "Optional code",
    "options": ["A)", "B)", "C)", "D)"],
    "correctAnswer": "Answer",
    "explanation": "Explanation",
    "hint": "Hint",
    "points": 10,
    "conceptsTested": ["concepts"]
  }},
  "rationale": "Why this question was chosen as follow-up"
}}`;

export const ANALYZE_QUIZ_RESULTS_PROMPT = `Analyze quiz results and provide feedback:

Quiz Topic: {topic}
Questions and Answers:
{questionsWithAnswers}

Total Score: {score}/{totalPoints}
Time Taken: {timeTaken} minutes

Provide comprehensive analysis.

Respond with JSON:
{{
  "overallAssessment": "Summary of performance",
  "strengthAreas": ["Topics mastered"],
  "weakAreas": ["Topics needing work"],
  "conceptMastery": {{
    "concept1": {{ "score": 80, "status": "mastered|developing|needs_work" }}
  }},
  "recommendations": [
    {{ "type": "review|practice|advance", "topic": "Topic", "reason": "Why" }}
  ],
  "nextSteps": ["Specific actions to take"],
  "encouragement": "Motivational feedback",
  "suggestedRetakeIn": "When to retake if applicable"
}}`;

export const GENERATE_PRACTICE_SET_PROMPT = `Generate a practice question set for areas needing improvement:

Weak Areas: {weakAreas}
Student Level: {level}
Course Content: {content}

Create 5 practice questions focusing on weak areas, starting easier and building up.

Respond with JSON:
{{
  "practiceSetTitle": "Practice: Weak Area Name",
  "targetConcepts": ["concepts being practiced"],
  "questions": [
    {{
      "id": "p1",
      "type": "multiple_choice",
      "difficulty": 1-10,
      "question": "Question",
      "options": ["A)", "B)", "C)", "D)"],
      "correctAnswer": "Answer",
      "explanation": "Detailed explanation for learning",
      "hint": "Hint",
      "points": 10,
      "relatedConcept": "specific concept"
    }}
  ],
  "learningTips": ["Tips for understanding these concepts"]
}}`;
