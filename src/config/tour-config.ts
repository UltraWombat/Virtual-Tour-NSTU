// Конфигурация виртуального тура

export interface Connection {
  target: string;
  direction?: 'n' | 'nw' | 'w' | 'sw' | 's' | 'se' | 'e' | 'ne';
  targetPhotoIndex?: number;
  additionalInfo?: string; // Дополнительная информация для кнопки перехода по этой связи
}

export interface Viewpoint {
  id: string;
  name: string;
  location: string; // Категория/папка: 'campus', 'fpmi', 'fen', 'fb' и т.д.
  connections: { [photoIndex: number]: Connection }; // Связи по номеру кадра с направлением стрелки и целевым фото
  photoCount: number; // Количество фото в папке для этой точки
  mapPosition: { x: number; y: number }; // Координаты от 0 до 1 (процент от размера карты)
}

// Функция для получения названия локации по коду
export function getLocationName(location: string): string {
  const locationNames: { [key: string]: string } = {
    campus: 'Кампус',
    'fpmi-1': 'ФПМИ (1 этаж)',
    'fpmi-2': 'ФПМИ (2 этаж)',
    'fen-2': 'ФЭН (2 этаж)',
    'mtf-2': 'МТФ (2 этаж)',
    'mtf-1': 'МТФ (1 этаж)',
    'fb-1': 'ФБ (1 этаж)'
  };
  return locationNames[location] || location;
}

// ============================================
// НАСТРОЙКА ЛОКАЦИЙ И ИХ ПОЗИЦИЙ НА КАРТЕ
// ============================================
// mapPosition: { x: 0.5, y: 0.5 } означает центр карты
// x: 0 = левый край, x: 1 = правый край
// y: 0 = верхний край, y: 1 = нижний край

// ПЕРЕХОДЫ ПО НОМЕРАМ:
// Укажите номер фото, с которого будет доступен переход в другую локацию

