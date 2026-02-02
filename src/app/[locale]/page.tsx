'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Plane,
  MessageCircle,
  Globe,
  Calendar,
  Share2,
  ArrowRight,
  Loader2,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const DESTINATIONS = [
  { name: '도쿄', nameLocal: '東京', emoji: '🗼', desc: 'Tokyo' },
  { name: '오사카', nameLocal: '大阪', emoji: '🐙', desc: 'Osaka' },
  { name: '교토', nameLocal: '京都', emoji: '⛩️', desc: 'Kyoto' },
  { name: '후쿠오카', nameLocal: '福岡', emoji: '🍜', desc: 'Fukuoka' },
  { name: '삿포로', nameLocal: '札幌', emoji: '❄️', desc: 'Sapporo' },
  { name: '가나자와', nameLocal: '金沢', emoji: '🏯', desc: 'Kanazawa' },
  { name: '고베', nameLocal: '神戸', emoji: '🥩', desc: 'Kobe' },
  { name: '가고시마', nameLocal: '鹿児島', emoji: '🌋', desc: 'Kagoshima' },
  { name: '히로시마', nameLocal: '広島', emoji: '☮️', desc: 'Hiroshima' },
  { name: '방콕', nameLocal: 'กรุงเทพ', emoji: '🛕', desc: 'Bangkok' },
  { name: '발리', nameLocal: 'Bali', emoji: '🌴', desc: 'Bali' },
  { name: '다낭', nameLocal: 'Đà Nẵng', emoji: '🏖️', desc: 'Da Nang' },
  { name: '싱가포르', nameLocal: 'Singapore', emoji: '🦁', desc: 'Singapore' },
  { name: '뉴욕', nameLocal: 'New York', emoji: '🗽', desc: 'New York' },
  { name: '하와이', nameLocal: 'Hawaiʻi', emoji: '🌺', desc: 'Hawaii' },
  { name: 'LA', nameLocal: 'Los Angeles', emoji: '🎬', desc: 'Los Angeles' },
  { name: '파리', nameLocal: 'Paris', emoji: '🗼', desc: 'Paris' },
  { name: '런던', nameLocal: 'London', emoji: '🎡', desc: 'London' },
  { name: '바르셀로나', nameLocal: 'Barcelona', emoji: '🏗️', desc: 'Barcelona' },
];

export default function LandingPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('landing');
  const [isCreating, setIsCreating] = useState(false);

  const startTrip = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/trips', { method: 'POST' });
      const trip = await res.json();
      router.push(`/${locale}/chat/${trip.id}`);
    } catch {
      setIsCreating(false);
      toast.error(t('errorToast'));
    }
  };

  const FAQ_ITEMS = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
  ];

  const STEPS = [
    { icon: <MessageCircle className="w-5 h-5" />, title: t('step1Title'), desc: t('step1Desc'), gradient: 'from-violet-500 to-purple-500' },
    { icon: <Globe className="w-5 h-5" />, title: t('step2Title'), desc: t('step2Desc'), gradient: 'from-blue-500 to-cyan-500' },
    { icon: <Calendar className="w-5 h-5" />, title: t('step3Title'), desc: t('step3Desc'), gradient: 'from-emerald-500 to-teal-500' },
    { icon: <Share2 className="w-5 h-5" />, title: t('step4Title'), desc: t('step4Desc'), gradient: 'from-orange-500 to-rose-500' },
  ];

  const FEATURES = [
    { icon: <Sparkles className="w-5 h-5" />, iconBg: 'bg-violet-50 text-violet-600', title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: <MapPin className="w-5 h-5" />, iconBg: 'bg-blue-50 text-blue-600', title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: <Clock className="w-5 h-5" />, iconBg: 'bg-emerald-50 text-emerald-600', title: t('feature3Title'), desc: t('feature3Desc') },
    { icon: <Share2 className="w-5 h-5" />, iconBg: 'bg-orange-50 text-orange-600', title: t('feature4Title'), desc: t('feature4Desc') },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-100/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TripTalk</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={startTrip} disabled={isCreating}>
              {t('startButton')} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-200/30 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-white border border-violet-100 rounded-full px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                {t('badge')}
              </div>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.15] tracking-tight">
              {t('heroTitle1')}<br />
              <span className="gradient-text">{t('heroTitle2')}</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed whitespace-pre-line">
              {t('heroDescription')}
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button size="lg" onClick={startTrip} disabled={isCreating} className="group shadow-xl shadow-gray-900/10 text-lg font-semibold gap-3">
                {isCreating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{t('preparing')}</>
                ) : (
                  <>{t('startButton')}<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
          <motion.p variants={fadeInUp} className="text-sm font-semibold text-violet-600 mb-2">{t('howItWorks')}</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-gray-900 tracking-tight">{t('howItWorksTitle')}</motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid md:grid-cols-4 gap-6">
          {STEPS.map((item, i) => (
            <motion.div key={i} variants={staggerItem} className="relative group">
              <Card className="p-6 h-full hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4`}>{item.icon}</div>
                <span className="absolute top-4 right-4 text-xs font-bold text-gray-200">0{i + 1}</span>
                <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Destination showcase */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.p variants={fadeInUp} className="text-sm font-semibold text-violet-600 mb-2">{t('destinations')}</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-gray-900 tracking-tight">{t('destinationsTitle')}</motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 mt-3 max-w-md mx-auto">{t('destinationsDesc')}</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {DESTINATIONS.map((dest) => (
              <motion.button key={dest.name} variants={staggerItem} whileHover={{ y: -2 }} onClick={startTrip} disabled={isCreating} className="group text-left">
                <Card className="p-5 h-full hover:bg-violet-50 hover:border-violet-200 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{dest.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{dest.desc}</h3>
                      <p className="text-xs text-gray-400">{dest.nameLocal}</p>
                    </div>
                  </div>
                </Card>
              </motion.button>
            ))}
            <motion.div variants={staggerItem}>
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 p-5 flex items-center justify-center text-center h-full">
                <CardContent className="p-0">
                  <MapPin className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-violet-700">{t('moreCities')}</p>
                  <p className="text-xs text-violet-400 mt-1">{t('moreCitiesSub')}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((item, i) => (
            <motion.div key={i} variants={staggerItem}>
              <Card className="p-7 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.p variants={fadeInUp} className="text-sm font-semibold text-violet-600 mb-2">{t('faq')}</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-gray-900 tracking-tight">{t('faqTitle')}</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid gap-5 max-w-3xl mx-auto">
            {FAQ_ITEMS.map((item, i) => (
              <motion.article key={i} variants={staggerItem}>
                <Card className="p-7">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{item.question}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </Card>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 md:p-14 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{t('ctaTitle')}</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">{t('ctaDesc')}</p>
              <Button size="lg" variant="outline" onClick={startTrip} disabled={isCreating} className="group bg-white text-gray-900 border-0 hover:bg-gray-100 text-lg font-semibold gap-3">
                {isCreating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>{t('ctaButton')}<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Plane className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">TripTalk</span>
          </div>
          <p className="text-xs text-gray-400">{t('footerTagline')}</p>
        </div>
      </footer>
    </div>
  );
}
