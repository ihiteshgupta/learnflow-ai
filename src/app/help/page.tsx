'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Trophy,
  Target,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I start learning on LearnFlow AI?',
        a: 'After signing up, head to the Courses page to browse available learning tracks. Choose a track that interests you and click "Start Track" to begin. The AI will adapt the content to your learning pace.',
      },
      {
        q: 'What is a learning track?',
        a: 'A learning track is a structured series of courses designed to take you from beginner to proficient in a specific skill area. Each track contains multiple courses with lessons, quizzes, and hands-on projects.',
      },
      {
        q: 'Can I take multiple courses at once?',
        a: 'Yes! You can enroll in multiple tracks simultaneously. Your progress is saved for each track, and you can switch between them anytime from your dashboard.',
      },
    ],
  },
  {
    category: 'XP & Levels',
    questions: [
      {
        q: 'How do I earn XP?',
        a: 'You earn XP by completing lessons, quizzes, and courses. Bonus XP is awarded for maintaining learning streaks, achieving milestones, and completing challenges.',
      },
      {
        q: 'What are levels and how do I level up?',
        a: 'Levels represent your overall progress on LearnFlow. As you earn XP, you progress through levels. Each level requires more XP than the previous one. Higher levels unlock special achievements and badges.',
      },
      {
        q: 'Do streaks affect my XP?',
        a: 'Yes! Maintaining a daily learning streak multiplies your XP earnings. The longer your streak, the higher the multiplier, up to 2x at 30 days.',
      },
    ],
  },
  {
    category: 'Achievements & Certifications',
    questions: [
      {
        q: 'How do I earn achievements?',
        a: 'Achievements are unlocked automatically when you meet specific criteria, such as completing your first course, maintaining a 7-day streak, or earning 1000 XP in a week.',
      },
      {
        q: 'Are certifications recognized?',
        a: 'LearnFlow AI certifications demonstrate verified skill proficiency. Each certificate includes a unique credential ID that can be verified by employers through our verification portal.',
      },
      {
        q: 'Can I share my achievements?',
        a: 'Yes! You can share achievements and certifications directly to LinkedIn, Twitter, or generate a shareable link. Certificates can also be downloaded as PDFs.',
      },
    ],
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        q: 'Is LearnFlow AI free?',
        a: 'LearnFlow offers a free tier with access to select courses. Premium membership unlocks all courses, advanced analytics, offline access, and priority support.',
      },
      {
        q: 'How do I upgrade to Premium?',
        a: 'Click the "Go Pro" button in the sidebar or visit Settings > Subscription to view premium plans and upgrade your account.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel anytime from Settings > Subscription. Your premium access continues until the end of the current billing period.',
      },
    ],
  },
];

const resources = [
  {
    title: 'Documentation',
    description: 'Comprehensive guides and tutorials',
    icon: BookOpen,
    href: '/help#faqs',
    external: false,
  },
  {
    title: 'Community Forum',
    description: 'Connect with other learners',
    icon: MessageCircle,
    href: 'https://github.com/learnflow-ai/discussions',
    external: true,
  },
  {
    title: 'Contact Support',
    description: 'Get help from our team',
    icon: Mail,
    href: 'mailto:support@learnflow.ai',
    external: true,
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">How can we help?</h1>
          <p className="text-muted-foreground mb-6">
            Search our help center or browse frequently asked questions
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-12 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.href}
              target={resource.external ? '_blank' : undefined}
              rel={resource.external ? 'noopener noreferrer' : undefined}
            >
              <Card className="card-hover border-0 shadow-md cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl gradient-brand">
                      <resource.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    {resource.external && (
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="border-0 shadow-md gradient-brand text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6" />
              <h3 className="font-semibold text-lg">Quick Tips for Success</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Set Daily Goals</p>
                  <p className="text-sm text-white/80">30 min/day recommended</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Earn More XP</p>
                  <p className="text-sm text-white/80">Complete quizzes perfectly</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Keep Your Streak</p>
                  <p className="text-sm text-white/80">Learn every day</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Unlock Achievements</p>
                  <p className="text-sm text-white/80">Complete challenges</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>

          {filteredFaqs.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No results found for &quot;{searchQuery}&quot;. Try a different search term.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((category) => (
              <div key={category.category} className="space-y-3">
                <h3 className="font-medium text-muted-foreground flex items-center gap-2">
                  <Badge variant="outline">{category.category}</Badge>
                </h3>
                <div className="space-y-2">
                  {category.questions.map((faq, idx) => {
                    const id = `${category.category}-${idx}`;
                    const isExpanded = expandedQuestions.includes(id);

                    return (
                      <Card key={id} className="border-0 shadow-md overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(id)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium pr-4">{faq.q}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                        <div
                          className={cn(
                            'overflow-hidden transition-all duration-300',
                            isExpanded ? 'max-h-96' : 'max-h-0'
                          )}
                        >
                          <div className="p-4 pt-0 text-muted-foreground border-t">
                            {faq.a}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Card */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Still need help?</h3>
                <p className="text-muted-foreground">
                  Our support team is available 24/7 to assist you with any questions.
                </p>
              </div>
              <a href="mailto:support@learnflow.ai">
                <Button className="gradient-brand text-white shrink-0">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
