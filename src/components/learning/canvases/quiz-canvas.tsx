'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'code_output' | 'true_false';
  question: string;
  code?: string;           // Code snippet for code_output questions
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

interface QuizCanvasProps {
  questions: QuizQuestion[];
  passingScore: number;     // e.g., 70 means 70%
  onComplete: (score: number, passed: boolean) => void;
}

interface QuestionResult {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export function QuizCanvas({
  questions,
  passingScore,
  onComplete,
}: QuizCanvasProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const scorePercentage = questions.length > 0
    ? Math.round((correctCount / questions.length) * 100)
    : 0;
  const passed = scorePercentage >= passingScore;

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const result: QuestionResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
    };

    setResults((prev) => [...prev, result]);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer('');
      setShowHint(false);
      setIsAnswered(false);
    } else {
      // Quiz complete
      const finalCorrectCount = results.filter((r) => r.isCorrect).length +
        (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
      const finalScore = Math.round((finalCorrectCount / questions.length) * 100);
      const finalPassed = finalScore >= passingScore;

      setIsQuizComplete(true);
      onComplete(finalScore, finalPassed);
    }
  };

  const getOptionClassName = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option
        ? 'border-primary bg-primary/5'
        : 'border-border hover:border-primary/50';
    }

    const isCorrectAnswer = option === currentQuestion.correctAnswer;
    const isSelectedAnswer = option === selectedAnswer;

    if (isCorrectAnswer) {
      return 'border-green-500 bg-green-500/10';
    }
    if (isSelectedAnswer && !isCorrectAnswer) {
      return 'border-red-500 bg-red-500/10';
    }
    return 'border-border opacity-50';
  };

  // Results screen
  if (isQuizComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}

            <h2 className="text-2xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>

            <p className="text-muted-foreground">
              {passed
                ? 'You passed the quiz! Great job understanding the material.'
                : 'You did not reach the passing score this time. Review the material and try again.'}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Your Score</span>
              <span className={cn(
                'text-2xl font-bold',
                passed ? 'text-green-500' : 'text-red-500'
              )}>
                {scorePercentage}%
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Correct Answers</span>
              <span className="text-lg font-semibold">
                {correctCount}/{questions.length}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Passing Score</span>
              <span className="text-lg font-semibold">{passingScore}%</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {passed
              ? 'You have demonstrated a solid understanding of this topic. Continue to the next lesson!'
              : 'Do not be discouraged! Learning takes time. Review the explanations and give it another try.'}
          </p>
        </Card>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">
            Score: {correctCount}/{currentQuestionIndex + (isAnswered ? 1 : 0)} correct
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Question Type Badge */}
          <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary mb-4">
            {currentQuestion.type === 'multiple_choice' && 'Multiple Choice'}
            {currentQuestion.type === 'code_output' && 'Code Output'}
            {currentQuestion.type === 'true_false' && 'True / False'}
          </span>

          {/* Question */}
          <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>

          {/* Code Snippet (if applicable) */}
          {currentQuestion.code && (
            <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
              <code className="text-sm font-mono">{currentQuestion.code}</code>
            </pre>
          )}

          {/* Options */}
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer',
                  getOptionClassName(option),
                  isAnswered && 'cursor-default'
                )}
                onClick={() => !isAnswered && setSelectedAnswer(option)}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className={cn(
                    'flex-1 cursor-pointer',
                    isAnswered && 'cursor-default'
                  )}
                >
                  {option}
                </Label>
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                )}
                {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
            ))}
          </RadioGroup>

          {/* Hint */}
          {currentQuestion.hint && !isAnswered && (
            <div className="mt-6">
              {showHint ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {currentQuestion.hint}
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Show Hint
                </Button>
              )}
            </div>
          )}

          {/* Explanation (shown after answering) */}
          {isAnswered && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Explanation</h3>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4 flex justify-end gap-3">
        {!isAnswered ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
          </Button>
        )}
      </div>
    </div>
  );
}
