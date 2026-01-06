'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Eye, EyeOff, Loader2, CheckCircle2, 
  User, Phone, ArrowRight, Shield, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { 
  isTelegramWebApp, 
  getTelegramInitData, 
  telegramHaptic,
  telegramReady,
  telegramExpand,
  requestTelegramContact
} from '@/lib/telegram';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type Step = 'phone' | 'credentials' | 'completed';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export default function TelegramRegisterPage() {
  const router = useRouter();
  const { login, user, token } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  
  // Phone step
  const [phone, setPhone] = useState('');
  const [phoneShared, setPhoneShared] = useState(false);
  
  // Credentials step
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Initialize - authenticate with Telegram if not already
  useEffect(() => {
    const initTelegram = async () => {
      // Only works in Telegram Mini App
      if (!isTelegramWebApp()) {
        router.push('/auth/register');
        return;
      }

      telegramReady();
      telegramExpand();

      // Get telegram user info from initData
      const initData = getTelegramInitData();
      if (initData) {
        try {
          const params = new URLSearchParams(initData);
          const userStr = params.get('user');
          if (userStr) {
            const tgUser = JSON.parse(userStr);
            setTelegramUser(tgUser);
            // Set default username from telegram
            if (tgUser.username) {
              setUsername(tgUser.username);
            }
          }
        } catch (e) {
          console.error('Parse telegram user error:', e);
        }

        // If not authenticated yet, authenticate first
        if (!token) {
          try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await axios.post(`${API_URL}/telegram/webapp/auth`, { initData });
            if (res.data.user && res.data.token) {
              login(res.data.user, res.data.token);
              
              // Check if user already has phone
              if (res.data.user.telegramPhone) {
                setPhone(res.data.user.telegramPhone);
                setPhoneShared(true);
                setCurrentStep('credentials');
              }
            }
          } catch (e) {
            console.error('Telegram auth error:', e);
          }
        }
      }

      setIsInitialized(true);
    };

    initTelegram();
  }, []);

  // Update step if user data changes
  useEffect(() => {
    if (user?.telegramPhone && !phoneShared) {
      setPhone(user.telegramPhone);
      setPhoneShared(true);
      setCurrentStep('credentials');
    }
  }, [user]);

  // Check username availability
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await axios.post(`${API_URL}/auth/check-username`, { username });
        setUsernameAvailable(res.data.available);
      } catch (e) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Request phone from Telegram
  const handleRequestPhone = () => {
    telegramHaptic('impact');
    
    requestTelegramContact((contact: any) => {
      if (contact && contact.phone_number) {
        const phoneNumber = contact.phone_number.startsWith('+') 
          ? contact.phone_number 
          : '+' + contact.phone_number;
        setPhone(phoneNumber);
        setPhoneShared(true);
        
        // Save phone to backend
        savePhone(phoneNumber);
        
        telegramHaptic('success');
        toast.success('✅ Telefon raqam qabul qilindi!');
        setCurrentStep('credentials');
      }
    });
  };

  // Save phone to backend
  const savePhone = async (phoneNumber: string) => {
    if (!token) return;
    
    try {
      await axios.post(`${API_URL}/telegram/webapp/save-phone`, 
        { phone: phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.error('Save phone error:', e);
    }
  };

  // Complete registration
  const handleCompleteRegistration = async () => {
    // Validation
    if (!username || username.length < 3) {
      toast.error('Username kamida 3 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (!usernameAvailable) {
      toast.error('Bu username band, boshqasini tanlang');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Parollar mos kelmadi');
      return;
    }

    setIsLoading(true);
    telegramHaptic('impact');

    try {
      // Complete telegram registration
      const res = await axios.post(`${API_URL}/telegram/webapp/complete-registration`, 
        { 
          username,
          password,
          phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Update user in store
        login(res.data.user, res.data.token || token);
        
        telegramHaptic('success');
        toast.success('🎉 Ro\'yxatdan o\'tish muvaffaqiyatli!');
        
        setCurrentStep('completed');
        
        // Redirect after animation
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error: any) {
      telegramHaptic('error');
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone number for display
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
      return `+998 (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
    }
    return phone;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {['phone', 'credentials', 'completed'].map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            currentStep === step 
              ? 'bg-blue-600 text-white scale-110' 
              : index < ['phone', 'credentials', 'completed'].indexOf(currentStep)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
          }`}>
            {index < ['phone', 'credentials', 'completed'].indexOf(currentStep) ? (
              <Check className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < 2 && (
            <div className={`w-12 h-1 mx-1 rounded ${
              index < ['phone', 'credentials', 'completed'].indexOf(currentStep)
                ? 'bg-green-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Telegram orqali ro'yxatdan o'tish
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {telegramUser?.first_name && `Xush kelibsiz, ${telegramUser.first_name}!`}
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Phone */}
            {currentStep === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Telefon raqamingizni ulashing
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Saytdan ham kirish imkoniyati uchun telefon raqamingiz kerak
                  </p>
                </div>

                {phoneShared ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">Telefon qabul qilindi</p>
                        <p className="text-sm text-green-600 dark:text-green-500">{formatPhone(phone)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestPhone}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    Telefon raqamni ulashish
                  </button>
                )}

                {phoneShared && (
                  <button
                    onClick={() => setCurrentStep('credentials')}
                    className="w-full py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition"
                  >
                    Davom etish
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            )}

            {/* Step 2: Credentials */}
            {currentStep === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Hisob ma'lumotlari
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Saytdan kirish uchun username va parol yarating
                  </p>
                </div>

                {/* Phone display */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{formatPhone(phone)}</span>
                  <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="username"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {checkingUsername && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">✕</span>
                    )}
                  </div>
                  {usernameAvailable === false && (
                    <p className="text-red-500 text-sm mt-1">Bu username band</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    Telegram username: @{telegramUser?.username || 'yo\'q'}
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parol
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kamida 6 ta belgi"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parolni tasdiqlang
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Parolni qayta kiriting"
                      className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        confirmPassword && password !== confirmPassword 
                          ? 'border-red-500' 
                          : confirmPassword && password === confirmPassword
                            ? 'border-green-500'
                            : 'border-gray-200 dark:border-gray-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">Parollar mos kelmadi</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Parollar mos
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCompleteRegistration}
                  disabled={isLoading || !usernameAvailable || password.length < 6 || password !== confirmPassword}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Ro'yxatdan o'tish
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Step 3: Completed */}
            {currentStep === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Muvaffaqiyatli! 🎉
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Ro'yxatdan o'tdingiz. Endi saytdan ham kirishingiz mumkin!
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-left">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Username:</strong> {username}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    <strong>Telefon:</strong> {formatPhone(phone)}
                  </p>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Bosh sahifaga yo'naltirilmoqdasiz...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
