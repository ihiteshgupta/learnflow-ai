export const PROJECT_GUIDE_SYSTEM_PROMPT = `You are a project guide for Gold certification projects on the Dronacharya platform. Your role is to help students build production-quality portfolio projects.

## Student Level: {level}
## Project: {projectName}
## Current Milestone: {milestone}

## Project Requirements:
{requirements}

## Your Role:
1. **Architecture Guidance**: Help with project structure and design decisions
2. **Milestone Tracking**: Break work into achievable milestones
3. **Code Review**: Review submissions without giving full solutions
4. **Best Practices**: Enforce production-quality standards
5. **Debugging Help**: Guide through issues without solving them

## Evaluation Criteria:
- Code Quality (25%): Clean code, proper structure
- Functionality (30%): All features working
- Testing (20%): Unit and integration tests, 70%+ coverage
- Documentation (15%): README, API docs
- Deployment (10%): Live URL, CI/CD

## Guidelines:
- Provide hints, not solutions
- Ask clarifying questions about approach
- Suggest improvements incrementally
- Celebrate milestone completions
- Keep student on track with timeline

## Context:
{ragContext}`;

export const PROJECT_PLAN_PROMPT = `Create a detailed project plan for:
Project: {projectName}
Description: {description}
Student Level: {level}
Time Available: {timeAvailable}

Generate a comprehensive project plan with milestones and tasks.

Respond with JSON:
{{
  "overview": "Brief project description",
  "techStack": ["Recommended technologies"],
  "milestones": [
    {{
      "name": "Milestone 1: Setup",
      "description": "What will be accomplished",
      "estimatedDays": 3,
      "tasks": [
        {{ "name": "Task name", "description": "What to do", "skills": ["skills used"] }}
      ],
      "deliverables": ["What to submit"],
      "checkpoints": ["How progress is verified"]
    }}
  ],
  "evaluationCriteria": {{
    "codeQuality": "What makes good code quality",
    "functionality": "Required features",
    "testing": "Testing requirements",
    "documentation": "Documentation requirements",
    "deployment": "Deployment requirements"
  }},
  "resources": ["Helpful links/docs"],
  "tips": ["Advice for success"]
}}`;

export const ARCHITECTURE_REVIEW_PROMPT = `Review this project architecture:
Project: {projectName}
Tech Stack: {techStack}

Architecture Description:
{architecture}

File Structure:
{fileStructure}

Evaluate the architecture and provide guidance.

Respond with JSON:
{{
  "score": 75,
  "strengths": ["What's good about this architecture"],
  "concerns": ["Potential issues to consider"],
  "questions": ["Clarifying questions about design decisions"],
  "suggestions": ["Improvements to explore"],
  "patterns": ["Design patterns that could help"],
  "scalabilityNotes": "How this would scale",
  "maintainabilityNotes": "How maintainable this is"
}}`;

export const MILESTONE_REVIEW_PROMPT = `Review milestone submission:
Project: {projectName}
Milestone: {milestoneName}
Requirements: {requirements}

Submitted Code/Description:
{submission}

Evaluate the milestone completion.

Respond with JSON:
{{
  "status": "approved|needs_work|in_progress",
  "completionPercentage": 80,
  "feedback": {{
    "completed": ["What's done well"],
    "missing": ["What's still needed"],
    "improvements": ["Optional improvements"]
  }},
  "nextSteps": ["What to do next"],
  "encouragement": "Motivational feedback"
}}`;

export const DEBUGGING_GUIDE_PROMPT = `Help debug this issue without giving the solution:
Project: {projectName}
Error/Issue: {errorDescription}

Code Context:
{codeContext}

What the student has tried:
{attemptedSolutions}

Guide the student through debugging.

Respond with JSON:
{{
  "problemAnalysis": "Understanding of the issue",
  "investigationQuestions": ["Questions to help student discover the problem"],
  "debuggingSteps": ["Steps to investigate"],
  "hints": ["Subtle hints that guide without revealing"],
  "conceptsToReview": ["Related concepts that might help"],
  "commonMistakes": ["Common mistakes in this area"]
}}`;

export const DEPLOYMENT_GUIDE_PROMPT = `Create deployment guidance:
Project: {projectName}
Tech Stack: {techStack}
Target Platform: {platform}

Current Status:
{currentStatus}

Provide deployment guidance.

Respond with JSON:
{{
  "checklist": [
    {{ "item": "Task name", "description": "What to do", "priority": "required|recommended|optional" }}
  ],
  "environmentVariables": ["ENV vars needed (without values)"],
  "cicdSuggestions": ["CI/CD pipeline recommendations"],
  "securityChecklist": ["Security items to verify"],
  "monitoringSuggestions": ["What to monitor"],
  "commonIssues": ["Issues to watch for"],
  "resources": ["Helpful deployment guides"]
}}`;
