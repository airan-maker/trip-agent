'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const DESTINATIONS = [
  { name: '가나자와', nameJa: '金沢', emoji: '🏯', desc: '전통과 현대의 우아한 조화' },
  { name: '삿포로', nameJa: '札幌', emoji: '🍜', desc: '라멘과 눈축제의 도시' },
  { name: '고베', nameJa: '神戸', emoji: '🥩', desc: '와규와 1000만 달러 야경' },
  { name: '가고시마', nameJa: '鹿児島', emoji: '🌋', desc: '화산과 흑돼지의 남국' },
  { name: '히로시마', nameJa: '広島', emoji: '⛩️', desc: '평화와 미야지마의 감동' },
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
      alert('오류가 발생했어요. 다시 시도해주세요.');
    }
  };

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
          <button
            onClick={startTrip}
            disabled={isCreating}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1"
          >
            시작하기 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white border border-violet-100 rounded-full px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI 여행 플래너
            </div>
          </div>

          <h1 className="animate-fade-in-up text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.15] tracking-tight" style={{ animationDelay: '80ms' }}>
            대화하면 완성되는
            <br />
            <span className="gradient-text">나만의 여행 일정</span>
          </h1>

          <p className="animate-fade-in-up text-lg md:text-xl text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed" style={{ animationDelay: '160ms' }}>
            AI와 대화하며 여행을 기획하고,
            <br className="hidden sm:block" />
            공유 가능한 웹 일정을 자동으로 만들어보세요.
          </p>

          <div className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <button
              onClick={startTrip}
              disabled={isCreating}
              className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-60 shadow-xl shadow-gray-900/10"
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
            </button>
            <p className="text-xs text-gray-400 mt-4">로그인 없이 바로 시작</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-violet-600 mb-2">HOW IT WORKS</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            4단계로 완성하는 여행
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 stagger-children">
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
            <div key={i} className="relative group">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 card-hover h-full">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4`}>
                  {item.icon}
                </div>
                <span className="absolute top-4 right-4 text-xs font-bold text-gray-200">0{i + 1}</span>
                <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Destination showcase */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-violet-600 mb-2">DESTINATIONS</p>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              일본 소도시 여행 전문
            </h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              관광객이 몰리지 않는 매력적인 일본 소도시들을 AI와 함께 기획해보세요.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                onClick={startTrip}
                disabled={isCreating}
                className="group text-left bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 rounded-2xl p-5 transition-all card-hover"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{dest.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-gray-400">{dest.nameJa}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{dest.desc}</p>
              </button>
            ))}
            <div className="flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5 text-center">
              <div>
                <MapPin className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-violet-700">더 많은 도시</p>
                <p className="text-xs text-violet-400 mt-1">계속 추가 중!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-7 card-hover">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">맥락을 이해하는 대화</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              한꺼번에 다 물어보지 않아요. 대화 흐름에 맞춰 자연스럽게 여행 계획을 완성해갑니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-7 card-hover">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">구조화된 현지 지식</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              운영시간, 입장료, 교통편, 현지 맛집까지 사전 검증된 데이터 기반 추천을 제공합니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-7 card-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">실시간 스트리밍 응답</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              기다림 없이 AI의 답변이 실시간으로 화면에 나타납니다. 자연스러운 대화 경험.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-7 card-hover">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">링크로 간편 공유</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              가족, 친구에게 링크만 보내면 끝. 앱 없이 브라우저에서 바로 확인할 수 있어요.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 md:p-14 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                지금 바로 여행을 기획해보세요
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                로그인 없이, 비용 없이. AI와 대화만으로 완벽한 여행 일정을 만들 수 있어요.
              </p>
              <button
                onClick={startTrip}
                disabled={isCreating}
                className="group inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                {isCreating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    무료로 시작하기
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
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
