'use client';'use client';'use client';



import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';import { useState } from 'react';import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Sparkles, ArrowRight, Send } from 'lucide-react';import { useRouter } from 'next/navigation';import Link from 'next/link';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';import Link from 'next/link';import { useRouter } from 'next/navigation';

import { z } from 'zod';

import toast from 'react-hot-toast';import { motion, AnimatePresence } from 'framer-motion';import { useForm } from 'react-hook-form';

import { authApi } from '@/lib/api';

import { useAuthStore } from '@/store/auth';import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';import { zodResolver } from '@hookform/resolvers/zod';

import { isTelegramWebApp, getTelegramInitData, telegramHaptic } from '@/lib/telegram';

import { useForm } from 'react-hook-form';import { z } from 'zod';

const loginSchema = z.object({

  email: z.string().email('Noto\'g\'ri email formati'),import { zodResolver } from '@hookform/resolvers/zod';import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

  password: z.string().min(1, 'Parol kiritilmagan'),

});import { z } from 'zod';import toast from 'react-hot-toast';



type LoginForm = z.infer<typeof loginSchema>;import toast from 'react-hot-toast';import { Button, Input, Card } from '@/components/ui';



export default function LoginPage() {import { authApi } from '@/lib/api';import { authApi } from '@/lib/api';

  const router = useRouter();

  const { login } = useAuthStore();import { useAuthStore } from '@/store/auth';import { useAuthStore } from '@/store/auth';

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);import { isTelegramWebApp, telegramHaptic } from '@/lib/telegram';import { isTelegramWebApp, getTelegramInitData, telegramHaptic } from '@/lib/telegram';

  const [rememberMe, setRememberMe] = useState(false);

  const [isTelegram, setIsTelegram] = useState(false);



  const {const loginSchema = z.object({const loginSchema = z.object({

    register,

    handleSubmit,  email: z.string().min(1, 'Email yoki username kiriting'),  email: z.string().min(1, 'Email yoki username kiriting'),

    formState: { errors },

  } = useForm<LoginForm>({  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),

    resolver: zodResolver(loginSchema),

  });});});



  useEffect(() => {

    setIsTelegram(isTelegramWebApp());

    type LoginForm = z.infer<typeof loginSchema>;type LoginForm = z.infer<typeof loginSchema>;

    // Auto-login if opened from Telegram

    if (isTelegramWebApp()) {

      handleTelegramLogin();

    }export default function LoginPage() {export default function LoginPage() {

  }, []);

  const router = useRouter();  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {

    setIsLoading(true);  const { login } = useAuthStore();  const { login } = useAuthStore();

    try {

      const response = await authApi.login(data);  const [showPassword, setShowPassword] = useState(false);  const [showPassword, setShowPassword] = useState(false);

      login(response.data.user, response.data.token);

        const [isLoading, setIsLoading] = useState(false);  const [loading, setLoading] = useState(false);

      if (isTelegramWebApp()) {

        telegramHaptic('success');

      }

        const {  const {

      toast.success('🎉 Muvaffaqiyatli kirdingiz!', {

        duration: 3000,    register,    register,

      });

          handleSubmit,    handleSubmit,

      router.push('/');

    } catch (error: any) {    formState: { errors },    formState: { errors },

      if (isTelegramWebApp()) {

        telegramHaptic('error');  } = useForm<LoginForm>({  } = useForm<LoginForm>({

      }

      toast.error(    resolver: zodResolver(loginSchema),    resolver: zodResolver(loginSchema),

        error.response?.data?.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.',

        { icon: '❌' }  });  });

      );

    } finally {

      setIsLoading(false);

    }  const onSubmit = async (data: LoginForm) => {  const onSubmit = async (data: LoginForm) => {

  };

    setIsLoading(true);    setLoading(true);

  const handleTelegramLogin = async () => {

    const initData = getTelegramInitData();    try {    try {

    if (!initData) {

      return; // Not in Telegram or no init data      const response = await authApi.login({      const response = await authApi.login(data);

    }

        emailOrUsername: data.email,      login(response.data.user, response.data.token);

    setIsLoading(true);

    try {        password: data.password,      

      const response = await authApi.telegramAuth(initData);

      login(response.data.user, response.data.token);      });      if (isTelegramWebApp()) {

      

      telegramHaptic('success');        telegramHaptic('success');

      toast.success('Telegram orqali kirdingiz!');

      router.push('/');      login(response.data.user, response.data.token);      }

    } catch (error: any) {

      telegramHaptic('error');            

      toast.error(error.response?.data?.message || 'Telegram orqali kirishda xatolik');

    } finally {      if (isTelegramWebApp()) {      toast.success('Muvaffaqiyatli kirdingiz!');

      setIsLoading(false);

    }        telegramHaptic('success');      router.push('/');

  };

      }    } catch (error: any) {

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">            const message = error.response?.data?.message || 'Kirish amalga oshmadi';

      {/* Animated Background */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">      toast.success('🎉 Muvaffaqiyatli kirdingiz!', {      toast.error(message);

        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>

        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>        duration: 3000,      

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      </div>        style: {      if (isTelegramWebApp()) {



      <motion.div          background: '#10b981',        telegramHaptic('error');

        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}          color: '#fff',      }

        transition={{ duration: 0.5 }}

        className="max-w-md w-full space-y-8 relative z-10"        },    } finally {

      >

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl p-8 backdrop-blur-xl border border-gray-200 dark:border-gray-700">      });      setLoading(false);

          <div className="text-center mb-8">

            <motion.div    }

              initial={{ scale: 0 }}

              animate={{ scale: 1 }}      router.push('/');  };

              transition={{ type: 'spring', stiffness: 260, damping: 20 }}

              className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"    } catch (error: any) {

            >

              <Sparkles className="h-10 w-10 text-white" />      if (isTelegramWebApp()) {  const handleTelegramLogin = async () => {

            </motion.div>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">        telegramHaptic('error');    const initData = getTelegramInitData();

              Xush kelibsiz!

            </h2>      }    if (!initData) {

            <p className="text-gray-600 dark:text-gray-400">

              Hisobingizga kiring      toast.error(      toast.error('Telegram ma\'lumotlari topilmadi');

            </p>

          </div>        error.response?.data?.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.',      return;



          {isTelegram && (        { icon: '❌' }    }

            <motion.div

              initial={{ opacity: 0, y: -10 }}      );

              animate={{ opacity: 1, y: 0 }}

              className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"    } finally {    setLoading(true);

            >

              <div className="flex items-center gap-3">      setIsLoading(false);    try {

                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                <p className="text-sm text-blue-800 dark:text-blue-300">    }      const response = await authApi.telegramAuth(initData);

                  Telegram orqali avtomatik kirilmoqda...

                </p>  };      login(response.data.user, response.data.token);

              </div>

            </motion.div>      telegramHaptic('success');

          )}

  return (      toast.success('Muvaffaqiyatli kirdingiz!');

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

            {/* Email */}    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">      router.push('/');

            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">      {/* Animated Background Elements */}    } catch (error: any) {

                Email

              </label>      <div className="absolute inset-0 overflow-hidden pointer-events-none">      toast.error(error.response?.data?.message || 'Telegram orqali kirish amalga oshmadi');

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>      telegramHaptic('error');

                  <Mail className="h-5 w-5 text-gray-400" />

                </div>        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>    } finally {

                <input

                  {...register('email')}        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>      setLoading(false);

                  type="email"

                  className={`block w-full pl-10 pr-3 py-3 border ${      </div>    }

                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'

                  } rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all`}  };

                  placeholder="email@example.com"

                />      <motion.div

              </div>

              <AnimatePresence mode="wait">        initial={{ opacity: 0, y: 20 }}  return (

                {errors.email && (

                  <motion.p        animate={{ opacity: 1, y: 0 }}    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">

                    initial={{ opacity: 0, y: -10 }}

                    animate={{ opacity: 1, y: 0 }}        transition={{ duration: 0.5 }}      <div className="w-full max-w-md">

                    exit={{ opacity: 0, y: -10 }}

                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"        className="max-w-md w-full space-y-8 relative z-10"        <div className="text-center mb-8">

                  >

                    <AlertCircle className="h-4 w-4" />      >          <Link href="/" className="inline-flex items-center gap-2 mb-6">

                    {errors.email.message}

                  </motion.p>        {/* Main Card */}            <span className="text-4xl">🎓</span>

                )}

              </AnimatePresence>        <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl p-8 backdrop-blur-xl border border-gray-200 dark:border-gray-700">            <span className="text-2xl font-bold gradient-text">Bilimdon</span>

            </div>

          {/* Header */}          </Link>

            {/* Password */}

            <div>          <div className="text-center">          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">

                Parol            <motion.div            Xush kelibsiz!

              </label>

              <div className="relative">              initial={{ scale: 0 }}          </h1>

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                  <Lock className="h-5 w-5 text-gray-400" />              animate={{ scale: 1 }}          <p className="text-gray-500 dark:text-gray-400 mt-2">

                </div>

                <input              transition={{ type: 'spring', stiffness: 260, damping: 20 }}            Hisobingizga kiring

                  {...register('password')}

                  type={showPassword ? 'text' : 'password'}              className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"          </p>

                  className={`block w-full pl-10 pr-12 py-3 border ${

                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'            >        </div>

                  } rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all`}

                  placeholder="••••••••"              <Sparkles className="h-10 w-10 text-white" />

                />

                <button            </motion.div>        <Card className="p-6 md:p-8">

                  type="button"

                  onClick={() => setShowPassword(!showPassword)}            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"

                >              Xush kelibsiz!            <Input

                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}

                </button>            </h2>              label="Email yoki Username"

              </div>

              <AnimatePresence mode="wait">            <p className="text-gray-600 dark:text-gray-400">              placeholder="email@example.com"

                {errors.password && (

                  <motion.p              Hisobingizga kiring va o'rganishni davom ettiring              icon={<Mail className="w-5 h-5" />}

                    initial={{ opacity: 0, y: -10 }}

                    animate={{ opacity: 1, y: 0 }}            </p>              error={errors.email?.message}

                    exit={{ opacity: 0, y: -10 }}

                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"          </div>              {...register('email')}

                  >

                    <AlertCircle className="h-4 w-4" />            />

                    {errors.password.message}

                  </motion.p>          {/* Form */}

                )}

              </AnimatePresence>          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>            <div className="relative">

            </div>

            <div className="space-y-4">              <Input

            {/* Remember Me & Forgot Password */}

            <div className="flex items-center justify-between">              {/* Email/Username */}                label="Parol"

              <div className="flex items-center">

                <input              <div>                type={showPassword ? 'text' : 'password'}

                  id="remember-me"

                  type="checkbox"                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">                placeholder="••••••••"

                  checked={rememberMe}

                  onChange={(e) => setRememberMe(e.target.checked)}                  Email yoki Username                icon={<Lock className="w-5 h-5" />}

                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"

                />                </label>                error={errors.password?.message}

                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">

                  Eslab qolish                <div className="relative">                {...register('password')}

                </label>

              </div>                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">              />

              <Link

                href="/auth/forgot-password"                    <Mail className="h-5 w-5 text-gray-400" />              <button

                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"

              >                  </div>                type="button"

                Parolni unutdingizmi?

              </Link>                  <input                onClick={() => setShowPassword(!showPassword)}

            </div>

                    {...register('email')}                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"

            {/* Submit Button */}

            <motion.button                    id="email"              >

              whileHover={{ scale: 1.02 }}

              whileTap={{ scale: 0.98 }}                    type="text"                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}

              type="submit"

              disabled={isLoading}                    autoComplete="email"              </button>

              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"

            >                    className={`block w-full pl-10 pr-3 py-3 border ${            </div>

              {isLoading ? (

                <>                      errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'

                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />

                  Kuti moqda...                    } rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200`}            <Button type="submit" className="w-full" loading={loading}>

                </>

              ) : (                    placeholder="email@example.com"              Kirish

                <>

                  Kirish                  />            </Button>

                  <ArrowRight className="ml-2 h-5 w-5" />

                </>                </div>          </form>

              )}

            </motion.button>                <AnimatePresence>

          </form>

                  {errors.email && (          {isTelegramWebApp() && (

          {/* Register Link */}

          <div className="mt-6 text-center">                    <motion.p            <>

            <p className="text-sm text-gray-600 dark:text-gray-400">

              Hisobingiz yo'qmi?{' '}                      initial={{ opacity: 0, y: -10 }}              <div className="relative my-6">

              <Link

                href="/auth/register"                      animate={{ opacity: 1, y: 0 }}                <div className="absolute inset-0 flex items-center">

                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"

              >                      exit={{ opacity: 0, y: -10 }}                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />

                Ro'yxatdan o'tish

              </Link>                      className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"                </div>

            </p>

          </div>                    >                <div className="relative flex justify-center text-sm">



          {/* Telegram Info */}                      <AlertCircle className="h-4 w-4" />                  <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">yoki</span>

          {!isTelegram && (

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">                      {errors.email.message}                </div>

              <div className="flex items-start gap-3">

                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />                    </motion.p>              </div>

                <div>

                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">                  )}

                    Telegram orqali kirish

                  </p>                </AnimatePresence>              <Button

                  <p className="text-xs text-blue-700 dark:text-blue-400">

                    <a              </div>                type="button"

                      href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'Bilimdon_aibot'}`}

                      target="_blank"                variant="outline"

                      rel="noopener noreferrer"

                      className="underline hover:text-blue-600"              {/* Password */}                className="w-full"

                    >

                      @{process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'Bilimdon_aibot'}              <div>                onClick={handleTelegramLogin}

                    </a>{' '}

                    botini oching va "Open App" tugmasini bosing                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">                loading={loading}

                  </p>

                </div>                  Parol              >

              </div>

            </div>                </label>                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">

          )}

        </div>                <div className="relative">                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.46-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.093.034.305.019.471z" />



        <p className="text-center text-sm text-gray-500 dark:text-gray-400">                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">                </svg>

          © 2025 Bilimdon. Barcha huquqlar himoyalangan.

        </p>                    <Lock className="h-5 w-5 text-gray-400" />                Telegram orqali kirish

      </motion.div>

                  </div>              </Button>

      <style jsx global>{`

        @keyframes blob {                  <input            </>

          0%, 100% { transform: translate(0px, 0px) scale(1); }

          33% { transform: translate(30px, -50px) scale(1.1); }                    {...register('password')}          )}

          66% { transform: translate(-20px, 20px) scale(0.9); }

        }                    id="password"

        .animate-blob {

          animation: blob 7s infinite;                    type={showPassword ? 'text' : 'password'}          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">

        }

        .animation-delay-2000 {                    autoComplete="current-password"            Hisobingiz yo'qmi?{' '}

          animation-delay: 2s;

        }                    className={`block w-full pl-10 pr-12 py-3 border ${            <Link href="/auth/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">

        .animation-delay-4000 {

          animation-delay: 4s;                      errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'              Ro'yxatdan o'ting

        }

      `}</style>                    } rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200`}            </Link>

    </div>

  );                    placeholder="••••••••"          </p>

}

                  />        </Card>

                  <button      </div>

                    type="button"    </div>

                    onClick={() => setShowPassword(!showPassword)}  );

                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"}

                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Eslab qolish
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                  Parolni unutdingizmi?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Kirish...
                </>
              ) : (
                <>
                  Kirish
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
                  Yoki
                </span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hisobingiz yo'qmi?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Ro'yxatdan o'ting
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © 2025 Bilimdon. Barcha huquqlar himoyalangan.
        </p>
      </motion.div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
