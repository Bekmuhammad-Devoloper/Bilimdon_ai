'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Edit2, Trophy, Target, Zap, Clock, TrendingUp, 
  ChevronRight, Award, BarChart3 
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { usersApi, achievementsApi } from '@/lib/api';
import { Button, Card, Avatar, Badge, Progress } from '@/components/ui';
import { formatXP, calculateLevelProgress, formatDate, cn, getScoreColor } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CategoryStat {
  id: string;
  categoryId: string;
  category: { name: string; icon: string; color: string };
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  totalXP: number;
  averageScore: number;
  bestScore: number;
}

interface TestHistory {
  id: string;
  category: { name: string; icon: string } | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  completedAt: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [achievements, setAchievements] = useState<{ unlocked: Achievement[]; locked: Achievement[] }>({
    unlocked: [],
    locked: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'achievements'>('stats');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const [statsRes, historyRes, achievementsRes] = await Promise.all([
          usersApi.getCategoryStats(),
          usersApi.getTestHistory(1, 10),
          achievementsApi.getMy(),
        ]);

        setCategoryStats(statsRes.data);
        setTestHistory(historyRes.data.history || historyRes.data);
        
        const achData = achievementsRes.data;
        setAchievements({
          unlocked: achData.filter((a: any) => a.unlockedAt),
          locked: achData.filter((a: any) => !a.unlockedAt),
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const levelProgress = calculateLevelProgress(user.totalXP);
  const totalTests = categoryStats.reduce((sum, s) => sum + s.totalTests, 0);
  const avgScore = categoryStats.length > 0
    ? categoryStats.reduce((sum, s) => sum + s.averageScore, 0) / categoryStats.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 md:-mt-8">
            <Avatar src={user.avatar} name={user.fullName} size="xl" className="ring-4 ring-white dark:ring-gray-900" />
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.fullName}
              </h1>
              <p className="text-gray-500">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{user.bio}</p>
              )}
            </div>

            <Link href="/profile/edit">
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Tahrirlash
              </Button>
            </Link>
          </div>

          {/* Level Progress */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.level}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level {user.level}</p>
                  <p className="font-bold text-indigo-600">{formatXP(user.totalXP)} XP</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Keyingi levelgacha</p>
                <p className="font-medium">{formatXP(levelProgress.required - levelProgress.current)} XP</p>
              </div>
            </div>
            <Progress value={levelProgress.percentage} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Target className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTests}</p>
              <p className="text-xs text-gray-500">Testlar</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgScore)}%</p>
              <p className="text-xs text-gray-500">O'rtacha ball</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatXP(user.totalXP)}</p>
              <p className="text-xs text-gray-500">Jami XP</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Trophy className="w-6 h-6 mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{achievements.unlocked.length}</p>
              <p className="text-xs text-gray-500">Yutuqlar</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'stats', label: 'Statistika', icon: BarChart3 },
          { id: 'history', label: 'Tarix', icon: Clock },
          { id: 'achievements', label: 'Yutuqlar', icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Kategoriya statistikasi
          </h2>
          {categoryStats.length === 0 ? (
            <Card className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500">Hali test topshirmadingiz</p>
              <Link href="/categories" className="mt-4 inline-block">
                <Button>Test boshlash</Button>
              </Link>
            </Card>
          ) : (
            categoryStats.map((stat) => (
              <Card key={stat.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${stat.category.color}20` }}
                  >
                    {stat.category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {stat.category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stat.totalTests} ta test • {stat.totalXP} XP
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-2xl font-bold', getScoreColor(stat.averageScore))}>
                      {Math.round(stat.averageScore)}%
                    </p>
                    <p className="text-xs text-gray-500">o'rtacha</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Eng yaxshi: {Math.round(stat.bestScore)}%</span>
                    <span className="text-gray-500">
                      {stat.correctAnswers}/{stat.totalQuestions} to'g'ri
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Test tarixi
          </h2>
          {testHistory.length === 0 ? (
            <Card className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500">Hali test topshirmadingiz</p>
            </Card>
          ) : (
            testHistory.map((test) => (
              <Link key={test.id} href={`/test/result/${test.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
                      {test.category?.icon || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {test.category?.name || 'Aralash test'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(test.completedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-xl font-bold', getScoreColor(test.score))}>
                        {test.score}%
                      </p>
                      <p className="text-xs text-gray-500">
                        +{test.xpEarned} XP
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Unlocked */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Olingan yutuqlar ({achievements.unlocked.length})
            </h2>
            {achievements.unlocked.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-gray-500">Hali yutuq olmadingiz</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.unlocked.map((ach) => (
                  <Card key={ach.id} className="p-4 text-center border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
                    <span className="text-4xl">{ach.icon}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-2">{ach.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{ach.description}</p>
                    <Badge variant="success" className="mt-2">+{ach.xpReward} XP</Badge>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Locked */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Olinmagan yutuqlar ({achievements.locked.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.locked.map((ach) => (
                <Card key={ach.id} className="p-4 text-center opacity-60">
                  <span className="text-4xl grayscale">{ach.icon}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-2">{ach.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{ach.description}</p>
                  {ach.progress !== undefined && ach.target && (
                    <div className="mt-2">
                      <Progress value={(ach.progress / ach.target) * 100} size="sm" />
                      <p className="text-xs text-gray-500 mt-1">{ach.progress}/{ach.target}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
