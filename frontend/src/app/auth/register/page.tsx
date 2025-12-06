'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, 
  Sparkles, User, Send, Phone, MessageCircle, ArrowRight, Shield
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { isTelegramWebApp, telegramHaptic } from '@/lib/telegram';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  username: z.string().min(3, 'Username kamida 3 ta belgidan iborat bo\'lishi kerak')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username faqat harf, raqam va _ dan iborat bo\'lishi kerak'),
  email: z.string().email('Noto\'g\'ri email formati'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parollar mos kelmadi",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

type Step = 'form' | 'email-verification' | 'telegram-phone' | 'completed';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [telegramPhone, setTelegramPhone] = useState('');
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Send email verification code
  const sendVerificationCode = async (emailAddress: string) => {
    try {
      await axios.post(`${API_URL}/auth/send-verification`, { email: emailAddress });
      toast.success('📧 Tasdiqlash kodi emailingizga yuborildi!');
      startCountdown();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kod yuborishda xatolik');
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle form submission
  const onSubmit = async (data: RegisterForm) => {
    setEmail(data.email);
    setIsLoading(true);
    try {
      await sendVerificationCode(data.email);
      setCurrentStep('email-verification');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code input
  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify when all filled
    if (newCode.every(digit => digit !== '') && index === 5) {
      verifyEmailCode(newCode.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify email code
  const verifyEmailCode = async (code: string) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-email`, {
        email,
        code,
      });
      
      toast.success('✅ Email tasdiqlandi!');
      setCurrentStep('telegram-phone');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Noto\'g\'ri kod');
      setVerificationCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Send phone to Telegram
  const sendPhoneToTelegram = async () => {
    if (!telegramPhone || telegramPhone.length < 9) {
      toast.error('To\'liq telefon raqamini kiriting');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/send-phone-telegram`, {
        phone: telegramPhone,
        email,
      });
      
      toast.success('📱 Telefon raqam Telegramga yuborildi!');
      
      // Complete registration
      await completeRegistration();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete registration
  const completeRegistration = async () => {
    const formData = getValues();
    setIsLoading(true);
    try {
      const response = await authApi.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
      });

      login(response.data.user, response.data.token);
      
      if (isTelegramWebApp()) {
        telegramHaptic('success');
      }
      
      toast.success('🎉 Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', {
        duration: 4000,
      });
      
      setCurrentStep('completed');
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const skipTelegram = async () => {
    await completeRegistration();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Progress Steps */}
        <div className="flex justify-center space-x-2">
          {['form', 'email-verification', 'telegram-phone'].map((step, index) => (
            <div
              key={step}
              className={`h-2 w-16 rounded-full transition-all duration-300 ${
                ['form', 'email-verification', 'telegram-phone'].indexOf(currentStep) >= index
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl p-8 backdrop-blur-xl border border-gray-200 dark:border-gray-700">
          {/* Step 1: Registration Form */}
          <AnimatePresence mode="wait">
            {currentStep === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  >
                    <Sparkles className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Ro'yxatdan o'tish
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Bilimdon platformasiga qo'shiling
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      To'liq ism
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('fullName')}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all`}
                        placeholder="Ismingiz"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">@</span>
                      </div>
                      <input
                        {...register('username')}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all`}
                        placeholder="username123"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('email')}
                        type="email"
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all`}
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parol
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className={`block w-full pl-10 pr-12 py-3 border ${
                          errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parolni tasdiqlang
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`block w-full pl-10 pr-12 py-3 border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Yuborilmoqda...
                      </>
                    ) : (
                      <>
                        Davom etish
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allaqachon ro'yxatdan o'tganmisiz?{' '}
                    <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                      Kirish
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Email Verification */}
            {currentStep === 'email-verification' && (
              <motion.div
                key="email-verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Tasdiqlash
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  <span className="font-medium">{email}</span> manziliga yuborilgan 6 raqamli kodni kiriting
                </p>

                <div className="flex justify-center gap-2 mb-6">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeInput(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qayta yuborish: {countdown} soniya
                    </p>
                  ) : (
                    <button
                      onClick={() => sendVerificationCode(email)}
                      className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
                    >
                      Kodni qayta yuborish
                    </button>
                  )}
                </div>

                {isLoading && (
                  <div className="mt-4 flex justify-center">
                    <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Telegram Phone */}
            {currentStep === 'telegram-phone' && (
              <motion.div
                key="telegram-phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Telegram Telefon
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Telegram orqali aloqa qilishimiz uchun telefon raqamingizni yuboring (ixtiyoriy)
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={telegramPhone}
                      onChange={(e) => setTelegramPhone(e.target.value.replace(/\D/g, ''))}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+998901234567"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={skipTelegram}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      O'tkazib yuborish
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={sendPhoneToTelegram}
                      disabled={isLoading}
                      className="flex-1 flex justify-center items-center py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Yuborish
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Completed */}
            {currentStep === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="mx-auto h-24 w-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl"
                >
                  <CheckCircle2 className="h-16 w-16 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Tabriklaymiz! 🎉
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Siz muvaffaqiyatli ro'yxatdan o'tdingiz
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Platformaga yo'naltirilmoqda...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © 2025 Bilimdon. Barcha huquqlar himoyalangan.
        </p>
      </motion.div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
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
