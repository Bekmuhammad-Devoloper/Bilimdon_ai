'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useAuth, useCategories } from '@/hooks';
import { leaderboardApi } from '@/lib/api';
import { Card, Avatar, Badge } from '@/components/ui';
import { cn, formatXP } from '@/lib/utils';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  fullName: string;
  avatar: string | null;
  totalXP: number;
  level: number;
  testsCount?: number;
}

type TabType = 'global' | 'weekly' | 'monthly';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { categories } = useCategories();
  
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ global: number; weekly: number; monthly: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        let data;
        if (selectedCategory) {
          const res = await leaderboardApi.getCategory(selectedCategory);
          data = res.data;
        } else {
          switch (activeTab) {
            case 'weekly':
              data = (await leaderboardApi.getWeekly()).data;
              break;
            case 'monthly':
              data = (await leaderboardApi.getMonthly()).data;
              break;
            default:
              data = (await leaderboardApi.getGlobal()).data;
          }
        }
        
        setLeaderboard(data.leaderboard || data);

        // Fetch my rank
        if (user) {
          const rankRes = await leaderboardApi.getMyRank();
          setMyRank(rankRes.data);
        }
      } catch (error) {
        console.error('Leaderboard error:', error);
        toast.error('Reytingni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, selectedCategory, user]);

  const tabs = [
    { id: 'global' as TabType, label: 'Umumiy', icon: Trophy },
    { id: 'weekly' as TabType, label: 'Haftalik', icon: Clock },
    { id: 'monthly' as TabType, label: 'Oylik', icon: Calendar },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-600';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏆 Reyting
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Eng yaxshi o'quvchilar reytingi
        </p>
      </div>

      {/* My Rank Card */}
      {user && myRank && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-4">
            <Avatar src={user.avatar} name={user.fullName} size="lg" />
            <div className="flex-1">
              <p className="font-bold text-lg">{user.fullName}</p>
              <p className="text-white/70">@{user.username}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Sizning o'rningiz</p>
              <p className="text-3xl font-bold">
                #{activeTab === 'global' ? myRank.global : activeTab === 'weekly' ? myRank.weekly : myRank.monthly}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedCategory(null);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id && !selectedCategory
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">Kategoriya bo'yicha:</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap',
              !selectedCategory
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            Barchasi
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap',
                selectedCategory === cat.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <Card className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500">Hozircha reyting bo'sh</p>
        </Card>
      ) : (
        <>
          {/* Top 3 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {leaderboard.slice(0, 3).map((entry, index) => {
              const positions = [1, 0, 2]; // 2nd, 1st, 3rd
              const actualIndex = positions[index];
              const actualEntry = leaderboard[actualIndex];
              if (!actualEntry) return null;

              return (
                <Card
                  key={actualEntry.id}
                  className={cn(
                    'text-center p-4 border-2',
                    actualIndex === 0 && 'md:col-start-2 border-yellow-300 dark:border-yellow-600 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-900',
                    actualIndex === 1 && 'border-gray-300 dark:border-gray-600',
                    actualIndex === 2 && 'border-orange-300 dark:border-orange-600',
                    index === 1 && '-mt-4'
                  )}
                >
                  <div className="relative inline-block mb-2">
                    <Avatar
                      src={actualEntry.avatar}
                      name={actualEntry.fullName}
                      size={actualIndex === 0 ? 'xl' : 'lg'}
                    />
                    <div className={cn(
                      'absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                      actualIndex === 0 && 'bg-yellow-500',
                      actualIndex === 1 && 'bg-gray-400',
                      actualIndex === 2 && 'bg-orange-400'
                    )}>
                      {actualIndex + 1}
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                    {actualEntry.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">@{actualEntry.username}</p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-2">
                    {formatXP(actualEntry.totalXP)} XP
                  </p>
                  <Badge variant="info" size="sm" className="mt-1">
                    Level {actualEntry.level}
                  </Badge>
                </Card>
              );
            })}
          </div>

          {/* Rest of leaderboard */}
          <div className="space-y-2">
            {leaderboard.slice(3).map((entry) => {
              const isCurrentUser = user?.id === entry.id;

              return (
                <Card
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-4 p-4 border-2',
                    isCurrentUser
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-transparent',
                    getRankBg(entry.rank)
                  )}
                >
                  <div className="w-10 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <Avatar src={entry.avatar} name={entry.fullName} size="md" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {entry.fullName}
                      {isCurrentUser && <span className="text-indigo-600 ml-1">(Siz)</span>}
                    </p>
                    <p className="text-sm text-gray-500 truncate">@{entry.username}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatXP(entry.totalXP)} XP
                    </p>
                    <p className="text-xs text-gray-500">Level {entry.level}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
