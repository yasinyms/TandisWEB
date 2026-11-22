import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  Loader2,
  Headset,
  CheckCheck,
} from 'lucide-react';

interface SupportChatWidgetProps {
  externalOpen?: boolean;
  onExternalClose?: () => void;
  isLoggedIn?: boolean;
}

type ChatStep = 'contact' | 'otp' | 'chat';

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  time: string;
}

const toEnglishDigits = (str: string) =>
  str
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

const getNowTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

export const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({
  externalOpen,
  onExternalClose,
  isLoggedIn = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [step, setStep] = useState<ChatStep>(isLoggedIn ? 'chat' : 'contact');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'admin',
      text: 'سلام! به بخش ارتباط مستقیم با مدیریت و پشتیبانی تندیس خوش آمدید. چطور می‌توانم کمکتان کنم؟',
      time: getNowTime(),
    },
  ]);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const effectiveStep: ChatStep = isLoggedIn ? 'chat' : step;

  useEffect(() => {
    if (isLoggedIn) {
      setStep('chat');
    } else {
      setStep('contact');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (externalOpen) {
      setIsOpen(true);
    }
  }, [externalOpen]);

  useEffect(() => {
    if (effectiveStep === 'chat' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, effectiveStep, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onExternalClose?.();
  };

  const handleToggle = () => {
    setIsHovered(false);
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const validateContact = () => {
    const cleanPhone = toEnglishDigits(phone).replace(/\D/g, '');
    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError('شماره موبایل معتبر وارد کنید (مثال: 09123456789)');
      return false;
    }
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('آدرس ایمیل معتبر وارد کنید');
      return false;
    }
    return true;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContact()) return;

    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setOtp(['', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 450);
  };

  const verifyOtpCode = (code: string) => {
    if (code.length < 4) {
      setError('کد ۴ رقمی را کامل وارد کنید');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('chat');
    }, 450);
  };

  const handleOtpChange = (index: number, value: string) => {
    const clean = toEnglishDigits(value).replace(/\D/g, '');
    if (!clean) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }
    const digit = clean[clean.length - 1];
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (error) setError('');

    if (index < 3) {
      otpRefs.current[index + 1]?.focus();
    } else if (next.every((d) => d !== '')) {
      verifyOtpCode(next.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      time: getNowTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessageInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'admin',
          text: 'پیام شما ثبت شد. همکاران ما در تیم مدیریت بررسی کرده و همین‌جا یا از طریق شماره و ایمیل ثبت‌شده پاسخگوی شما خواهند بود.',
          time: getNowTime(),
        },
      ]);
    }, 1100);
  };

  return (
    <div dir="rtl" className="fixed bottom-20 lg:bottom-5 left-4 lg:left-5 z-[95] w-13 h-13">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-16 left-0 w-[calc(100vw-2rem)] max-w-[340px] sm:w-[360px] sm:max-w-none bg-white rounded-3xl shadow-[0_24px_60px_-15px_rgba(18,41,44,0.22)] border border-[#e2eef0] overflow-hidden origin-bottom-left"
          >
            <div className="flex items-center justify-between px-5 py-4 bg-[#0b5c60] text-white">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Headset className="w-4 h-4 text-[#f2a900]" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#f2a900] ring-2 ring-[#0b5c60]" />
                </div>
                <div>
                  <h3 className="text-xs font-black">پشتیبانی و مدیریت سایت</h3>
                  <p className="text-[11px] text-[#cbe6e8]">پاسخگویی آنلاین</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="بستن چت"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#cbe6e8] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {effectiveStep === 'contact' && (
                  <motion.form
                    key="contact"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    onSubmit={handleContactSubmit}
                    className="space-y-3.5"
                  >
                    <p className="text-xs text-[#5f777b] leading-relaxed">
                      برای شروع گفتگو با مدیر سایت، شماره موبایل و ایمیل خود را وارد کنید.
                    </p>

                    <div className="space-y-2.5">
                      <input
                        type="tel"
                        inputMode="numeric"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => {
                          const v = toEnglishDigits(e.target.value).replace(/\D/g, '');
                          if (v.length <= 11) {
                            setPhone(v);
                            if (error) setError('');
                          }
                        }}
                        placeholder="شماره موبایل (0912...)"
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f9f9]/70 border border-[#d8eaec] text-xs font-bold text-[#12292c] placeholder:text-[#94aeb2] placeholder:font-normal focus:outline-none focus:bg-white focus:border-[#0a8387] transition-all text-left"
                      />

                      <input
                        type="email"
                        dir="ltr"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="ایمیل (example@mail.com)"
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f9f9]/70 border border-[#d8eaec] text-xs font-bold text-[#12292c] placeholder:text-[#94aeb2] placeholder:font-normal focus:outline-none focus:bg-white focus:border-[#0a8387] transition-all text-left"
                      />
                    </div>

                    {error && (
                      <p className="text-[11px] font-medium text-red-500 text-center">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !phone || !email}
                      className="w-full h-11 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:bg-[#f2f9f9] disabled:text-[#94aeb2] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>دریافت کد تایید</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {effectiveStep === 'otp' && (
                  <motion.form
                    key="otp"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      verifyOtpCode(otp.join(''));
                    }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#12292c] font-medium">
                        کد تایید ۴ رقمی را وارد کنید
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('contact');
                          setError('');
                        }}
                        className="text-[11px] font-bold text-[#0a8387] hover:text-[#0b5c60] cursor-pointer"
                      >
                        ویرایش اطلاعات
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2.5" dir="ltr">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-12 h-12 rounded-xl bg-[#f2f9f9]/70 border border-[#d8eaec] text-center text-base font-black text-[#12292c] focus:outline-none focus:bg-white focus:border-[#0a8387] transition-all"
                        />
                      ))}
                    </div>

                    {error && (
                      <p className="text-[11px] font-medium text-red-500 text-center">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || otp.some((d) => !d)}
                      className="w-full h-11 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:bg-[#f2f9f9] disabled:text-[#94aeb2] text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>تایید و شروع گفتگو</span>
                      )}
                    </button>
                  </motion.form>
                )}

                {effectiveStep === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col h-[310px] -m-5"
                  >
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f2f9f9]/70">
                      {messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex flex-col ${
                              isUser ? 'items-start' : 'items-end'
                            }`}
                          >
                            <div
                              className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                isUser
                                  ? 'bg-[#0b5c60] text-white rounded-br-xs'
                                  : 'bg-white text-[#12292c] border border-[#e2eef0] shadow-2xs rounded-bl-xs'
                              }`}
                            >
                              {msg.text}
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-[#5f777b]">
                              <span>{msg.time}</span>
                              {isUser && <CheckCheck className="w-3 h-3 text-[#0a8387]" />}
                            </div>
                          </motion.div>
                        );
                      })}

                      {isTyping && (
                        <div className="flex justify-end">
                          <div className="bg-white border border-[#e2eef0] px-3.5 py-2.5 rounded-2xl rounded-bl-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0a8387] animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0a8387] animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0a8387] animate-bounce [animation-delay:0.3s]" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 bg-white border-t border-[#e2eef0] flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="پیام خود را بنویسید..."
                        className="flex-1 h-10 px-3.5 rounded-xl bg-[#f2f9f9]/80 text-xs text-[#12292c] placeholder:text-[#94aeb2] focus:outline-none focus:bg-[#e8f4f5] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        aria-label="ارسال پیام"
                        className="w-10 h-10 rounded-xl bg-[#0b5c60] hover:bg-[#0a8387] disabled:bg-[#f2f9f9] disabled:text-[#94aeb2] text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Quick-Access Circular Buttons: WhatsApp, Telegram, Rubika */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex flex-col items-center"
      >
        <AnimatePresence>
          {!isOpen && isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-full left-0 pb-3 flex flex-col items-center gap-2.5"
            >
              {/* Rubika */}
              <motion.a
                href="https://rubika.ir/tandis_support"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 14, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24, delay: 0.08 }}
                aria-label="پشتیبانی روبیکا"
                className="group relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#5B21B6] via-[#9333EA] to-[#EC4899] text-white shadow-[0_8px_20px_rgba(147,51,234,0.38)] hover:scale-110 flex items-center justify-center transition-transform cursor-pointer ring-2 ring-white"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 2L4.5 6.5v11L12 22l7.5-4.5v-11L12 2zm0 2.3l5.2 3.1L12 10.5 6.8 7.4 12 4.3zm-5.5 4.9l4.5 2.7v6.2l-4.5-2.7V9.2zm6.5 8.9v-6.2l4.5-2.7v6.2l-4.5 2.7z" />
                </svg>
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-[#12292c] text-white text-[10px] font-bold whitespace-nowrap shadow-md">
                  روبیکا
                </span>
              </motion.a>

              {/* Telegram */}
              <motion.a
                href="https://t.me/tandis_support"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 14, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24, delay: 0.04 }}
                aria-label="پشتیبانی تلگرام"
                className="group relative w-11 h-11 rounded-full bg-[#229ED9] text-white shadow-[0_8px_20px_rgba(34,158,217,0.4)] hover:scale-110 flex items-center justify-center transition-transform cursor-pointer ring-2 ring-white"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current -ml-0.5">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-[#12292c] text-white text-[10px] font-bold whitespace-nowrap shadow-md">
                  تلگرام
                </span>
              </motion.a>

              {/* WhatsApp */}
              <motion.a
                href="https://wa.me/989120000000"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 14, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24, delay: 0 }}
                aria-label="پشتیبانی واتساپ"
                className="group relative w-11 h-11 rounded-full bg-[#25D366] text-white shadow-[0_8px_20px_rgba(37,211,102,0.4)] hover:scale-110 flex items-center justify-center transition-transform cursor-pointer ring-2 ring-white"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.359 5.016L2 22l5.156-1.359c1.484.813 3.156 1.25 4.875 1.25 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.125c-.25.703-1.453 1.344-2.016 1.422-.516.078-1.172.109-1.891-.125-.438-.141-1-.328-1.719-.641-3.031-1.313-5.016-4.375-5.172-4.578-.156-.203-1.234-1.641-1.234-3.125s.781-2.219 1.063-2.516c.281-.297.609-.375.813-.375.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.328.031.531-.094.203-.141.328-.297.5-.156.172-.313.391-.453.531-.156.156-.313.313-.141.609.172.297.781 1.281 1.672 2.078 1.156 1.031 2.125 1.344 2.422 1.5.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.156.266.094 1.703.813 2 .953.297.141.484.219.563.344.078.125.078.734-.172 1.438z" />
                </svg>
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-[#12292c] text-white text-[10px] font-bold whitespace-nowrap shadow-md">
                  واتساپ
                </span>
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleToggle}
          aria-label="گفتگو با پشتیبانی"
          className="w-13 h-13 rounded-2xl bg-[#0b5c60] hover:bg-[#0a8387] text-white shadow-[0_12px_28px_-6px_rgba(11,92,96,0.55)] flex items-center justify-center transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
