
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginRequest } from './requests/loginRequest';
import { registerRequest } from './requests/register';
import PhoneField from './PhoneField';
import { hasEnoughDigits, MIN_NATIONAL_DIGITS } from '../lib/phone';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

type AuthView = 'register' | 'login';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // The control keeps the dial code in the field, so validating the national
  // part means knowing how many of those digits are the prefix.
  const [dialCode, setDialCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePhoneChange = (value: string, code: string) => {
    setPhone(value);
    setDialCode(code);
  };

  /** True once the number carries a plausible national part. */
  const phoneIsUsable = hasEnoughDigits(phone, dialCode.length);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !password || !confirmPassword) {
      setError('يرجى تعبئة جميع الحقول');
      return;
    }

    if (!phoneIsUsable) {
      setError(`رقم الهاتف يجب أن يكون ${MIN_NATIONAL_DIGITS} أرقام على الأقل`);
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    try {
      const routerAdapter = {
        push: (path: string) => {
          onLoginSuccess();
          navigate(path);
        }
      };

      await registerRequest(
        { name, phone, password, dialCode },
        setIsLoading,
        'ar',
        routerAdapter
      );
    } catch (err) {
      console.error('Registration error:', err);
      setError('حدث خطأ أثناء التسجيل');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('يرجى تعبئة جميع الحقول');
      return;
    }

    if (!phoneIsUsable) {
      setError(`رقم الهاتف يجب أن يكون ${MIN_NATIONAL_DIGITS} أرقام على الأقل`);
      return;
    }

    try {
      const routerAdapter = {
        push: (path: string) => {
          onLoginSuccess();
          navigate(path);
        }
      };

      await loginRequest(
        { phone, password, dialCode },
        setIsLoading,
        'ar',
        routerAdapter
      );
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ أثناء تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-alexandria">
      <div className="w-full bg-app-bg min-h-screen relative shadow-2xl flex flex-col items-center justify-center p-6 overflow-hidden animate-fadeIn">

        {/* Header / Logo Area */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-app-text mb-2 tracking-tight">Trandy Hair</h1>
          <p className="text-app-textSec text-sm">بوابتك لعالم الجمال والعناية</p>
        </div>

        <div className="w-full bg-white  max-w-[430px] rounded-[2rem] shadow-sm border border-app-card/30 p-8">
          <h2 className="text-xl font-bold text-app-text mb-6 text-center">
            {view === 'register' ? 'تسجيل حساب جديد' : 'تسجيل الدخول'}
          </h2>

          <form onSubmit={view === 'register' ? handleRegister : handleLogin} className="space-y-4">

            {/* Registration Only: Name */}
            {view === 'register' && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="الاسم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-app-bg border border-app-card rounded-2xl outline-none focus:border-app-gold text-right pr-12 text-app-text font-medium"
                  disabled={isLoading}
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
              </div>
            )}

            {/* Phone Field — country selector prefills the dial code */}
            <PhoneField
              value={phone}
              onChange={handlePhoneChange}
              disabled={isLoading}
            />

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-app-bg border border-app-card rounded-2xl outline-none focus:border-app-gold text-right pr-12 pl-12 text-app-text font-medium"
                dir="ltr"
                disabled={isLoading}
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec hover:text-app-gold transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Registration Only: Confirm Password */}
            {view === 'register' && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="تأكيد كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 bg-app-bg border border-app-card rounded-2xl outline-none focus:border-app-gold text-right pr-12 pl-12 text-app-text font-medium"
                  dir="ltr"
                  disabled={isLoading}
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl animate-scaleIn">
                {error}
              </div>
            )}

            {/* Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-app-gold active:bg-app-goldDark text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                view === 'register' ? 'تسجيل حساب جديد' : 'تسجيل الدخول'
              )}
            </button>

          </form>

          {/* Toggle View Link */}
          <div className="mt-6 text-center">
            {view === 'register' ? (
              <button
                onClick={() => {
                  setView('login');
                  setError('');
                  setName('');
                  setPhone('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-app-textSec hover:text-app-gold font-medium transition-colors"
                disabled={isLoading}
              >
                إذا لديكي حساب <span className="font-bold underline decoration-app-gold/50 text-red-400">سجلي دخولك</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setView('register');
                  setError('');
                  setName('');
                  setPhone('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-app-textSec hover:text-app-gold font-medium transition-colors"
                disabled={isLoading}
              >
                ليس لديكي حساب <span className="font-bold underline decoration-app-gold/50 text-red-400">سجلي حساب جديد</span>
              </button>
            )}
          </div>

        </div>

        <div className="mt-8">
          <span className="text-[10px] text-app-textSec opacity-50">Powered by raiyansoft</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;