/**
 * Japan Small Cities Knowledge Ontology
 *
 * Palantir-style structured ontology for Japanese small city travel.
 * Pre-structured knowledge enables the AI agent to give
 * precise, context-aware recommendations without web search.
 *
 * Entity types:
 *   City → has Areas → has Places
 *   City → has FoodSpecialties
 *   City → has SeasonalEvents
 *   City → connected via TransportLinks
 */

// ─── Entity Types ──────────────────────────────────────

export interface CityProfile {
  id: string;
  name: string;
  nameJa: string;
  prefecture: string;
  region: string;
  description: string;
  character: string; // one-line vibe
  bestSeasons: Season[];
  averageStay: string; // e.g. "1~2일"
  budgetPerDay: { economy: string; mid: string; premium: string };
  areas: Area[];
  foods: FoodSpecialty[];
  events: SeasonalEvent[];
  transportFromTokyo: TransportOption;
  transportFromOsaka: TransportOption;
  neighborCities: NeighborLink[];
  travelTips: string[];
  tags: string[];
}

export interface Area {
  name: string;
  nameJa: string;
  description: string;
  walkable: boolean;
  timeNeeded: string;
  places: PlaceKnowledge[];
}

export interface PlaceKnowledge {
  name: string;
  nameJa: string;
  category: PlaceCategory;
  description: string;
  mustVisit: boolean;
  hours?: string;
  closedDay?: string;
  admission?: string;
  duration: string;
  bestTime?: string;
  latitude: number;
  longitude: number;
  rating: number;
  tips?: string;
}

export interface FoodSpecialty {
  name: string;
  nameJa: string;
  description: string;
  priceRange: string;
  mustTry: boolean;
  bestSpots: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'any';
}

export interface SeasonalEvent {
  name: string;
  nameJa: string;
  period: string;
  description: string;
  highlight: string;
}

export interface TransportOption {
  method: string;
  duration: string;
  cost: string;
  tips?: string;
}

export interface NeighborLink {
  cityId: string;
  cityName: string;
  transport: string;
  duration: string;
  dayTripViable: boolean;
}

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
type PlaceCategory = '관광지' | '맛집' | '카페' | '쇼핑' | '체험' | '숙소' | '이동' | '자연' | '신사/사찰';

// ─── City Data ─────────────────────────────────────────

