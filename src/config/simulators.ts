// 시뮬레이터 설정 파일
// 새 시뮬레이터 추가 시 여기에 객체만 추가하면 UI에 자동 반영됩니다.

export type SimulatorStatus = 'active' | 'coming-soon' | 'disabled';

export interface Simulator {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  status: SimulatorStatus;
}

export const SIMULATORS: Simulator[] = [
  {
    id: 'bronze',
    name: '브론즈 시뮬레이터',
    description: '영원한 브론즈 시너지 최대화',
    icon: '🥉',
    color: '#cd7f32',
    path: '/simulator/bronze',
    status: 'active',
  },
  {
    id: 'worldrune',
    name: '월드룬 시뮬레이터',
    description: '지역 4개 빠른 활성화',
    icon: '🌍',
    color: '#4ecdc4',
    path: '/simulator/worldrune',
    status: 'active',
  },
  // 새 시뮬레이터 추가 예시:
  // {
  //   id: 'new-simulator',
  //   name: '새 시뮬레이터',
  //   description: '설명',
  //   icon: '🎮',
  //   color: '#ffffff',
  //   path: '/simulator/new',
  //   status: 'coming-soon',
  // },
];
