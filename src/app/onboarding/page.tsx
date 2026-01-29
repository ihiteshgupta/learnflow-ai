'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Target,
  Calendar,
  Brain,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Loader2,
  GraduationCap,
  Briefcase,
  Code,
  BarChart3,
  Clock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'role', title: 'Your Role', icon: User },
  { id: 'experience', title: 'Experience', icon: BarChart3 },
  { id: 'goals', title: 'Goals', icon: Target },
  { id: 'schedule', title: 'Schedule', icon: Calendar },
  { id: 'style', title: 'Learning Style', icon: Brain },
  { id: 'start', title: 'Get Started', icon: Rocket },
];

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, description: 'Learning for school or personal growth' },
  { id: 'professional', label: 'Professional', icon: Briefcase, description: 'Upskilling for my career' },
  { id: 'developer', label: 'Developer', icon: Code, description: 'Expanding my technical skills' },
  { id: 'career-changer', label: 'Career Changer', icon: Rocket, description: 'Transitioning to a new field' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Solid foundation' },
  { id: 'expert', label: 'Expert', description: 'Deep expertise' },
];

const GOALS = [
  { id: 'career', label: 'Career Advancement', description: 'Get promoted or find a better job' },
  { id: 'skills', label: 'Skill Development', description: 'Master new technologies' },
  { id: 'certification', label: 'Get Certified', description: 'Earn industry certifications' },
  { id: 'project', label: 'Build Projects', description: 'Create real-world applications' },
];

const SCHEDULES = [
  { id: 'casual', label: '15-30 min/day', icon: Clock, description: 'Light commitment' },
  { id: 'regular', label: '30-60 min/day', icon: Clock, description: 'Steady progress' },
  { id: 'intensive', label: '1-2 hours/day', icon: Zap, description: 'Fast track learning' },
  { id: 'flexible', label: 'Flexible', icon: Calendar, description: 'Learn at my own pace' },
];

const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual', description: 'Diagrams, videos, and animations' },
  { id: 'reading', label: 'Reading/Writing', description: 'Text-based content and notes' },
  { id: 'kinesthetic', label: 'Hands-on', description: 'Practice and coding exercises' },
  { id: 'auditory', label: 'Auditory', description: 'Explanations and discussions' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    role: '',
    experience: '',
    goals: [] as string[],
    schedule: '',
    style: '',
  });

  const updateOnboardingMutation = trpc.user.updateLearningPreferences.useMutation({
    onSuccess: () => {
      toast({ title: 'Welcome to Dronacharya!', description: 'Your learning path is ready.' });
      router.push('/');
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleSelect = (field: keyof typeof selections, value: string) => {
    if (field === 'goals') {
      const currentGoals = selections.goals;
      const newGoals = currentGoals.includes(value)
        ? currentGoals.filter(g => g !== value)
        : [...currentGoals, value];
      setSelections({ ...selections, goals: newGoals });
    } else {
      setSelections({ ...selections, [field]: value });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selections.role !== '';
      case 1: return selections.experience !== '';
      case 2: return selections.goals.length > 0;
      case 3: return selections.schedule !== '';
      case 4: return selections.style !== '';
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    updateOnboardingMutation.mutate({
      learningStyle: selections.style as 'visual' | 'auditory' | 'kinesthetic' | 'reading',
      studyPreferences: {
        interests: selections.goals,
        sessionDuration: selections.schedule === 'casual' ? 15 : selections.schedule === 'regular' ? 45 : selections.schedule === 'intensive' ? 90 : 30,
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelect('role', role.id)}
                  className={cn(
                    'p-6 rounded-xl border-2 text-left transition-all hover:border-primary/50',
                    selections.role === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <Icon className="h-8 w-8 mb-3 text-primary" />
                  <h3 className="font-semibold">{role.label}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </button>
              );
            })}
          </div>
        );

      case 1:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => handleSelect('experience', level.id)}
                className={cn(
                  'p-6 rounded-xl border-2 text-left transition-all hover:border-primary/50',
                  selections.experience === level.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                <h3 className="font-semibold">{level.label}</h3>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleSelect('goals', goal.id)}
                className={cn(
                  'p-6 rounded-xl border-2 text-left transition-all hover:border-primary/50',
                  selections.goals.includes(goal.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                <h3 className="font-semibold">{goal.label}</h3>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </button>
            ))}
            <p className="col-span-full text-sm text-muted-foreground text-center">
              Select all that apply
            </p>
          </div>
        );

      case 3:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {SCHEDULES.map((schedule) => {
              const Icon = schedule.icon;
              return (
                <button
                  key={schedule.id}
                  onClick={() => handleSelect('schedule', schedule.id)}
                  className={cn(
                    'p-6 rounded-xl border-2 text-left transition-all hover:border-primary/50',
                    selections.schedule === schedule.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <Icon className="h-6 w-6 mb-2 text-primary" />
                  <h3 className="font-semibold">{schedule.label}</h3>
                  <p className="text-sm text-muted-foreground">{schedule.description}</p>
                </button>
              );
            })}
          </div>
        );

      case 4:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {LEARNING_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleSelect('style', style.id)}
                className={cn(
                  'p-6 rounded-xl border-2 text-left transition-all hover:border-primary/50',
                  selections.style === style.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                <h3 className="font-semibold">{style.label}</h3>
                <p className="text-sm text-muted-foreground">{style.description}</p>
              </button>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto mb-6">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              You&apos;re all set, {session?.user?.name?.split(' ')[0] || 'Learner'}!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Based on your preferences, we&apos;ve personalized your learning experience.
              Ready to start your journey?
            </p>
            <div className="bg-muted/50 rounded-xl p-6 max-w-sm mx-auto text-left">
              <h4 className="font-semibold mb-3">Your Profile:</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-muted-foreground">Role:</span> {ROLES.find(r => r.id === selections.role)?.label}</li>
                <li><span className="text-muted-foreground">Experience:</span> {EXPERIENCE_LEVELS.find(e => e.id === selections.experience)?.label}</li>
                <li><span className="text-muted-foreground">Schedule:</span> {SCHEDULES.find(s => s.id === selections.schedule)?.label}</li>
                <li><span className="text-muted-foreground">Style:</span> {LEARNING_STYLES.find(s => s.id === selections.style)?.label}</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    { title: 'What best describes you?', subtitle: 'Help us personalize your experience' },
    { title: 'What\'s your experience level?', subtitle: 'We\'ll adjust content difficulty' },
    { title: 'What are your goals?', subtitle: 'Select what you want to achieve' },
    { title: 'How much time can you commit?', subtitle: 'Set your learning pace' },
    { title: 'How do you learn best?', subtitle: 'We\'ll optimize content for you' },
    { title: 'Ready to begin!', subtitle: 'Your personalized learning path awaits' },
  ];

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Step indicators */}
        <div className="hidden md:flex justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center gap-1',
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  index < currentStep ? 'bg-primary text-white' :
                  index === currentStep ? 'bg-primary/10 border-2 border-primary' :
                  'bg-muted'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{stepTitles[currentStep].title}</CardTitle>
          <CardDescription>{stepTitles[currentStep].subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={updateOnboardingMutation.isPending}
            className="gradient-brand text-white"
          >
            {updateOnboardingMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</>
            ) : (
              <>Start Learning <Rocket className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
