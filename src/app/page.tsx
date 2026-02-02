'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'TripTalk은 무료인가요?',
    answer: '네, TripTalk은 완전 무료입니다. 로그인 없이 바로 AI와 대화하며 여행 일정을 만들 수 있어요.',
  },
  {
    question: '어떤 여행지를 지원하나요?',
    answer: '일본(도쿄, 오사카, 교토 등), 동남아(방콕, 발리, 다낭 등), 유럽(파리, 런던, 바르셀로나), 미국(뉴욕, LA, 하와이) 등 전 세계 인기 여행지를 지원합니다.',
  },
  {
    question: '만든 일정을 공유할 수 있나요?',
    answer: '네, 생성된 여행 일정은 고유 링크가 부여되어 가족, 친구에게 손쉽게 공유할 수 있습니다. 앱 설치 없이 브라우저에서 바로 확인 가능합니다.',
  },
  {
    question: 'AI가 추천하는 정보는 정확한가요?',
    answer: 'TripTalk은 구조화된 현지 데이터베이스를 기반으로 운영시간, 입장료, 교통편, 맛집 등 검증된 정보를 제공합니다. 다만 현지 사정에 따라 달라질 수 있으니 방문 전 최종 확인을 권장합니다.',
  },
];

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TripTalk',
  url: 'https://www.triptalk.me',
  description: 'AI와 대화하면서 여행을 기획하고, 공유 가능한 웹 일정 페이지를 자동 생성하세요.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.triptalk.me',
    'query-input': 'required name=destination',
  },
};

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TripTalk',
  url: 'https://www.triptalk.me',
  logo: 'https://www.triptalk.me/icon.png',
  description: 'AI 기반 여행 일정 플래너',
};

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const DESTINATIONS = [
  // 일본
  { name: '도쿄', nameLocal: '東京', emoji: '🗼', desc: '전통과 첨단이 공존하는 대도시' },
  { name: '오사카', nameLocal: '大阪', emoji: '🐙', desc: '먹거리 천국, 쿠이다오레의 도시' },
  { name: '교토', nameLocal: '京都', emoji: '⛩️', desc: '천년 고도의 사찰과 마차' },
  { name: '후쿠오카', nameLocal: '福岡', emoji: '🍜', desc: '돈코츠 라멘과 야타이의 도시' },
  { name: '삿포로', nameLocal: '札幌', emoji: '❄️', desc: '라멘과 눈축제의 도시' },
  { name: '가나자와', nameLocal: '金沢', emoji: '🏯', desc: '전통과 현대의 우아한 조화' },
  { name: '고베', nameLocal: '神戸', emoji: '🥩', desc: '와규와 1000만 달러 야경' },
  { name: '가고시마', nameLocal: '鹿児島', emoji: '🌋', desc: '화산과 흑돼지의 남국' },
  { name: '히로시마', nameLocal: '広島', emoji: '☮️', desc: '평화와 미야지마의 감동' },
  // 동남아
  { name: '방콕', nameLocal: 'กรุงเทพ', emoji: '🛕', desc: '사원과 야시장의 매력적인 혼돈' },
  { name: '발리', nameLocal: 'Bali', emoji: '🌴', desc: '자연과 영성의 열대 낙원' },
  { name: '다낭', nameLocal: 'Đà Nẵng', emoji: '🏖️', desc: '해변과 골든브릿지의 도시' },
  { name: '싱가포르', nameLocal: 'Singapore', emoji: '🦁', desc: '깨끗한 다문화 미식 천국' },
  // 미주
  { name: '뉴욕', nameLocal: 'New York', emoji: '🗽', desc: '잠들지 않는 세계의 수도' },
  { name: '하와이', nameLocal: 'Hawaiʻi', emoji: '🌺', desc: '알로하 정신의 열대 파라다이스' },
  { name: 'LA', nameLocal: 'Los Angeles', emoji: '🎬', desc: '할리우드와 해변의 도시' },
  // 유럽
  { name: '파리', nameLocal: 'Paris', emoji: '🗼', desc: '예술과 낭만의 빛의 도시' },
  { name: '런던', nameLocal: 'London', emoji: '🎡', desc: '전통과 트렌드의 왕실 도시' },
  { name: '바르셀로나', nameLocal: 'Barcelona', emoji: '🏗️', desc: '가우디의 지중해 도시' },
];