export const JAPAN_CITIES: CityProfile[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KANAZAWA (金沢)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'kanazawa',
    name: '가나자와',
    nameJa: '金沢',
    prefecture: '이시카와현',
    region: '호쿠리쿠',
    description: '에도 시대의 풍경이 살아 숨 쉬는 북륙의 교토. 전통 공예, 정원, 해산물의 도시.',
    character: '전통과 현대가 공존하는 우아한 소도시',
    bestSeasons: ['spring', 'autumn', 'winter'],
    averageStay: '2~3일',
    budgetPerDay: { economy: '8,000~12,000엔', mid: '15,000~25,000엔', premium: '30,000엔~' },
    areas: [
      {
        name: '히가시 차야가이',
        nameJa: '東茶屋街',
        description: '에도 시대 게이샤 문화가 남아 있는 전통 찻집 거리. 금박 아이스크림과 전통 카페.',
        walkable: true,
        timeNeeded: '1.5~2시간',
        places: [
          {
            name: '히가시 차야가이',
            nameJa: 'ひがし茶屋街',
            category: '관광지',
            description: '일본에서 가장 아름다운 게이샤 거리 중 하나. 목조 건물이 늘어선 운치 있는 골목.',
            mustVisit: true,
            hours: '상시 개방 (개별 상점 10:00~17:00)',
            duration: '1~1.5시간',
            latitude: 36.5725,
            longitude: 136.6637,
            rating: 4.6,
            tips: '오전 일찍 방문하면 한적하게 즐길 수 있어요.',
          },
          {
            name: '하쿠이치 금박 체험',
            nameJa: '箔一',
            category: '체험',
            description: '가나자와 명물 금박 공예 체험. 금박 소프트크림도 유명.',
            mustVisit: true,
            hours: '09:00~18:00',
            admission: '체험 500~1,200엔',
            duration: '30분~1시간',
            latitude: 36.5721,
            longitude: 136.6632,
            rating: 4.4,
          },
        ],
      },
      {
        name: '겐로쿠엔 주변',
        nameJa: '兼六園周辺',
        description: '일본 3대 정원 겐로쿠엔과 가나자와성을 중심으로 한 핵심 관광 에리어.',
        walkable: true,
        timeNeeded: '3~4시간',
        places: [
          {
            name: '겐로쿠엔',
            nameJa: '兼六園',
            category: '관광지',
            description: '일본 3대 정원. 사계절 다른 아름다움, 특히 겨울 유키즈리(눈매달기)가 장관.',
            mustVisit: true,
            hours: '07:00~18:00 (계절별 변동)',
            admission: '320엔',
            duration: '1.5~2시간',
            bestTime: '오전 7시 개장 직후',
            latitude: 36.5625,
            longitude: 136.6625,
            rating: 4.7,
            tips: '이른 아침 무료 입장 가능한 시간대가 있어요 (계절별 확인).',
          },
          {
            name: '가나자와성 공원',
            nameJa: '金沢城公園',
            category: '관광지',
            description: '마에다 가문의 거성. 이시카와몬 문이 상징적.',
            mustVisit: true,
            hours: '07:00~18:00',
            admission: '무료 (일부 건물 320엔)',
            duration: '1~1.5시간',
            latitude: 36.5636,
            longitude: 136.6592,
            rating: 4.5,
          },
          {
            name: '21세기 미술관',
            nameJa: '金沢21世紀美術館',
            category: '관광지',
            description: '레안드로 에를리치의 수영장 작품으로 유명한 현대미술관. SNS 핫스팟.',
            mustVisit: true,
            hours: '10:00~18:00 (금토 ~20:00)',
            closedDay: '월요일',
            admission: '일반 450엔~',
            duration: '1.5~2시간',
            latitude: 36.5607,
            longitude: 136.6584,
            rating: 4.5,
            tips: '수영장 작품은 사전 예약 필수! 무료 존도 충분히 즐길 수 있어요.',
          },
        ],
      },
      {
        name: '오미초 시장',
        nameJa: '近江町市場',
        description: '가나자와의 부엌. 신선한 해산물과 로컬 식재료의 보고.',
        walkable: true,
        timeNeeded: '1~2시간',
        places: [
          {
            name: '오미초 시장',
            nameJa: '近江町市場',
            category: '맛집',
            description: '300년 역사의 시장. 해산물 덮밥, 노도구로, 게 등 신선한 먹거리.',
            mustVisit: true,
            hours: '09:00~17:00 (식당별 상이)',
            duration: '1~1.5시간',
            latitude: 36.5714,
            longitude: 136.6567,
            rating: 4.5,
            tips: '점심시간엔 줄이 깁니다. 11시 전에 도착 추천!',
          },
        ],
      },
      {
        name: '나가마치 무사 저택',
        nameJa: '長町武家屋敷跡',
        description: '에도 시대 무사들의 주거지 거리. 토담길이 인상적.',
        walkable: true,
        timeNeeded: '1~1.5시간',
        places: [
          {
            name: '나가마치 부케야시키',
            nameJa: '長町武家屋敷跡',
            category: '관광지',
            description: '보존 상태 좋은 무사 저택 거리. 노무라 가문 저택 내부 관람 가능.',
            mustVisit: false,
            hours: '08:30~17:30',
            admission: '550엔',
            duration: '45분~1시간',
            latitude: 36.5634,
            longitude: 136.6505,
            rating: 4.3,
          },
        ],
      },
    ],
    foods: [
      { name: '노도구로 (아카무쓰)', nameJa: 'のどぐろ', description: '호쿠리쿠 대표 고급 생선. 회, 구이, 초밥 모두 일품.', priceRange: '3,000~8,000엔', mustTry: true, bestSpots: ['오미초 시장', '모리모리즈시'], mealType: 'any' },
      { name: '가나자와 카이센동', nameJa: '金沢海鮮丼', description: '신선한 해산물을 가득 올린 덮밥. 오미초 시장의 대표 메뉴.', priceRange: '1,500~3,500엔', mustTry: true, bestSpots: ['오미초 시장 이키이키테이', '다이와'], mealType: 'lunch' },
      { name: '하쿠잇치 금박 소프트크림', nameJa: '金箔ソフトクリーム', description: '가나자와 명물. 금박을 올린 소프트 아이스크림.', priceRange: '800~1,000엔', mustTry: true, bestSpots: ['하쿠이치 히가시야마점'], mealType: 'snack' },
      { name: '지부니', nameJa: '治部煮', description: '가나자와 향토 요리. 오리고기와 채소를 밀가루로 걸쭉하게 조린 요리.', priceRange: '1,000~2,000엔', mustTry: false, bestSpots: ['이타루', '오토메즈시'], mealType: 'dinner' },
    ],
    events: [
      { name: '겐로쿠엔 유키즈리', nameJa: '兼六園雪吊り', period: '11월 중순~3월 중순', description: '소나무에 눈 피해를 막기 위한 밧줄 매달기.', highlight: '눈 내린 겐로쿠엔은 일본에서 가장 아름다운 겨울 풍경 중 하나' },
      { name: '가나자와 백만석 축제', nameJa: '金沢百万石まつり', period: '6월 첫째 주말', description: '마에다 도시이에의 입성을 기념하는 축제.', highlight: '시대 행렬이 시내를 순회' },
    ],
    transportFromTokyo: { method: '호쿠리쿠 신칸센', duration: '약 2시간 30분', cost: '14,380엔 (지정석)', tips: '카가야키(최속) 이용 추천' },
    transportFromOsaka: { method: '특급 선더버드', duration: '약 2시간 40분', cost: '7,790엔' },
    neighborCities: [
      { cityId: 'takayama', cityName: '다카야마', transport: '고속버스', duration: '약 2시간 15분', dayTripViable: false },
      { cityId: 'shirakawago', cityName: '시라카와고', transport: '고속버스', duration: '약 1시간 15분', dayTripViable: true },
    ],
    travelTips: [
      '가나자와 주유버스(1일권 800엔)로 주요 관광지 순환 가능',
      '오미초 시장은 수요일·일요일 휴무 가게가 많으니 확인 필수',
      '21세기 미술관 수영장 작품은 사전 온라인 예약 필요',
      '겨울(12~2월)에 오면 노도구로, 가니(게) 시즌과 유키즈리를 동시에 즐길 수 있어요',
    ],
    tags: ['전통', '정원', '해산물', '공예', '미술관', '겨울추천'],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SAPPORO (札幌)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'sapporo',
    name: '삿포로',
    nameJa: '札幌',
    prefecture: '홋카이도',
    region: '홋카이도',
    description: '홋카이도의 중심 도시. 라멘, 맥주, 눈 축제의 도시. 자연과 도시가 조화.',
    character: '맛있는 음식과 시원한 자연의 활기찬 도시',
    bestSeasons: ['summer', 'winter'],
    averageStay: '2~3일',
    budgetPerDay: { economy: '8,000~12,000엔', mid: '15,000~22,000엔', premium: '30,000엔~' },
    areas: [
      {
        name: '오도리 공원·스스키노',
        nameJa: '大通公園・すすきの',
        description: '삿포로의 심장부. 오도리 공원을 중심으로 TV탑, 스스키노 유흥가까지.',
        walkable: true,
        timeNeeded: '2~3시간',
        places: [
          {
            name: '오도리 공원',
            nameJa: '大通公園',
            category: '관광지',
            description: '삿포로 중심에 1.5km 뻗은 공원. 눈축제, 라일락축제, 가을맥주축제 등 이벤트의 무대.',
            mustVisit: true,
            hours: '상시 개방',
            duration: '30분~1시간',
            latitude: 43.0596,
            longitude: 141.3545,
            rating: 4.3,
          },
          {
            name: '삿포로 TV탑',
            nameJa: 'さっぽろテレビ塔',
            category: '관광지',
            description: '오도리 공원 동쪽 끝의 랜드마크. 전망대에서 공원 전체 조망.',
            mustVisit: false,
            hours: '09:00~22:00',
            admission: '1,000엔',
            duration: '30분',
            latitude: 43.0607,
            longitude: 141.3567,
            rating: 4.0,
          },
          {
            name: '니조 시장',
            nameJa: '二条市場',
            category: '맛집',
            description: '100년 넘은 역사의 해산물 시장. 아침 해산물 덮밥이 인기.',
            mustVisit: true,
            hours: '07:00~18:00',
            duration: '1시간',
            latitude: 43.0578,
            longitude: 141.3570,
            rating: 4.2,
            tips: '아침식사 겸 방문 추천. 성게(우니) 덮밥이 일품.',
          },
        ],
      },
      {
        name: '삿포로역 주변',
        nameJa: '札幌駅周辺',
        description: 'JR타워, 백화점, 지하상가가 밀집한 상업 중심지.',
        walkable: true,
        timeNeeded: '2~3시간',
        places: [
          {
            name: '삿포로 맥주 박물관',
            nameJa: 'サッポロビール博物館',
            category: '체험',
            description: '일본 유일의 맥주 박물관. 시음 투어가 인기.',
            mustVisit: true,
            hours: '11:00~20:00',
            closedDay: '월요일',
            admission: '무료 (시음 투어 1,000엔)',
            duration: '1~1.5시간',
            latitude: 43.0655,
            longitude: 141.3668,
            rating: 4.3,
            tips: '프리미엄 투어(1,000엔)는 한정 맥주 시음 포함.',
          },
          {
            name: '삿포로 맥주원 징기스칸',
            nameJa: 'サッポロビール園',
            category: '맛집',
            description: '삿포로 맥주와 홋카이도 양고기 징기스칸을 함께 즐기는 삿포로 대표 미식.',
            mustVisit: true,
            hours: '11:30~22:00',
            duration: '1.5시간',
            latitude: 43.0658,
            longitude: 141.3673,
            rating: 4.4,
          },
        ],
      },
      {
        name: '마루야마 공원·홋카이도 신궁',
        nameJa: '円山公園・北海道神宮',
        description: '시내에서 가까운 자연 공간. 동물원, 신사, 산책로.',
        walkable: true,
        timeNeeded: '2~3시간',
        places: [
          {
            name: '홋카이도 신궁',
            nameJa: '北海道神宮',
            category: '신사/사찰',
            description: '홋카이도 최대 신사. 벚꽃과 단풍 명소.',
            mustVisit: false,
            hours: '06:00~17:00 (계절별 변동)',
            admission: '무료',
            duration: '30분~1시간',
            latitude: 43.0533,
            longitude: 141.3081,
            rating: 4.4,
          },
        ],
      },
    ],
    foods: [
      { name: '삿포로 미소 라멘', nameJa: '札幌味噌ラーメン', description: '홋카이도 버터·옥수수가 올라간 진한 미소 라멘. 삿포로의 영혼.', priceRange: '800~1,200엔', mustTry: true, bestSpots: ['스미레', '싯포로 라멘 요코초'], mealType: 'any' },
      { name: '징기스칸 (양고기 구이)', nameJa: 'ジンギスカン', description: '홋카이도식 양고기 바비큐. 특제 소스에 찍어 먹는 것이 포인트.', priceRange: '1,500~3,000엔', mustTry: true, bestSpots: ['삿포로 맥주원', '다루마'], mealType: 'dinner' },
      { name: '해산물 덮밥', nameJa: '海鮮丼', description: '성게, 연어알, 게 등 홋카이도산 해산물의 향연.', priceRange: '2,000~4,000엔', mustTry: true, bestSpots: ['니조 시장', '조가이 시장'], mealType: 'lunch' },
      { name: '스프 카레', nameJa: 'スープカレー', description: '삿포로 발상의 독창적 카레. 큼직한 채소와 향신료 풍미.', priceRange: '1,000~1,800엔', mustTry: true, bestSpots: ['수아게+', '오쿠시바 카레'], mealType: 'lunch' },
      { name: '시로이 코이비토', nameJa: '白い恋人', description: '삿포로 대표 기념품 과자. 공장 견학도 가능.', priceRange: '800~2,000엔', mustTry: false, bestSpots: ['시로이 코이비토 파크'], mealType: 'snack' },
    ],
    events: [
      { name: '삿포로 눈축제', nameJa: 'さっぽろ雪まつり', period: '2월 초', description: '세계 3대 겨울 축제. 대형 눈/얼음 조각이 오도리 공원을 가득 채움.', highlight: '약 200개 이상의 눈/얼음 조각, 야간 라이트업' },
      { name: '삿포로 오텀 페스트', nameJa: 'さっぽろオータムフェスト', period: '9~10월', description: '오도리 공원에서 열리는 대규모 음식 축제.', highlight: '홋카이도 각지의 맛을 한곳에서' },
    ],
    transportFromTokyo: { method: '비행기', duration: '약 1시간 30분', cost: '10,000~25,000엔 (LCC~JAL)', tips: '신치토세 공항에서 JR 쾌속으로 삿포로역까지 40분' },
    transportFromOsaka: { method: '비행기', duration: '약 2시간', cost: '8,000~20,000엔' },
    neighborCities: [
      { cityId: 'otaru', cityName: '오타루', transport: 'JR', duration: '약 35분', dayTripViable: true },
      { cityId: 'furano', cityName: '후라노', transport: 'JR+버스', duration: '약 2시간', dayTripViable: true },
    ],
    travelTips: [
      '지하철 1일권(830엔)으로 주요 관광지 이동 가능',
      '여름(7~8월)은 홋카이도 최적 시즌. 에어컨 없는 숙소도 있으니 확인',
      '겨울(12~2월) 방문 시 방한복 필수. 길이 얼어 미끄러우니 신발 주의',
      '렌터카 이용 시 홋카이도 외곽까지 여행 반경이 확 넓어져요',
    ],
    tags: ['라멘', '맥주', '눈축제', '해산물', '자연', '겨울추천', '여름추천'],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KOBE (神戸)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'kobe',
    name: '고베',
    nameJa: '神戸',
    prefecture: '효고현',
    region: '간사이',
    description: '산과 바다 사이의 이국적인 항구 도시. 와규의 본고장이자 야경의 도시.',
    character: '세련되고 이국적인 항구 도시',
    bestSeasons: ['spring', 'autumn'],
    averageStay: '1~2일',
    budgetPerDay: { economy: '8,000~12,000엔', mid: '15,000~25,000엔', premium: '35,000엔~' },
    areas: [
      {
        name: '기타노이진칸',
        nameJa: '北野異人館',
        description: '메이지 시대 외국인 저택이 모인 이국적 언덕 마을.',
        walkable: true,
        timeNeeded: '2~3시간',
        places: [
          {
            name: '기타노이진칸',
            nameJa: '北野異人館街',
            category: '관광지',
            description: '19세기 서양식 저택이 늘어선 이국적 거리. 풍향계의 집, 사쓰마의 집 등.',
            mustVisit: true,
            hours: '09:00~18:00',
            admission: '각 500~700엔 (패스권 3,000엔)',
            duration: '2~3시간',
            latitude: 34.7020,
            longitude: 135.1898,
            rating: 4.3,
            tips: '스타벅스 기타노이진칸점은 등록문화재 건물이에요.',
          },
        ],
      },
      {
        name: '난킨마치·하버랜드',
        nameJa: '南京町・ハーバーランド',
        description: '차이나타운에서 항구까지 걸어서 즐기는 고베의 핵심 코스.',
        walkable: true,
        timeNeeded: '3~4시간',
        places: [
          {
            name: '난킨마치 (고베 차이나타운)',
            nameJa: '南京町',
            category: '맛집',
            description: '일본 3대 차이나타운. 부타만(돼지고기만두)이 대표 먹거리.',
            mustVisit: true,
            hours: '11:00~21:00',
            duration: '1시간',
            latitude: 34.6876,
            longitude: 135.1754,
            rating: 4.2,
          },
          {
            name: '고베 하버랜드 모자이크',
            nameJa: '神戸ハーバーランドモザイク',
            category: '쇼핑',
            description: '항구 전망의 쇼핑·레스토랑 복합시설. 고베 포트타워 뷰가 환상.',
            mustVisit: true,
            hours: '10:00~21:00',
            duration: '1.5~2시간',
            bestTime: '저녁 야경 타이밍',
            latitude: 34.6796,
            longitude: 135.1846,
            rating: 4.3,
          },
        ],
      },
      {
        name: '롯코산',
        nameJa: '六甲山',
        description: '고베를 내려다보는 산. 1000만 달러 야경의 무대.',
        walkable: false,
        timeNeeded: '반나절',
        places: [
          {
            name: '롯코산 전망대',
            nameJa: '六甲山展望台',
            category: '자연',
            description: '고베·오사카만의 1000만 달러 야경. 일본 3대 야경.',
            mustVisit: true,
            hours: '일몰~21:00',
            admission: '310엔',
            duration: '1시간',
            bestTime: '해질녘~야간',
            latitude: 34.7646,
            longitude: 135.2439,
            rating: 4.6,
          },
        ],
      },
    ],
    foods: [
      { name: '고베규 (고베 소고기)', nameJa: '神戸牛', description: '세계적으로 유명한 와규. 마블링이 예술적인 최고급 소고기.', priceRange: '5,000~20,000엔', mustTry: true, bestSpots: ['모리야', '스테이크랜드', '와쿠오'], mealType: 'dinner' },
      { name: '부타만 (돼지고기 만두)', nameJa: '豚まん', description: '난킨마치 명물. 육즙 가득한 찐빵.', priceRange: '300~500엔', mustTry: true, bestSpots: ['로쇼키', '주니반가이'], mealType: 'snack' },
      { name: '고베 스위츠', nameJa: '神戸スイーツ', description: '일본 양과자 발상지. 치즈케이크, 푸딩 등.', priceRange: '500~1,000엔', mustTry: false, bestSpots: ['콘디토라이 고베', '모로조프'], mealType: 'snack' },
    ],
    events: [
      { name: '고베 루미나리에', nameJa: '神戸ルミナリエ', period: '12월', description: '한신대지진 추모 일루미네이션. 아름다운 빛의 터널.', highlight: '수십만 개 LED로 만든 아치형 빛의 회랑' },
    ],
    transportFromTokyo: { method: '신칸센', duration: '약 2시간 40분', cost: '15,000엔 (노조미)', tips: '신고베역 하차' },
    transportFromOsaka: { method: 'JR', duration: '약 21분', cost: '420엔' },
    neighborCities: [
      { cityId: 'himeji', cityName: '히메지', transport: 'JR', duration: '약 40분', dayTripViable: true },
      { cityId: 'arima', cityName: '아리마 온천', transport: '버스', duration: '약 30분', dayTripViable: true },
    ],
    travelTips: [
      '오사카에서 당일치기로 충분히 가능 (JR 21분)',
      '고베규는 점심 세트가 저녁보다 훨씬 저렴해요 (런치 3,000엔대부터)',
      '시티 루프 버스(1일권 700엔)로 주요 관광지 순환',
      '롯코산 야경은 케이블카+버스 조합으로 가요',
    ],
    tags: ['와규', '항구', '야경', '이국적', '스위츠', '당일치기'],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KAGOSHIMA (鹿児島)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'kagoshima',
    name: '가고시마',
    nameJa: '鹿児島',
    prefecture: '가고시마현',
    region: '규슈',
    description: '활화산 사쿠라지마를 마주한 남국 도시. 흑돼지, 온천, 사쓰마 역사의 땅.',
    character: '화산과 함께 사는 남국의 활력',
    bestSeasons: ['spring', 'autumn'],
    averageStay: '2~3일',
    budgetPerDay: { economy: '7,000~10,000엔', mid: '12,000~20,000엔', premium: '25,000엔~' },
    areas: [
      {
        name: '사쿠라지마',
        nameJa: '桜島',
        description: '가고시마의 상징인 활화산. 페리로 15분.',
        walkable: false,
        timeNeeded: '반나절',
        places: [
          {
            name: '사쿠라지마',
            nameJa: '桜島',
            category: '자연',
            description: '현재도 활동 중인 화산. 전망대, 용암 해변, 족욕 온천 등.',
            mustVisit: true,
            hours: '상시 (페리 24시간 운항)',
            admission: '페리 200엔',
            duration: '3~4시간',
            latitude: 31.5811,
            longitude: 130.6572,
            rating: 4.5,
            tips: '사쿠라지마 아일랜드뷰 버스(1일권 500엔)로 순환 가능.',
          },
        ],
      },
      {
        name: '텐몬칸·시내 중심',
        nameJa: '天文館・市内',
        description: '가고시마 최대 번화가. 쇼핑, 맛집, 역사.',
        walkable: true,
        timeNeeded: '2~3시간',
        places: [
          {
            name: '센간엔 (시마즈 정원)',
            nameJa: '仙巌園',
            category: '관광지',
            description: '사쿠라지마를 차경으로 한 시마즈 가문의 정원. 세계유산.',
            mustVisit: true,
            hours: '09:00~17:00',
            admission: '1,000엔',
            duration: '1.5~2시간',
            latitude: 31.6161,
            longitude: 130.5806,
            rating: 4.5,
            tips: '정원 카페에서 사쿠라지마를 보며 차 한잔 추천.',
          },
          {
            name: '텐몬칸 상점가',
            nameJa: '天文館通り',
            category: '쇼핑',
            description: '가고시마 최대 아케이드. 시로쿠마 빙수, 흑돼지 맛집 밀집.',
            mustVisit: true,
            hours: '10:00~21:00',
            duration: '1~2시간',
            latitude: 31.5888,
            longitude: 130.5563,
            rating: 4.1,
          },
        ],
      },
    ],
    foods: [
      { name: '가고시마 흑돼지', nameJa: '黒豚', description: '사쓰마 흑돼지 돈가스·샤브샤브. 달콤하고 부드러운 맛.', priceRange: '1,500~3,000엔', mustTry: true, bestSpots: ['쿠로가츠테이', '아지노토쿠오'], mealType: 'lunch' },
      { name: '시로쿠마 빙수', nameJa: '白くま', description: '가고시마 발상 프루츠 빙수. 곰돌이 얼굴 형태.', priceRange: '500~800엔', mustTry: true, bestSpots: ['텐몬칸 무쟈키'], mealType: 'snack' },
      { name: '키비나고', nameJa: 'きびなご', description: '가고시마 특산 은빛 작은 생선. 회, 튀김, 구이로.', priceRange: '500~1,000엔', mustTry: false, bestSpots: ['텐몬칸 이자카야'], mealType: 'dinner' },
    ],
    events: [
      { name: '오하라마츠리', nameJa: 'おはら祭', period: '11월', description: '2만 명이 춤추는 가고시마 최대 축제.', highlight: '가고시마 거리를 가득 메우는 군무' },
    ],
    transportFromTokyo: { method: '비행기', duration: '약 1시간 50분', cost: '10,000~25,000엔' },
    transportFromOsaka: { method: '신칸센 미즈호', duration: '약 3시간 40분', cost: '21,000엔' },
    neighborCities: [
      { cityId: 'yakushima', cityName: '야쿠시마', transport: '고속선', duration: '약 2시간', dayTripViable: false },
      { cityId: 'ibusuki', cityName: '이부스키', transport: 'JR', duration: '약 1시간', dayTripViable: true },
    ],
    travelTips: [
      '시내 노면전차 1일권(600엔)으로 이동 편리',
      '사쿠라지마 페리는 24시간 운항, 야경 시간대 추천',
      '화산재가 날릴 수 있으니 마스크 준비',
      '이부스키의 모래찜질 온천은 꼭 체험해보세요 (당일치기 가능)',
    ],
    tags: ['화산', '흑돼지', '온천', '남국', '역사', '자연'],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HIROSHIMA (広島)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'hiroshima',
    name: '히로시마',
    nameJa: '広島',
    prefecture: '히로시마현',
    region: '추고쿠',
    description: '평화의 도시이자 오코노미야키의 본고장. 미야지마(이쓰쿠시마)와 함께.',
    character: '평화와 미식의 따뜻한 도시',
    bestSeasons: ['spring', 'autumn'],
    averageStay: '2~3일',
    budgetPerDay: { economy: '7,000~10,000엔', mid: '12,000~20,000엔', premium: '25,000엔~' },
    areas: [
      {
        name: '평화기념공원',
        nameJa: '平和記念公園',
        description: '원폭의 역사와 평화의 메시지를 전하는 장소.',
        walkable: true,
        timeNeeded: '2~3시간',
        places: [
          {
            name: '히로시마 평화기념 자료관',
            nameJa: '広島平和記念資料館',
            category: '관광지',
            description: '원폭의 역사를 기록한 박물관. 감동적이고 교육적.',
            mustVisit: true,
            hours: '08:30~18:00',
            admission: '200엔',
            duration: '1.5~2시간',
            latitude: 34.3916,
            longitude: 132.4531,
            rating: 4.7,
            tips: '시간 여유를 갖고 천천히 관람하세요.',
          },
          {
            name: '원폭 돔',
            nameJa: '原爆ドーム',
            category: '관광지',
            description: '세계유산. 원폭의 참화를 전하는 상징적 건물.',
            mustVisit: true,
            hours: '외관 상시',
            admission: '무료',
            duration: '30분',
            latitude: 34.3955,
            longitude: 132.4536,
            rating: 4.8,
          },
        ],
      },
      {
        name: '미야지마 (이쓰쿠시마)',
        nameJa: '宮島',
        description: '바다 위 도리이로 유명한 세계유산 섬. 히로시마에서 페리로 이동.',
        walkable: true,
        timeNeeded: '반나절~1일',
        places: [
          {
            name: '이쓰쿠시마 신사',
            nameJa: '厳島神社',
            category: '신사/사찰',
            description: '바다 위에 떠 있는 듯한 신사. 대도리이가 상징. 세계유산.',
            mustVisit: true,
            hours: '06:30~18:00',
            admission: '300엔',
            duration: '1시간',
            bestTime: '만조 시 바다 위 도리이 / 간조 시 걸어서 접근',
            latitude: 34.2961,
            longitude: 132.3199,
            rating: 4.7,
            tips: '조수 시간표를 미리 확인하세요!',
          },
          {
            name: '미야지마 상점가',
            nameJa: '宮島表参道商店街',
            category: '쇼핑',
            description: '모미지 만주, 구운 굴, 아나고(붕장어) 등 먹거리 거리.',
            mustVisit: true,
            hours: '09:00~17:00',
            duration: '1시간',
            latitude: 34.2977,
            longitude: 132.3193,
            rating: 4.3,
          },
        ],
      },
    ],
    foods: [
      { name: '히로시마풍 오코노미야키', nameJa: '広島風お好み焼き', description: '반죽·캐비지·면·소스를 겹겹이 쌓는 히로시마 소울 푸드.', priceRange: '800~1,500엔', mustTry: true, bestSpots: ['나기사', '미치야스', '오코노미무라'], mealType: 'lunch' },
      { name: '굴 (카키)', nameJa: '牡蠣', description: '히로시마는 일본 최대 굴 산지. 구이, 튀김, 생굴.', priceRange: '500~2,000엔', mustTry: true, bestSpots: ['미야지마 상점가', '카키 고야'], mealType: 'any' },
      { name: '아나고 (붕장어)', nameJa: 'あなご', description: '미야지마 명물. 아나고메시(붕장어 덮밥)가 대표.', priceRange: '1,500~2,500엔', mustTry: true, bestSpots: ['우에노', '후지타야'], mealType: 'lunch' },
      { name: '모미지 만주', nameJa: 'もみじ饅頭', description: '단풍잎 모양 만주. 미야지마·히로시마 대표 기념품.', priceRange: '200~300엔', mustTry: false, bestSpots: ['미야지마 상점가'], mealType: 'snack' },
    ],
    events: [
      { name: '히로시마 평화기념식', nameJa: '平和記念式典', period: '8월 6일', description: '원폭 투하일 추모 행사.', highlight: '등불 흘리기 행사가 감동적' },
    ],
    transportFromTokyo: { method: '신칸센 노조미', duration: '약 3시간 45분', cost: '19,440엔' },
    transportFromOsaka: { method: '신칸센 노조미', duration: '약 1시간 20분', cost: '10,400엔' },
    neighborCities: [
      { cityId: 'onomichi', cityName: '오노미치', transport: 'JR', duration: '약 1시간 20분', dayTripViable: true },
      { cityId: 'iwakuni', cityName: '이와쿠니', transport: 'JR', duration: '약 50분', dayTripViable: true },
    ],
    travelTips: [
      '히로시마·미야지마 프리패스(1,000엔) 이용하면 미야지마 페리 포함 할인',
      '미야지마는 반나절 이상 소요. 아침 일찍 출발 권장',
      '오코노미무라 빌딩(4층 전체가 오코노미야키점)은 관광객에게 편리',
      '사슴이 물건을 빼앗아 가니 미야지마에서 음식·지도 조심',
    ],
    tags: ['평화', '오코노미야키', '세계유산', '바다', '미야지마', '굴'],
  },
];

