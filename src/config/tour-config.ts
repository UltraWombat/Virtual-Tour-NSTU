// Конфигурация виртуального тура

export interface Viewpoint {
  id: string;
  name: string;
  location: string; // Категория/папка: 'campus', 'fpmi', 'fen', 'fb' и т.д.
  connections: { [photoIndex: number]: { target: string; direction?: 'n' | 'nw' | 'w' | 'sw' | 's' | 'se' | 'e' | 'ne'; targetPhotoIndex?: number } }; // Связи по номеру кадра с направлением стрелки и целевым фото
  photoCount: number; // Количество фото в папке для этой точки
  mapPosition: { x: number; y: number }; // Координаты от 0 до 1 (процент от размера карты)
}

// Функция для получения названия локации по коду
export function getLocationName(location: string): string {
  const locationNames: { [key: string]: string } = {
    campus: 'Кампус',
    fpmi: 'ФПМИ',
    fen: 'ФЭН',
    fb: 'ФБ'
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
    id: 'point1',
    name: 'Вход в ФЛА',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'point2', direction: 'nw', targetPhotoIndex: 1 } },
    mapPosition: { x: 0.25, y: 0.23 }
  },
  {
    id: 'point2',
    name: 'Дворик ФЛА',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'point3', direction: 'nw', targetPhotoIndex: 1 }, 3: { target: 'point1', direction: 'nw', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.34, y: 0.31 }
  },
  {
    id: 'point3',
    name: 'Самолёт «Су-24»',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'point4', direction: 'nw', targetPhotoIndex: 1 }, 3: { target: 'point2', direction: 'n', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.39, y: 0.39 }
  },
  {
    id: 'point4',
    name: 'Граффити "Квантовый компьютер"',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'point5', direction: 'n', targetPhotoIndex: 1 }, 2: { target: 'point3', direction: 'ne', targetPhotoIndex: 2 } },
    mapPosition: { x: 0.75, y: 0.52 }
  },
  {
    id: 'point5',
    name: 'Проход между 1 и 2 корпусами',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'point6', direction: 'nw', targetPhotoIndex: 1 }, 3: { target: 'point4', direction: 'n', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.75, y: 0.61 }
  },
  {
    id: 'point6',
    name: 'Перекрёсток перед 1 корпусом',
    location: 'campus',
    photoCount: 4,
    connections: { 1: { target: 'point8', direction: 'n', targetPhotoIndex: 1 }, 2: { target: 'point7', direction: 'n', targetPhotoIndex: 2 }, 3: { target: 'point5', direction: 'n', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.81, y: 0.72 }
  },
  {
    id: 'point7',
    name: 'Вход в 1 корпус',
    location: 'campus',
    photoCount: 4,
    connections: { 4: { target: 'point6', direction: 'n', targetPhotoIndex: 4 } },
    mapPosition: { x: 0.57, y: 0.72 }
  },
  {
    id: 'point8',
    name: 'Дорога к метро',
    location: 'campus',
    photoCount: 4,
    connections: { 3: { target: 'point6', direction: 'n', targetPhotoIndex: 3 } },
    mapPosition: { x: 0.81, y: 0.84 }
  },
  // Заготовки для новых локаций
  {
    id: 'fpmi-point1',
    name: 'Точка 1 ФПМИ',
    location: 'fpmi',
    photoCount: 1,
    connections: {},
    mapPosition: { x: 0.2, y: 0.3 }
  },
  {
    id: 'fpmi-point2',
    name: 'Точка 2 ФПМИ',
    location: 'fpmi',
    photoCount: 1,
    connections: {},
    mapPosition: { x: 0.4, y: 0.5 }
  },
  {
    id: 'fen-point1',
    name: 'Точка 1 ФЭН',
    location: 'fen',
    photoCount: 1,
    connections: {},
    mapPosition: { x: 0.5, y: 0.5 }
  },
  {
    id: 'fen-point2',
    name: 'Точка 2 ФЭН',
    location: 'fen',
    photoCount: 1,
    connections: {},
    mapPosition: { x: 0.55, y: 0.6 }
  },
  {
    id: 'fb-point1',
    name: 'Точка 1 ФБ',
    location: 'fb',
    photoCount: 1,
    connections: {},
    mapPosition: { x: 0.3, y: 0.4 }
  },
  {
    id: 'fb-point2',
    name: 'Точка 2 ФБ',
    location: 'fb',
    photoCount: 1,
    connections: {},
    mapPosition: { x: 0.6, y: 0.3 }
  },
];

// ============================================
// НАСТРОЙКА ПУТЕЙ МЕЖДУ ТОЧКАМИ
// ============================================
// Используйте строковые ID вместо индексов, чтобы локации можно было легко расширять

export const pathConnections = [
  { from: 'point1', to: 'point2' },
  { from: 'point2', to: 'point3' },
  { from: 'point3', to: 'point4' },
  { from: 'point4', to: 'point5' },
  { from: 'point5', to: 'point6' },
  { from: 'point6', to: 'point7' },
  { from: 'point6', to: 'point8' },
  // Добавьте пути для fen, fb, fpmi и других локаций
];

// ============================================
// НАСТРОЙКА ВИЗУАЛА МИНИ-КАРТЫ
// ============================================

export const mapConfig = {
  // Размер маркеров (в пикселях)
  markerSize: {
    normal: 30,      // Обычный размер
    active: 30,      // Размер активного маркера (масштабируется через scale)
    activeScale: 1.25 // Увеличение активного маркера
  },
  
  // Фон мини-карты для каждой локации
  backgroundImages: {
    campus: '/tour-images/campus/mini-back.jpg',
    fpmi: '/tour-images/fpmi/mini-back.jpg',
    fen: '/tour-images/fen/mini-back.jpg',
    fb: '/tour-images/fb/mini-back.jpg'
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
    dashArray: '6 6'
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
      border: 'border-blue-400',
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