// Конфигурация виртуального тура

export interface Viewpoint {
  id: string;
  name: string;
  connections: { [angle: number]: string }; // Связи по углам: { 0: 'point2', 180: 'point1' }
  mapPosition: { x: number; y: number }; // Координаты от 0 до 1 (процент от размера карты)
}

// ============================================
// НАСТРОЙКА ЛОКАЦИЙ И ИХ ПОЗИЦИЙ НА КАРТЕ
// ============================================
// mapPosition: { x: 0.5, y: 0.5 } означает центр карты
// x: 0 = левый край, x: 1 = правый край
// y: 0 = верхний край, y: 1 = нижний край

// ПЕРЕХОДЫ ПО УГЛАМ:
// Укажите на каком угле (0°, 90°, 180°, 270°) будет доступен переход в другую локацию

export const viewpoints: Viewpoint[] = [
  { 
    id: 'point1', 
    name: 'Вход в ФЛА', 
    connections: { 0: 'point2' }, 
    mapPosition: { x: 0.25, y: 0.23 } 
  },
  { 
    id: 'point2', 
    name: 'Дворик ФЛА', 
    connections: { 0: 'point3', 180: 'point1' }, 
    mapPosition: { x: 0.34, y: 0.31 } 
  },
  { 
    id: 'point3', 
    name: 'Самолёт «Су-24»', 
    connections: { 0: 'point4', 180: 'point2' }, 
    mapPosition: { x: 0.39, y: 0.39 } 
  },
  { 
    id: 'point4', 
    name: 'Проход между 1 и 2 корпусами', 
    connections: { 0: 'point5', 90: 'point3' }, 
    mapPosition: { x: 0.75, y: 0.52 } 
  },
  { 
    id: 'point5', 
    name: 'Длинная тропа', 
    connections: { 0: 'point6', 180: 'point4' }, 
    mapPosition: { x: 0.75, y: 0.61 } 
  },
  { 
    id: 'point6', 
    name: 'Перекрёсток у 1 корпуса', 
    connections: { 0: 'point8', 90: 'point7', 180: 'point5' }, 
    mapPosition: { x: 0.81, y: 0.72 } 
  },
  { 
    id: 'point7', 
    name: 'Вход в 1 корпус', 
    connections: { 270: 'point6' }, 
    mapPosition: { x: 0.57, y: 0.72 } 
  },
  { 
    id: 'point8', 
    name: 'Дорога к метро', 
    connections: { 180: 'point6' }, 
    mapPosition: { x: 0.81, y: 0.84 } 
  },
];

// ============================================
// НАСТРОЙКА ПУТЕЙ МЕЖДУ ТОЧКАМИ
// ============================================
// Индексы соответствуют порядку в массиве viewpoints (начиная с 0)

export const pathConnections = [
  { from: 0, to: 1 }, // Точка 1 → Точка 2
  { from: 1, to: 2 }, // Точка 2 → Точка 3
  { from: 2, to: 3 }, // Точка 3 → Точка 4
  { from: 3, to: 4 }, // Точка 4 → Точка 5
  { from: 4, to: 5 }, // Точка 5 → Точка 6
  { from: 5, to: 6 }, // Точка 6 → Точка 7
  { from: 5, to: 7 }, // Точка 6 → Точка 8 (ветвление)
];

// ============================================
// НАСТРОЙКА ВИЗУАЛА МИНИ-КАРТЫ
// ============================================

export const mapConfig = {
  // Размер маркеров (в пикселях)
  markerSize: {
    normal: 30,      // Обычный размер (w-14 h-14)
    active: 30,      // Размер активного маркера (масштабируется через scale)
    activeScale: 1.25 // Увеличение активного маркера
  },
  
  // Фоновое изображение мини-карты
  // Оставьте пустую строку '', если фон не нужен
  // Пример: '/path/to/your/map-background.jpg'
  backgroundImage: '/public/tour-images/mini-back.jpg',
  
  // Цвет фона, если изображение не задано
  backgroundColor: 'bg-gradient-to-b from-neutral-50 to-neutral-100',
  
  // Настройки путей между точками
  pathStyle: {
    normalColor: '#93c5fd',    // Обычный цвет пути
    activeColor: '#3b82f6',    // Цвет активного пути
    normalWidth: 3,            // Толщина обычного пути
    activeWidth: 4,            // Толщина активного пути
    dashArray: '6 6'           // Пунктирная линия
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
    maxWidth: '100px' // Максимальная ширина для переноса строк
  }
};

// ============================================
// НАСТРОЙКА РОТАЦИИ
// ============================================

export const rotationAngles = [0, 90, 180, 270];
export const rotationLabels = ['Север', 'Восток', 'Юг', 'Запад'];