export const viewpoints: Viewpoint[] = [
  {
    id: 'campus-point1',
    name: 'Вход в ФЛА',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'campus-point2', direction: 'nw', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.097, y: 0.261 }
  },
  {
    id: 'campus-point2',
    name: 'Дворик ФЛА',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'campus-point3', direction: 'nw', targetPhotoIndex: 1 }, 3: { target: 'campus-point1', direction: 'nw', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.129, y: 0.321 }
  },
  {
    id: 'campus-point3',
    name: 'Самолёт «Су-24»',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'campus-point4', direction: 'nw', targetPhotoIndex: 1 }, 3: { target: 'campus-point2', direction: 'n', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.171, y: 0.426 }
  },
  {
    id: 'campus-point4',
    name: 'Граффити "Квантовый компьютер"',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'campus-point5', direction: 'n', targetPhotoIndex: 1 }, 2: { target: 'campus-point3', direction: 'ne', targetPhotoIndex: 2 } },
    mapPosition: { x: 0.277, y: 0.494 }
  },
  {
    id: 'campus-point5',
    name: 'Проход между ФПМИ и ФЭН',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'campus-point6', direction: 'nw', targetPhotoIndex: 1 }, 3: { target: 'campus-point4', direction: 'n', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.288, y: 0.577 }
  },
  {
    id: 'campus-point6',
    name: 'Перекрёсток перед ФПМИ',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'campus-point8', direction: 'n', targetPhotoIndex: 1 }, 2: { target: 'campus-point7', direction: 'n', targetPhotoIndex: 2 }, 3: { target: 'campus-point5', direction: 'n', targetPhotoIndex: 3 }, 4: { target: 'campus-point9', direction: 'n', targetPhotoIndex: 4 } },
    mapPosition: { x: 0.321, y: 0.672 }
  },
  {
    id: 'campus-point7',
    name: 'Вход в ФПМИ',
    location: 'campus',
    photoCount: 4,
    connections: { 2: { target: 'fpmi-1-point1', direction: 'n', targetPhotoIndex: 1 }, 4: { target: 'campus-point6', direction: 'n', targetPhotoIndex: 4 } },
    mapPosition: { x: 0.225, y: 0.672 }
  },
  {
    id: 'campus-point8',
    name: 'Дорога к метро "Студенческая"',
    location: 'campus',
    photoCount: 4,
    connections: { 3: { target: 'campus-point6', direction: 'n', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.321, y: 0.803 }
  },
  {
    id: 'campus-point9',
    name: 'Вход в ФЭН',
    location: 'campus',
    photoCount: 4,
    connections: { 2: { target: 'campus-point6', direction: 'n', targetPhotoIndex: 2 }, 4: { target: 'campus-point10', direction: 'n', targetPhotoIndex: 4 } },
    mapPosition: { x: 0.497, y: 0.672 }
  },
  {
    id: 'campus-point10',
    name: 'Большая парковка',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'campus-point11', direction: 'nw', targetPhotoIndex: 1 }, 2: { target: 'campus-point9', direction: 'n', targetPhotoIndex: 2 } },
    mapPosition: { x: 0.723, y: 0.672 }
  },
  {
    id: 'campus-point11',
    name: 'Вход в ФБ',
    location: 'campus',
    photoCount: 4,
    connections: { 3: { target: 'campus-point10', direction: 'nw', targetPhotoIndex: 3 }, 4: { target: 'fb-1-point9', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.727, y: 0.742 }
  },
  
  {
    id: 'fpmi-1-point1',
    name: 'Холл ФПМИ',
    location: 'fpmi-1',
    photoCount: 4,
    connections: { 2: { target: 'fpmi-1-point2', direction: 'nw', targetPhotoIndex: 1 }, 3: { target: 'campus-point7', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.256, y: 0.766 }
  },
  {
    id: 'fpmi-1-point2',
    name: 'Точка кипения',
    location: 'fpmi-1',
    photoCount: 3,
    connections: { 2: { target: 'fpmi-1-point1', direction: 'ne', targetPhotoIndex: 3 }, 3: { target: 'fpmi-2-point1', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.194, y: 0.667 }
  },

  {
    id: 'fpmi-2-point1',
    name: 'Вход в конференц-зал',
    location: 'fpmi-2',
    photoCount: 4,
    connections: { 3: { target: 'fpmi-1-point2', direction: 'n', targetPhotoIndex: 2 }, 4: { target: 'fpmi-2-point2', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.225, y: 0.742 }
  },
  {
    id: 'fpmi-2-point2',
    name: 'Портреты основателей НЭТИ-НГТУ',
    location: 'fpmi-2',
    photoCount: 4,
    connections: { 3: { target: 'fpmi-2-point1', direction: 'n', targetPhotoIndex: 2 }, 4: { target: 'fpmi-2-point3', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.282, y: 0.742 }
  },
  {
    id: 'fpmi-2-point3',
    name: 'Поворот в сторону ФЭН',
    location: 'fpmi-2',
    photoCount: 4,
    connections: { 2: { target: 'fpmi-2-point4', direction: 'n', targetPhotoIndex: 1 }, 3: { target: 'fpmi-2-point2', direction: 'ne', targetPhotoIndex: 2 } },
    mapPosition: { x: 0.277, y: 0.201 }
  },
  {
    id: 'fpmi-2-point4',
    name: 'Второй отдел',
    location: 'fpmi-2',
    photoCount: 4,
    connections: { 1: { target: 'fen-2-point1', direction: 'n', targetPhotoIndex: 1 }, 3: { target: 'fpmi-2-point3', direction: 'n', targetPhotoIndex: 4 } },
    mapPosition: { x: 0.742, y: 0.162 }
  },

  {
    id: 'fen-2-point1',
    name: 'Коридор ФЭН',
    location: 'fen-2',
    photoCount: 4,
    connections: { 1: { target: 'mtf-2-point1', direction: 'n', targetPhotoIndex: 1 }, 3: { target: 'fpmi-2-point4', direction: 'n', targetPhotoIndex: 3 }, 4: { target: 'fen-2-point2', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.301, y: 0.719 }
  },
  {
    id: 'fen-2-point2',
    name: 'Буфет ФЭН',
    location: 'fen-2',
    photoCount: 4,
    connections: { 3: { target: 'fen-2-point1', direction: 'n', targetPhotoIndex: 2 } },
    mapPosition: { x: 0.369, y: 0.637 }
  },

  {
    id: 'mtf-2-point1',
    name: 'Реакция, open-space',
    location: 'mtf-2',
    photoCount: 4,
    connections: { 3: { target: 'fen-2-point1', direction: 'n', targetPhotoIndex: 3 }, 4: { target: 'mtf-2-point2', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.656, y: 0.841 }
  },
  {
    id: 'mtf-2-point2',
    name: 'Буфет МТФ',
    location: 'mtf-2',
    photoCount: 4,
    connections: { 1: { target: 'mtf-1-point1', direction: 'ne', targetPhotoIndex: 3 }, 3: { target: 'mtf-2-point1', direction: 'n', targetPhotoIndex: 2 } },
    mapPosition: { x: 0.668, y: 0.351 }
  },

  {
    id: 'mtf-1-point1',
    name: 'Учебный центр метрологии и точных измерений',
    location: 'mtf-1',
    photoCount: 4,
    connections: { 1: { target: 'mtf-2-point2', direction: 'ne', targetPhotoIndex: 1 }, 3: { target: 'mtf-1-point2', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.768, y: 0.014 }
  },
  {
    id: 'mtf-1-point2',
    name: 'Столовая "Под яблоком Ньютона"',
    location: 'mtf-1',
    photoCount: 4,
    connections: { 2: { target: 'mtf-1-point3', direction: 'n', targetPhotoIndex: 1 }, 3: { target: 'mtf-1-point1', direction: 'n', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.768, y: 0.989 }
  },
  {
    id: 'mtf-1-point3',
    name: 'Общий холл МТФ и ФБ',
    location: 'mtf-1',
    photoCount: 4,
    connections: { 3: { target: 'mtf-2-point2', direction: 'n', targetPhotoIndex: 4 }, 4: { target: 'campus-point11', direction: 'ne', targetPhotoIndex: 2 } },
    mapPosition: { x: 0.425, y: 0.989 }
  },
];

// ============================================
// НАСТРОЙКА ПУТЕЙ МЕЖДУ ТОЧКАМИ
// ============================================
// Используйте строковые ID вместо индексов, чтобы локации можно было легко расширять

export const pathConnections = [
  { from: 'campus-point1', to: 'campus-point2' },
  { from: 'campus-point2', to: 'campus-point3' },
  { from: 'campus-point3', to: 'campus-point4' },
  { from: 'campus-point4', to: 'campus-point5' },
  { from: 'campus-point5', to: 'campus-point6' },
  { from: 'campus-point6', to: 'campus-point7' },
  { from: 'campus-point6', to: 'campus-point8' },
  { from: 'campus-point6', to: 'campus-point9' },
  { from: 'campus-point7', to: 'fpmi-1-point1' },
  { from: 'campus-point9', to: 'campus-point10' },
  { from: 'campus-point10', to: 'campus-point11' },
  { from: 'campus-point11', to: 'fb-1-point1' },
  { from: 'fpmi-1-point1', to: 'fpmi-1-point2' },
  { from: 'fpmi-1-point2', to: 'fpmi-2-point1' },
  { from: 'fpmi-2-point1', to: 'fpmi-2-point2' },
  { from: 'fpmi-2-point2', to: 'fpmi-2-point3' },
  { from: 'fpmi-2-point3', to: 'fpmi-2-point4' },
  { from: 'fen-2-point1', to: 'fen-2-point2' },
  { from: 'mtf-2-point1', to: 'mtf-2-point2' },
  { from: 'mtf-1-point1', to: 'mtf-1-point2' },
  { from: 'mtf-1-point2', to: 'mtf-1-point3' },

  // Добавьте пути для fen, fb, fpmi и других локаций
];

// ============================================
// НАСТРОЙКА ВИЗУАЛА МИНИ-КАРТЫ
// ============================================

export const mapConfig = {
  // Размер маркеров (в пикселях)
  markerSize: {
    normal: 24,      // Обычный размер
    active: 24,      // Размер активного маркера (масштабируется через scale)
    activeScale: 1.0 // Увеличение активного маркера
  },
  
  // Фон мини-карты для каждой локации
  backgroundImages: {
    campus: '/tour-images/campus/mini-back.jpg',
    'fpmi-1': '/tour-images/fpmi-1/mini-back.jpg',
    'fpmi-2': '/tour-images/fpmi-2/mini-back.jpg',
    'fen-2': '/tour-images/fen-2/mini-back.jpg',
    'mtf-2': '/tour-images/mtf-2/mini-back.jpg',
    'mtf-1': '/tour-images/mtf-1/mini-back.jpg',
    'fb-1': '/tour-images/fb-1/mini-back.jpg'
  },
  defaultBackgroundImage: '/tour-images/mini-back.jpg',
  
  // Цвет фона, если изображение не задано
  backgroundColor: 'bg-gradient-to-b from-neutral-50 to-neutral-100',
  
  // Настройки путей между точками
  pathStyle: {
    normalColor: '#93c5fd',
    activeColor: '#3b82f6',
    normalWidth: 3,
    activeWidth: 4,
    dashArray: '8 4'
  },
  
  // Цвета маркеров
  markerColors: {
    active: {
      from: 'from-orange-500',
      to: 'to-orange-600',
      ring: 'ring-orange-300'
    },
    normal: {
      bg: 'bg-white',
      border: 'border-[4px] border-blue-500',
      hover: 'hover:bg-blue-50'
    }
  },
  
  // Размеры текстовых меток
  labelStyle: {
    fontSize: 'text-xs',
    padding: 'px-2 py-1',
    maxWidth: '100px'
  }
};