// 시뮬레이터 설정 파일
// 새 시뮬레이터 추가 시 여기에 객체만 추가하면 UI에 자동 반영됩니다.

export type SimulatorStatus = 'active' | 'coming-soon' | 'disabled';

export interface Simulator {
  id: string;
  name: string;
  description: string;
  icon: string;        // 이모지 또는 이미지 경로 (/images/simulators/xxx.png)
  iconType: 'emoji' | 'image' | 'dual-image';
  icons?: string[];    // dual-image일 때 사용
  color: string;
  path: string;
  status: SimulatorStatus;
}

export const SIMULATORS: Simulator[] = [
  {
    id: 'bronze',
    name: '브론즈 시뮬레이터',
    description: '영원한 브론즈 시너지 최대화',
    icon: '/images/simulators/bronze.png',
    iconType: 'image',
    color: '#cd7f32',
    path: '/simulator/bronze',
    status: 'active',
  },
  {
    id: 'worldrune',
    name: '세계룬 시뮬레이터',
    description: '지역 4개 빠른 활성화',
    icon: '/images/simulators/worldrune.jpg',
    iconType: 'image',
    color: '#4ecdc4',
    path: '/simulator/worldrune',
    status: 'active',
  },
  {
    id: 'item-analysis',
    name: '아이템 분석기',
    description: '조합 아이템별 승률 통계',
    icon: '',
    iconType: 'dual-image',
    icons: [
      'https://ddragon.leagueoflegends.com/cdn/15.24.1/img/tft-item/TFT_Item_InfinityEdge.png',
      'https://ddragon.leagueoflegends.com/cdn/15.24.1/img/tft-item/TFT_Item_LastWhisper.png',
    ],
    color: '#eab308',
    path: '/simulator/item-analysis',
    status: 'active',
  },
  // 새 시뮬레이터 추가 예시:
  // {
  //   id: 'new-simulator',
  //   name: '새 시뮬레이터',
  //   description: '설명',
  //   icon: '🎮',
  //   iconType: 'emoji',
  //   color: '#ffffff',
  //   path: '/simulator/new',
  //   status: 'coming-soon',
  // },
];
