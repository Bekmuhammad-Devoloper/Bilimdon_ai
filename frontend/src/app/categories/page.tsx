'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks';
import { Card, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories();
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Group categories
  const groups = [
    { id: 'programming', name: 'Dasturlash', slugs: ['python', 'javascript', 'typescript', 'java', 'cpp', 'golang', 'rust'] },
    { id: 'frontend', name: 'Frontend', slugs: ['react', 'nextjs', 'vuejs', 'html-css', 'tailwind'] },
    { id: 'backend', name: 'Backend', slugs: ['nodejs', 'nestjs', 'expressjs', 'django'] },
    { id: 'database', name: 'Database', slugs: ['sql', 'postgresql', 'mongodb', 'redis'] },
    { id: 'devops', name: 'DevOps', slugs: ['docker', 'git', 'linux'] },
    { id: 'science', name: 'Fanlar', slugs: ['matematika', 'fizika', 'english', 'tarix'] },
  ];

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase());
    
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      return matchesSearch && group?.slugs.includes(cat.slug);
    }
    
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Kategoriyalar
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Test topshirmoqchi bo'lgan kategoriyangizni tanlang
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Kategoriya qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup(null)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              !selectedGroup
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            Barchasi
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                selectedGroup === group.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Hech narsa topilmadi
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/test/${category.slug}`}>
              <Card hover className="h-full p-6 group">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    {category._count && (
                      <Badge variant="info">{category._count.questions}+ savol</Badge>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Mixed Test Card */}
      <div className="mt-8">
        <Link href="/test/mixed">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🎲 Aralash test</h3>
                <p className="text-white/80">
                  Barcha kategoriyalardan random savollar bilan test topshiring
                </p>
              </div>
              <ArrowRight className="w-8 h-8" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