export default function LandingPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const startTrip = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/trips', { method: 'POST' });
      const trip = await res.json();
      router.push(`/chat/${trip.id}`);
    } catch {
      setIsCreating(false);
      toast.error('오류가 발생했어요. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-100/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TripTalk</span>
          </div>
          <Button variant="ghost" size="sm" onClick={startTrip} disabled={isCreating}>
            시작하기 <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section aria-label="히어로" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-white border border-violet-100 rounded-full px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                AI 여행 플래너
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.15] tracking-tight"
            >
              대화하면 완성되는
              <br />
              <span className="gradient-text">나만의 여행 일정</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed"
            >
              AI와 대화하며 여행을 기획하고,
              <br className="hidden sm:block" />
              공유 가능한 웹 일정을 자동으로 만들어보세요.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Button
                size="lg"
                onClick={startTrip}
                disabled={isCreating}
                className="group shadow-xl shadow-gray-900/10 text-lg font-semibold gap-3"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    준비 중...
                  </>
                ) : (
                  <>
                    여행 계획 시작하기
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section aria-label="사용 방법" className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-14"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold text-violet-600 mb-2">HOW IT WORKS</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-gray-900 tracking-tight">
            4단계로 완성하는 여행
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-4 gap-6"
        >
          {[
            {
              icon: <MessageCircle className="w-5 h-5" />,
              title: '대화하기',
              desc: '여행지, 일정, 취향을 자연스럽게 대화로 전달',
              gradient: 'from-violet-500 to-purple-500',
            },
            {
              icon: <Globe className="w-5 h-5" />,
              title: '맞춤 추천',
              desc: '맛집, 관광지, 이동 경로를 AI가 큐레이션',
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              icon: <Calendar className="w-5 h-5" />,
              title: '일정 생성',
              desc: '시간대별로 정리된 완성형 일정 자동 생성',
              gradient: 'from-emerald-500 to-teal-500',
            },
            {
              icon: <Share2 className="w-5 h-5" />,
              title: '공유하기',
              desc: '링크 하나로 동행자에게 일정을 공유',
              gradient: 'from-orange-500 to-rose-500',
            },
          ].map((item, i) => (
            <motion.div key={i} variants={staggerItem} className="relative group">
              <Card className="p-6 h-full hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4`}>
                  {item.icon}
                </div>
                <span className="absolute top-4 right-4 text-xs font-bold text-gray-200">0{i + 1}</span>
                <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Destination showcase */}
      <section aria-label="여행지" className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold text-violet-600 mb-2">DESTINATIONS</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-gray-900 tracking-tight">
              전 세계 인기 여행지
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 mt-3 max-w-md mx-auto">
              일본, 동남아, 미주, 유럽까지. AI와 함께 나만의 여행을 기획해보세요.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {DESTINATIONS.map((dest) => (
              <motion.button
                key={dest.name}
                variants={staggerItem}
                whileHover={{ y: -2 }}
                onClick={startTrip}
                disabled={isCreating}
                className="group text-left"
              >
                <Card className="p-5 h-full hover:bg-violet-50 hover:border-violet-200 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{dest.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-gray-400">{dest.nameLocal}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{dest.desc}</p>
                </Card>
              </motion.button>
            ))}
            <motion.div variants={staggerItem}>
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 p-5 flex items-center justify-center text-center h-full">
                <CardContent className="p-0">
                  <MapPin className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-violet-700">더 많은 도시</p>
                  <p className="text-xs text-violet-400 mt-1">계속 추가 중!</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section aria-label="주요 기능" className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-5"
        >
          {[
            { icon: <Sparkles className="w-5 h-5" />, iconBg: 'bg-violet-50 text-violet-600', title: '맥락을 이해하는 대화', desc: '한꺼번에 다 물어보지 않아요. 대화 흐름에 맞춰 자연스럽게 여행 계획을 완성해갑니다.' },
            { icon: <MapPin className="w-5 h-5" />, iconBg: 'bg-blue-50 text-blue-600', title: '구조화된 현지 지식', desc: '운영시간, 입장료, 교통편, 현지 맛집까지 사전 검증된 데이터 기반 추천을 제공합니다.' },
            { icon: <Clock className="w-5 h-5" />, iconBg: 'bg-emerald-50 text-emerald-600', title: '실시간 스트리밍 응답', desc: '기다림 없이 AI의 답변이 실시간으로 화면에 나타납니다. 자연스러운 대화 경험.' },
            { icon: <Share2 className="w-5 h-5" />, iconBg: 'bg-orange-50 text-orange-600', title: '링크로 간편 공유', desc: '가족, 친구에게 링크만 보내면 끝. 앱 없이 브라우저에서 바로 확인할 수 있어요.' },
          ].map((item, i) => (
            <motion.div key={i} variants={staggerItem}>
              <Card className="p-7 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <section aria-label="자주 묻는 질문" className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold text-violet-600 mb-2">FAQ</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-gray-900 tracking-tight">
              자주 묻는 질문
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid gap-5 max-w-3xl mx-auto"
          >
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
      <section aria-label="시작하기" className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 md:p-14 text-center"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                지금 바로 여행을 기획해보세요
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                로그인 없이, 비용 없이. AI와 대화만으로 완벽한 여행 일정을 만들 수 있어요.
              </p>
              <Button
                size="lg"
                variant="outline"
                onClick={startTrip}
                disabled={isCreating}
                className="group bg-white text-gray-900 border-0 hover:bg-gray-100 text-lg font-semibold gap-3"
              >
                {isCreating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    무료로 시작하기
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
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
          <p className="text-xs text-gray-400">대화하면 완성되는 여행 일정</p>
        </div>
      </footer>
    </div>
  );
}
