import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '개인정보처리방침 - TripTalk',
  description: 'TripTalk 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">개인정보처리방침</h1>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p className="text-gray-400 text-sm">최종 수정일: 2025년 1월</p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. 수집하는 정보</h2>
            <p>
              TripTalk(&quot;서비스&quot;)은 여행 일정 생성을 위해 사용자가 대화 중 입력한 여행 관련
              정보(목적지, 날짜, 인원, 취향 등)를 수집합니다. 별도의 회원가입이나 로그인은
              필요하지 않으며, 개인 식별 정보는 수집하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. 정보의 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>맞춤형 여행 일정 생성 및 추천</li>
              <li>서비스 품질 개선 및 오류 수정</li>
              <li>이용 통계 분석 (비식별 데이터)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. 쿠키 및 광고</h2>
            <p>
              본 서비스는 Google AdSense를 통한 광고를 게재할 수 있습니다. Google 및 제3자
              광고 네트워크는 쿠키를 사용하여 이전 웹사이트 방문 기록을 기반으로 관련성 높은
              광고를 표시할 수 있습니다.
            </p>
            <p>
              사용자는{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:text-violet-700 underline"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 비활성화할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. 데이터 보관 및 삭제</h2>
            <p>
              대화 내용과 생성된 일정 데이터는 서비스 제공을 위해 서버에 저장됩니다. 데이터는
              일정 기간 후 자동으로 삭제될 수 있으며, 사용자는 언제든지 데이터 삭제를 요청할
              수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. 제3자 제공</h2>
            <p>
              서비스는 여행 일정 생성을 위해 AI API 서비스(Anthropic, OpenAI)에 대화 내용을
              전송합니다. 이 외에 사용자 데이터를 제3자에게 제공하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">6. 문의</h2>
            <p>
              개인정보처리방침에 관한 문의사항이 있으시면 서비스 내 문의 기능을 통해
              연락해주세요.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