// ─── Helper Functions ──────────────────────────────────

export function findCity(query: string): CityProfile | undefined {
  const q = query.toLowerCase();
  return JAPAN_CITIES.find(
    (c) =>
      c.name.includes(query) ||
      c.nameJa.includes(query) ||
      c.id.includes(q) ||
      c.prefecture.includes(query) ||
      c.tags.some((t) => t.includes(query))
  );
}

export function findCitiesByTag(tag: string): CityProfile[] {
  return JAPAN_CITIES.filter((c) => c.tags.some((t) => t.includes(tag)));
}

export function getCityContext(cityId: string): string {
  const city = JAPAN_CITIES.find((c) => c.id === cityId);
  if (!city) return '';

  const lines: string[] = [
    `\n## ${city.name} (${city.nameJa}) 정보`,
    `📍 ${city.prefecture} | ${city.region}`,
    `💬 ${city.character}`,
    `📅 추천 체류: ${city.averageStay} | 💰 예산: ${city.budgetPerDay.mid} (중간)`,
    '',
    `### 에리어`,
  ];

  for (const area of city.areas) {
    lines.push(`**${area.name}** (${area.nameJa}) - ${area.description} [소요: ${area.timeNeeded}]`);
    for (const place of area.places) {
      const must = place.mustVisit ? '⭐' : '';
      lines.push(`  - ${must}${place.name} (${place.nameJa}): ${place.description} [${place.duration}${place.admission ? ', ' + place.admission : ''}]`);
      if (place.tips) lines.push(`    💡 ${place.tips}`);
    }
  }

  lines.push('', '### 맛집/음식');
  for (const food of city.foods) {
    const must = food.mustTry ? '⭐' : '';
    lines.push(`  - ${must}${food.name} (${food.nameJa}): ${food.description} [${food.priceRange}]`);
    lines.push(`    추천: ${food.bestSpots.join(', ')}`);
  }

  lines.push('', '### 교통');
  lines.push(`  도쿄→: ${city.transportFromTokyo.method} ${city.transportFromTokyo.duration} (${city.transportFromTokyo.cost})`);
  lines.push(`  오사카→: ${city.transportFromOsaka.method} ${city.transportFromOsaka.duration} (${city.transportFromOsaka.cost})`);

  if (city.neighborCities.length > 0) {
    lines.push('', '### 근처 도시');
    for (const nc of city.neighborCities) {
      lines.push(`  - ${nc.cityName}: ${nc.transport} ${nc.duration}${nc.dayTripViable ? ' (당일치기 가능)' : ''}`);
    }
  }

  if (city.events.length > 0) {
    lines.push('', '### 시즌 이벤트');
    for (const ev of city.events) {
      lines.push(`  - ${ev.name} (${ev.period}): ${ev.highlight}`);
    }
  }

  lines.push('', '### 여행 팁');
  for (const tip of city.travelTips) {
    lines.push(`  - ${tip}`);
  }

  return lines.join('\n');
}

export function buildKnowledgeContext(userMessage: string): string {
  // Check if user mentions any known city
  const matchedCities: CityProfile[] = [];

  for (const city of JAPAN_CITIES) {
    const terms = [city.name, city.nameJa, city.id, city.prefecture];
    if (terms.some((t) => userMessage.includes(t))) {
      matchedCities.push(city);
    }
  }

  // Also check for general Japan keywords
  const japanKeywords = ['일본', '도쿄', '오사카', '교토', 'japan', '소도시'];
  const isJapanRelated = japanKeywords.some((k) => userMessage.toLowerCase().includes(k));

  if (matchedCities.length === 0 && isJapanRelated) {
    // Provide overview of available cities
    return `\n## 일본 소도시 추천 목록\n${JAPAN_CITIES.map(
      (c) => `- **${c.name}** (${c.nameJa}): ${c.character} [추천 시즌: ${c.bestSeasons.map(s => ({ spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' }[s])).join('·')}]`
    ).join('\n')}`;
  }

  if (matchedCities.length > 0) {
    return matchedCities.map((c) => getCityContext(c.id)).join('\n\n---\n\n');
  }

  return '';
}
