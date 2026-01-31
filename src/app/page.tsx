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
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Plane className="w-4 h-4" />
          AI 여행 플래너
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          대화하면 완성되는
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
            여행 일정
          </span>
        </h1>

        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          AI와 대화하면서 여행을 기획하고,
          <br />
          공유 가능한 웹 일정 페이지를 자동으로 만들어보세요.
        </p>

        <button
          onClick={startTrip}
          disabled={isCreating}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-70 shadow-lg shadow-violet-500/25"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              준비 중...
            </>
          ) : (
            <>
              여행 계획 시작하기
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          이렇게 쉬워요
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              icon: <MessageCircle className="w-6 h-6" />,
              title: '대화하기',
              desc: '어디로 가고 싶은지, 누구와 가는지 편하게 대화하세요',
              step: '1',
            },
            {
              icon: <Globe className="w-6 h-6" />,
              title: '정보 검색',
              desc: 'AI가 맛집, 관광지, 이동 경로를 자동으로 찾아요',
              step: '2',
            },
            {
              icon: <Calendar className="w-6 h-6" />,
              title: '일정 생성',
              desc: '시간대별로 정리된 깔끔한 여행 일정이 만들어져요',
              step: '3',
            },
            {
              icon: <Share2 className="w-6 h-6" />,
              title: '공유하기',
              desc: '링크 하나로 동행자에게 일정을 공유하세요',
              step: '4',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="relative inline-flex mb-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              맥락을 이해하는 대화
            </h3>
            <p className="text-sm text-gray-500">
              한꺼번에 다 물어보지 않아요. 대화 흐름에 맞춰
              자연스럽게 여행 계획을 완성해갑니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              실시간 정보 기반 추천
            </h3>
            <p className="text-sm text-gray-500">
              운영시간, 리뷰, 이동시간 등 실제 정보를 기반으로
              현실적인 일정을 제안합니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              모바일에서도 보기 좋은 일정
            </h3>
            <p className="text-sm text-gray-500">
              여행 중에도 스마트폰으로 편하게 확인할 수 있는
              깔끔한 웹 페이지를 생성합니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              링크 하나로 간편 공유
            </h3>
            <p className="text-sm text-gray-500">
              가족, 친구에게 링크만 보내면 끝.
              별도 앱 설치 없이 바로 확인 가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          지금 바로 시작하세요
        </h2>
        <p className="text-gray-500 mb-6">로그인 필요 없이 바로 여행 계획을 시작할 수 있어요.</p>
        <button
          onClick={startTrip}
          disabled={isCreating}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
        >
          {isCreating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>TripTalk - 대화하면 완성되는 여행 일정</p>
        </div>
      </footer>
    </div>
  );
}
