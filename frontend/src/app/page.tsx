'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Trophy, Bot, Target, TrendingUp, Users } from 'lucide-react';
import { useAuth, useCategories } from '@/hooks';
import { Button, Card, Avatar, Progress, Badge } from '@/components/ui';
import { formatXP, calculateLevelProgress, cn } from '@/lib/utils';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();

  // Featured categories (first 6)
  const featuredCategories = categories.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Bilimingizni sinang va <span className="text-yellow-300">rivojlaning</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Test topshiring, XP to'plang, reytingda raqobatlashing va AI yordamchisidan foydalaning. 
              30+ kategoriya va minglab savollar sizni kutmoqda!
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link href="/categories">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                    Test boshlash <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                      Boshlash <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Kirish
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { icon: Users, value: '10,000+', label: 'Foydalanuvchilar' },
              { icon: Target, value: '50,000+', label: 'Savollar' },
              { icon: Trophy, value: '30+', label: 'Kategoriyalar' },
              { icon: TrendingUp, value: '100,000+', label: 'Testlar' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Stats (if authenticated) */}
      {isAuthenticated && user && (
        <section className="container mx-auto px-4 -mt-8 relative z-10">
          <Card className="bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6">
              <Avatar src={user.avatar} name={user.fullName} size="xl" />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Salom, {user.fullName}! 👋
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  @{user.username} • Level {user.level}
                </p>
                <div className="mt-4 max-w-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Level {user.level} → {user.level + 1}
                    </span>
                    <span className="font-medium text-indigo-600">
                      {formatXP(user.totalXP)} XP
                    </span>
                  </div>
                  <Progress 
                    value={calculateLevelProgress(user.totalXP).percentage} 
                    variant="default"
                    size="md"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/categories">
                  <Button>
                    <Zap className="w-4 h-4 mr-2" />
                    Test boshlash
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">Profil</Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Kategoriyalar
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              O'zingizga kerakli yo'nalishni tanlang
            </p>
          </div>
          <Link href="/categories">
            <Button variant="ghost">
              Barchasi <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.map((category) => (
              <Link key={category.id} href={`/test/${category.slug}`}>
                <Card 
                  hover 
                  className="h-full text-center p-4 border-2 border-transparent hover:border-indigo-500/50"
                >
                  <div 
                    className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-3"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {category.name}
                  </h3>
                  {category._count && (
                    <p className="text-xs text-gray-500 mt-1">
                      {category._count.questions}+ savol
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-gray-100 dark:bg-gray-900/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Nima uchun Bilimdon?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
              Platformamiz sizga bilimingizni samarali o'stirish uchun barcha zarur vositalarni taqdim etadi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Testlar va savollar',
                description: '30+ kategoriya va minglab savollar. Har bir kategoriyada 10 ta random savol bilan test topshiring.',
                color: 'bg-blue-500',
              },
              {
                icon: Zap,
                title: 'XP va Level tizimi',
                description: 'Har bir to\'g\'ri javob uchun XP oling. Level ko\'taring va yutuqlar qo\'lga kiriting.',
                color: 'bg-yellow-500',
              },
              {
                icon: Trophy,
                title: 'Reyting tizimi',
                description: 'Boshqa foydalanuvchilar bilan raqobatlashing. Haftalik va oylik reytingda ishtirok eting.',
                color: 'bg-green-500',
              },
              {
                icon: Bot,
                title: 'AI Yordamchi',
                description: 'Gemini AI bilan suhbatlashing. Savollaringizga javob oling va bilimingizni oshiring.',
                color: 'bg-purple-500',
              },
              {
                icon: TrendingUp,
                title: 'Statistika',
                description: 'O\'z progressingizni kuzating. Har bir kategoriya bo\'yicha batafsil statistika.',
                color: 'bg-pink-500',
              },
              {
                icon: Users,
                title: 'Jamiyat',
                description: 'Minglab foydalanuvchilar bilan bir platformada. Birgalikda o\'rganish yanada qiziqarli.',
                color: 'bg-orange-500',
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4', feature.color)}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Hoziroq boshlang!
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Ro'yxatdan o'ting va bilimingizni sinashni boshlang. 
              Bepul va oson!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Ro'yxatdan o'tish
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Kategoriyalarni ko'rish
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
