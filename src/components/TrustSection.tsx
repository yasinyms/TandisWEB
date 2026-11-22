import React from 'react';
import { UserCheck, Star, Shield, Clock } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const pillars = [
    {
      icon: UserCheck,
      color: 'text-[#0a8387] bg-[#effcfb]',
      title: 'احراز هویت دو مرحله‌ای',
      desc: 'استعلام پروانه کسب، مدارک هویتی و تایید شماره تماس کلیه ارائه‌دهندگان خدمات و فروشندگان جهت حفظ امنیت کاربران.'
    },
    {
      icon: Star,
      color: 'text-amber-700 bg-amber-50',
      title: 'نظرسنجی و امتیاز واقعی',
      desc: 'ثبت نظر و امتیازدهی شفاف فقط توسط مشتریانی که تراکنش یا خدمت دریافت کرده‌اند، بدون امکان درج نظرات ساختگی.'
    },
    {
      icon: Shield,
      color: 'text-emerald-700 bg-emerald-50',
      title: 'معاملات امن و بی‌واسطه',
      desc: 'ارتباط مستقیم خریدار و فروشنده، امکان کارشناسی در محل و تنظیم رسمی پیش‌فاکتور بدون کارمزد اضافی.'
    },
    {
      icon: Clock,
      color: 'text-purple-700 bg-purple-50',
      title: 'پشتیبانی ۲۴ ساعته',
      desc: 'تیم پشتیبانی و حل اختلاف تندیس در ۷ روز هفته آماده پیگیری سفارش‌ها و استعلام شکایات شماست.'
    }
  ];

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center gap-2.5">
        <span className="w-1.5 h-6 bg-[#0a8387] rounded-full"></span>
        <h2 className="text-xl sm:text-2xl font-bold text-[#12292c]">
          چرا تندیس مطمئن‌ترین سامانه است؟
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-[#dfecec] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-full ${p.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#12292c] mb-2">{p.title}</h3>
                <p className="text-xs text-[#5f777b] leading-relaxed">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
