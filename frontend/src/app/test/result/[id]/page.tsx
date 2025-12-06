'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, ArrowLeft, Share2, RotateCcw, Trophy, Zap, Star } from 'lucide-react';
import { testsApi } from '@/lib/api';
import { Button, Card, Badge, Progress } from '@/components/ui';
import { cn, getScoreColor, getDifficultyColor, getDifficultyLabel, formatXP } from '@/lib/utils';
import { telegramHaptic, isTelegramWebApp } from '@/lib/telegram';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface TestResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  timeSpent: number | null;
  leveledUp: boolean;
  newLevel: number | null;
  newAchievements: Array<{ id: string; name: string; icon: string; xpReward: number }>;
  answers: Array<{
    questionId: string;
    question: string;
    options: string[];
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string | null;
    xpReward: number;
  }>;
}

export default function TestResultPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await testsApi.getResult(testId);
        setResult(data);

        // Celebration for good scores
        if (data.score >= 80) {
          if (isTelegramWebApp()) {
            telegramHaptic('success');
          }
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (error: any) {
        toast.error('Natijani yuklashda xatolik');
        router.push('/categories');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId, router]);

  const handleShare = () => {
    if (!result) return;

    const text = `🎓 Bilimdon platformasida ${result.score}% natija oldim! ${result.correctAnswers}/${result.totalQuestions} to'g'ri javob, ${result.xpEarned} XP qo'lga kiritdim. Sen ham sinab ko'r!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Bilimdon - Test natijasi',
        text,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Nusxa olindi!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Natija topilmadi</p>
      </div>
    );
  }

  const scoreColor = getScoreColor(result.score);
  const isPerfect = result.score === 100;
  const isGood = result.score >= 70;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          {/* Score Circle */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-white/20"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${result.score * 4.4} 440`}
                strokeLinecap="round"
                className="text-white"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">{result.score}%</span>
              <span className="text-white/80 text-sm">natija</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {isPerfect ? '🎉 Mukammal!' : isGood ? '👏 Yaxshi natija!' : '💪 Davom eting!'}
          </h1>
          <p className="text-white/80">
            {result.correctAnswers} / {result.totalQuestions} to'g'ri javob
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              +{result.xpEarned}
            </p>
            <p className="text-sm text-gray-500">XP olindi</p>
          </Card>

          <Card className="text-center p-4">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.correctAnswers}
            </p>
            <p className="text-sm text-gray-500">To'g'ri</p>
          </Card>

          <Card className="text-center p-4">
            <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.totalQuestions - result.correctAnswers}
            </p>
            <p className="text-sm text-gray-500">Noto'g'ri</p>
          </Card>

          <Card className="text-center p-4">
            <Trophy className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.score >= 90 ? 'A' : result.score >= 70 ? 'B' : result.score >= 50 ? 'C' : 'D'}
            </p>
            <p className="text-sm text-gray-500">Baho</p>
          </Card>
        </div>

        {/* Level Up Alert */}
        {result.leveledUp && result.newLevel && (
          <Card className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-bold mb-1">🎊 Level Up!</h3>
            <p>Siz Level {result.newLevel} ga ko'tarildingiz!</p>
          </Card>
        )}

        {/* New Achievements */}
        {result.newAchievements.length > 0 && (
          <Card className="mt-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              🏆 Yangi yutuqlar
            </h3>
            <div className="space-y-3">
              {result.newAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <span className="text-3xl">{ach.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{ach.name}</p>
                    <p className="text-sm text-yellow-600">+{ach.xpReward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/categories" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kategoriyalar
            </Button>
          </Link>
          <Button onClick={handleShare} variant="secondary" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Ulashish
          </Button>
          <Button
            onClick={() => router.back()}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Qayta topshirish
          </Button>
        </div>

        {/* Show/Hide Answers */}
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="w-full mt-6 py-3 text-indigo-600 dark:text-indigo-400 font-medium"
        >
          {showAnswers ? 'Javoblarni yashirish' : 'Javoblarni ko\'rish'}
        </button>

        {/* Answers Review */}
        {showAnswers && (
          <div className="space-y-4 mt-4 pb-8">
            {result.answers.map((answer, index) => (
              <Card key={answer.questionId} className={cn(
                'border-l-4',
                answer.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              )}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    answer.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  )}>
                    {answer.isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Savol {index + 1}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {answer.question}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {answer.options.map((option, optIndex) => {
                    const isCorrect = optIndex === answer.correctAnswer;
                    const isSelected = optIndex === answer.selectedAnswer;
                    const labels = ['A', 'B', 'C', 'D'];

                    return (
                      <div
                        key={optIndex}
                        className={cn(
                          'p-3 rounded-xl flex items-center gap-3',
                          isCorrect
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : isSelected && !isCorrect
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                              : 'bg-gray-50 dark:bg-gray-800'
                        )}
                      >
                        <span className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm',
                          isCorrect
                            ? 'bg-green-500 text-white'
                            : isSelected && !isCorrect
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        )}>
                          {labels[optIndex]}
                        </span>
                        <span className={cn(
                          'flex-1',
                          isCorrect
                            ? 'text-green-700 dark:text-green-400 font-medium'
                            : isSelected && !isCorrect
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                        )}>
                          {option}
                        </span>
                        {isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                      </div>
                    );
                  })}
                </div>

                {answer.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Tushuntirish:</strong> {answer.explanation}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={answer.isCorrect ? 'success' : 'error'}>
                    {answer.isCorrect ? `+${answer.xpReward} XP` : '0 XP'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
