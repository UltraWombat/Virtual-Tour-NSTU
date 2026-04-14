import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowUp, MapPin, X, Eye, EyeOff, Hammer, User } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import {
  viewpoints,
  pathConnections,
  mapConfig,
  getLocationName
} from '../config/tour-config';

const LOW_VISION_STORAGE_KEY = 'virtual-tour-low-vision';
const DEV_MODE_STORAGE_KEY = 'virtual-tour-dev-mode';

export function VirtualTour() {
  // Функция для получения угла поворота стрелки по направлению
  const getDirectionRotation = (direction: string): number => {
    const rotations: { [key: string]: number } = {
      'n': 0,     // север
      'ne': 45,   // северо-восток
      'e': 90,    // восток
      'se': 135,  // юго-восток
      's': 180,   // юг
      'sw': 225,  // юго-запад
      'w': 270,   // запад
      'nw': 315   // северо-запад
    };
    return rotations[direction] || 0;
  };

  // Функция для поиска кратчайшего пути между двумя точками
  const findShortestPath = (startId: string, endId: string): string[] => {
    if (startId === endId) return [startId];

    const queue: string[] = [startId];
    const visited = new Set<string>([startId]);
    const parent = new Map<string, string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentViewpoint = viewpoints.find(v => v.id === currentId);
      
      if (!currentViewpoint) continue;

      // Проверяем все возможные переходы из текущей точки
      for (const connection of Object.values(currentViewpoint.connections)) {
        const neighborId = connection.target;
        
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          parent.set(neighborId, currentId);
          queue.push(neighborId);

          if (neighborId === endId) {
            // Восстанавливаем путь
            const path: string[] = [];
            let current = endId;
            while (current) {
              path.unshift(current);
              current = parent.get(current)!;
            }
            return path;
          }
        }
      }
    }

    return []; // Путь не найден
  };

  // Функция для определения targetPhotoIndex при телепортации
  const getTeleportPhotoIndex = (fromId: string, toId: string): number => {
    const path = findShortestPath(fromId, toId);
    
    if (path.length < 2) return 1; // Если путь слишком короткий
    
    // Находим предпоследнюю точку в пути (откуда происходит переход)
    const lastTransitionFrom = path[path.length - 2];
    const lastTransitionTo = path[path.length - 1];
    
    // Ищем connection в предпоследней точке, ведущий к целевой
    const fromViewpoint = viewpoints.find(v => v.id === lastTransitionFrom);
    if (!fromViewpoint) return 1;
    
    // Ищем все connections, которые ведут к целевой точке
    for (const [photoIndex, connection] of Object.entries(fromViewpoint.connections)) {
      if (connection.target === lastTransitionTo) {
        return connection.targetPhotoIndex || 1;
      }
    }
    
    return 1; // По умолчанию первое фото
  };
  const [currentLocationId, setCurrentLocationId] = useState('point1');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLowVisionMode, setIsLowVisionMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(LOW_VISION_STORAGE_KEY) === '1';
  });
  const [isDevMode, setIsDevMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(DEV_MODE_STORAGE_KEY) === '1';
  });

  const currentLocation = viewpoints.find((v) => v.id === currentLocationId)!;
  const currentLocationIndex = viewpoints.findIndex((v) => v.id === currentLocationId);
  const currentPhotoCount = currentLocation.photoCount;

  const rotateLeft = () => setCurrentPhotoIndex((prev) => prev === 1 ? currentPhotoCount : prev - 1);
  const rotateRight = () => setCurrentPhotoIndex((prev) => prev === currentPhotoCount ? 1 : prev + 1);
  const toggleLowVisionMode = () => setIsLowVisionMode(prev => !prev);
  const toggleDevMode = () => setIsDevMode(prev => !prev);

  const navigateToLocation = (locationId: string, targetPhotoIndex: number = 1) => {
    setIsTransitioning(true);
    setIsMapOpen(false);
    setTimeout(() => {
      setCurrentLocationId(locationId);
      setCurrentPhotoIndex(targetPhotoIndex);
      setIsTransitioning(false);
    }, 300);
  };

  const teleportToLocation = (locationId: string) => {
    const targetPhotoIndex = getTeleportPhotoIndex(currentLocationId, locationId);
    navigateToLocation(locationId, targetPhotoIndex);
  };

  const toggleMap = () => setIsMapOpen(prev => !prev);

  const getAvailableConnections = () => {
    const connectionAtCurrentFrame = currentLocation.connections[currentPhotoIndex];
    if (connectionAtCurrentFrame) {
      const targetViewpoint = viewpoints.find(v => v.id === connectionAtCurrentFrame.target);
      return targetViewpoint ? [{ viewpoint: targetViewpoint, direction: connectionAtCurrentFrame.direction, targetPhotoIndex: connectionAtCurrentFrame.targetPhotoIndex }] : [];
    }
    return [];
  };

  const connectedViewpoints = getAvailableConnections();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LOW_VISION_STORAGE_KEY, isLowVisionMode ? '1' : '0');
    document.documentElement.classList.toggle('low-vision', isLowVisionMode);
    return () => document.documentElement.classList.remove('low-vision');
  }, [isLowVisionMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DEV_MODE_STORAGE_KEY, isDevMode ? '1' : '0');
  }, [isDevMode]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'ф') rotateLeft();
      if (key === 'd' || key === 'в') rotateRight();
      if ((key === 'w' || key === 'ц') && connectedViewpoints.length > 0)
        navigateToLocation(connectedViewpoints[0].id);
      if (key === 'm' || key === 'ь') toggleMap();
      if (key === 'v' || key === 'м') toggleLowVisionMode();
      if (key === 'r' || key === 'к') toggleDevMode();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [connectedViewpoints, isTransitioning, toggleDevMode]);

  return (
    <div className={cn('virtual-tour relative w-full h-screen flex flex-col', isLowVisionMode && 'tour-low-vision')}>
      {/* Title Bar */}
      <div className={cn('absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-6', isLowVisionMode && 'lv-title-bar')}>
        <div className="flex items-center justify-center text-white">
          <div className="flex items-center gap-2">
            <MapPin className={cn('w-5 h-5', isLowVisionMode && 'w-6 h-6')} />
            <h1 className={cn('text-3xl font-bold', isLowVisionMode && 'text-4xl font-bold')}>{getLocationName(currentLocation.location)}</h1>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative overflow-hidden bg-neutral-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentLocationId}-${currentPhotoIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <img
              src={`/tour-images/${currentLocation.location}/${currentLocationId}/${currentPhotoIndex}.jpg`}
              alt={`${currentLocation.name} — фото ${currentPhotoIndex}`}
              className={cn('w-full h-full object-cover', isLowVisionMode && 'lv-image')}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
            <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
              <div className="text-center space-y-4">
                <div className="text-white">
                  <div className="text-2xl">{currentLocation.name}</div>
                  <div className="text-neutral-400 mt-2">Фото {currentPhotoIndex} из {currentPhotoCount}</div>
                  <div className="text-neutral-500 text-sm mt-4">Фото отсутствует</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Rotation Controls */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 flex flex-col items-center gap-2">
          <Button
            size="lg"
            variant="secondary"
            onClick={rotateLeft}
            className={cn(
              'rounded-full w-14 h-14 bg-white/90 hover:bg-white shadow-lg',
              isLowVisionMode && 'lv-control-button'
            )}
            disabled={isTransitioning}
          >
            <ChevronLeft className={cn('w-6 h-6', isLowVisionMode && 'w-7 h-7')} />
            <span className="sr-only">Повернуть влево (A)</span>
          </Button>
          <div className={cn('text-white text-xs bg-black/50 px-2 py-1 rounded', isLowVisionMode && 'lv-control-hint')}>
            Влево (A)
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 flex flex-col items-center gap-2">
          <Button
            size="lg"
            variant="secondary"
            onClick={rotateRight}
            className={cn(
              'rounded-full w-14 h-14 bg-white/90 hover:bg-white shadow-lg',
              isLowVisionMode && 'lv-control-button'
            )}
            disabled={isTransitioning}
          >
            <ChevronRight className={cn('w-6 h-6', isLowVisionMode && 'w-7 h-7')} />
            <span className="sr-only">Повернуть вправо (D)</span>
          </Button>
          <div className={cn('text-white text-xs bg-black/50 px-2 py-1 rounded', isLowVisionMode && 'lv-control-hint')}>
            Вправо (D)
          </div>
        </div>
      </div>

      {/* Mini-Map Toggle Button */}
      <div className="absolute top-20 right-4 z-20 flex flex-col items-end gap-2 lv-top-controls">
        <Button
          size="lg"
          onClick={toggleDevMode}
          aria-pressed={isDevMode}
          className={cn(
            'w-fit !px-3 bg-white/95 hover:bg-white text-neutral-700 shadow-xl border border-neutral-200',
            isLowVisionMode && 'lv-top-button'
          )}
        >
          {isDevMode ? <User className="w-5 h-5 mr-2" /> : <Hammer className="w-5 h-5 mr-2" />}
          {isDevMode ? 'Режим экскурсии (R)' : 'Режим разработчика (R)'}
        </Button>

        <Button
          size="lg"
          onClick={toggleLowVisionMode}
          aria-pressed={isLowVisionMode}
          className={cn(
            'w-fit !px-3 bg-white/95 hover:bg-white text-neutral-700 shadow-xl border border-neutral-200',
            isLowVisionMode && 'lv-top-button'
          )}
        >
          {isLowVisionMode ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {isLowVisionMode ? 'Обычный режим (V)' : 'Для слабовидящих (V)'}
        </Button>

        <Button
          size="lg"
          onClick={toggleMap}
          className={cn(
            'w-fit !px-3 bg-white/95 hover:bg-white text-neutral-700 shadow-xl border border-neutral-200',
            isLowVisionMode && 'lv-top-button'
          )}
        >
          <MapPin className="w-5 h-5 mr-2" />
          Карта (M)
        </Button>
      </div>

      {/* Full-Screen Mini-Map Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsMapOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className={cn(
                'relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col',
                isLowVisionMode && 'lv-map-modal'
              )}
              style={{
                width: '540px',
                height: '720px',
                maxWidth: '95vw',
                maxHeight: '90vh',
                boxSizing: 'border-box',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={cn(
                  'bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0',
                  isLowVisionMode && 'lv-map-header'
                )}
                style={{ height: 64, padding: '12px 16px', boxSizing: 'border-box' }}
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6" />
                    <h2 className={cn('text-xl', isLowVisionMode && 'text-2xl')}>Карта маршрута</h2>
                  </div>
                  <button
                    onClick={() => setIsMapOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors lv-focusable',
                      isLowVisionMode && 'text-base px-4 py-2 bg-white/30'
                    )}
                  >
                    <span className="text-sm">Скрыть (M)</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Map Content */}
              <div
                className={`relative flex-1 overflow-hidden ${mapConfig.backgroundColor}`}
                style={{
                  backgroundImage: `url(${mapConfig.backgroundImages[currentLocation.location] || mapConfig.defaultBackgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                onClick={(e) => {
                  if (!isDevMode) return; // Только в режиме разработчика
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  
                  // Округляем до 3 знаков после запятой для удобства
                  const roundedX = Math.round(x * 1000) / 1000;
                  const roundedY = Math.round(y * 1000) / 1000;
                  
                  alert(`Координаты точки:\nX: ${roundedX}\nY: ${roundedY}\n\nИспользуйте в конфигурации:\nmapPosition: { x: ${roundedX}, y: ${roundedY} }`);
                }}
              >
                <div className="absolute inset-0 p-4">
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                    {pathConnections
                      .filter((connection) => {
                        const fromPoint = viewpoints.find((v) => v.id === connection.from);
                        const toPoint = viewpoints.find((v) => v.id === connection.to);
                        return (
                          fromPoint?.location === currentLocation.location &&
                          toPoint?.location === currentLocation.location
                        );
                      })
                      .map((connection, index) => {
                        const fromPoint = viewpoints.find((v) => v.id === connection.from)!;
                        const toPoint = viewpoints.find((v) => v.id === connection.to)!;
                        const isActivePath =
                          fromPoint.id === currentLocationId || toPoint.id === currentLocationId;
                        return (
                          <line
                            key={`path-${index}`}
                            x1={`${fromPoint.mapPosition.x * 100}%`}
                            y1={`${fromPoint.mapPosition.y * 100}%`}
                            x2={`${toPoint.mapPosition.x * 100}%`}
                            y2={`${toPoint.mapPosition.y * 100}%`}
                            stroke={isActivePath ? mapConfig.pathStyle.activeColor : mapConfig.pathStyle.normalColor}
                            strokeWidth={isActivePath ? mapConfig.pathStyle.activeWidth : mapConfig.pathStyle.normalWidth}
                            strokeDasharray={mapConfig.pathStyle.dashArray}
                          />
                        );
                      })}
                  </svg>

                  {viewpoints
                    .filter((viewpoint) => viewpoint.location === currentLocation.location)
                    .map((viewpoint, index) => {
                    const isActive = viewpoint.id === currentLocationId;
                  
                    return (
                      <div
                        key={viewpoint.id}
                        className="absolute flex flex-row items-center gap-2"
                        style={{
                          left: `${viewpoint.mapPosition.x * 100}%`,
                          top: `${viewpoint.mapPosition.y * 100}%`,
                          transform: "translateY(-50%)",
                        }}
                      >
                        {/* Кружок точки - кликабельный в режиме разработчика */}
                        {isDevMode ? (
                          <button
                            onClick={() => teleportToLocation(viewpoint.id)}
                            disabled={isTransitioning}
                            className={`flex items-center justify-center rounded-full transition-all shadow-lg flex-shrink-0 ${
                              isActive
                                ? `bg-gradient-to-br ${mapConfig.markerColors.active.from} ${mapConfig.markerColors.active.to} text-white ring-4 ${mapConfig.markerColors.active.ring} animate-pulse`
                                : `${mapConfig.markerColors.normal.bg} text-neutral-700 ${mapConfig.markerColors.normal.hover} hover:scale-110 ${mapConfig.markerColors.normal.border}`
                            } ${isLowVisionMode ? 'lv-map-marker lv-focusable' : ''}`}
                            style={{
                              width: `${isLowVisionMode ? mapConfig.markerSize.normal + 8 : mapConfig.markerSize.normal}px`,
                              height: `${isLowVisionMode ? mapConfig.markerSize.normal + 8 : mapConfig.markerSize.normal}px`,
                              transform: isActive ? `scale(${mapConfig.markerSize.activeScale})` : "scale(1)",
                            }}
                          >
                            <span className={cn(isActive ? 'text-base' : 'text-sm', isLowVisionMode && 'text-base font-medium')}>
                              {index + 1}
                            </span>
                          </button>
                        ) : (
                          <div
                            className={`flex items-center justify-center rounded-full transition-all shadow-lg flex-shrink-0 ${
                              isActive
                                ? `bg-gradient-to-br ${mapConfig.markerColors.active.from} ${mapConfig.markerColors.active.to} text-white ring-4 ${mapConfig.markerColors.active.ring} animate-pulse`
                                : `${mapConfig.markerColors.normal.bg} border-2 ${mapConfig.markerColors.normal.border}`
                            } ${isLowVisionMode ? 'lv-map-marker' : ''}`}
                            style={{
                              width: `${isLowVisionMode ? mapConfig.markerSize.normal + 8 : mapConfig.markerSize.normal}px`,
                              height: `${isLowVisionMode ? mapConfig.markerSize.normal + 8 : mapConfig.markerSize.normal}px`,
                              transform: isActive ? `scale(${mapConfig.markerSize.activeScale})` : "scale(1)",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

                </div>
              </div>

              {/* Footer */}
              <div
                className="bg-neutral-50 border-t border-neutral-200 flex-shrink-0"
                style={{ minHeight: 48, padding: '8px 12px', boxSizing: 'border-box' }}
              >
                <div className={cn('flex items-center justify-between text-sm text-neutral-600 h-full', isLowVisionMode && 'text-base lv-footer-text')}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600"></div>
                    <span>Текущая точка</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-400"></div>
                    <span>Доступно</span>
                  </div>
                </div>
                {isDevMode && (
                  <div className="mt-2 text-xs text-neutral-500 border-t border-neutral-200 pt-2">
                    💡 Кликните по карте для получения координат точки
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {connectedViewpoints.map(({ viewpoint, direction, targetPhotoIndex }) => {
              const locationViewpoints = viewpoints.filter(v => v.location === viewpoint.location);
              const viewpointIndex = locationViewpoints.findIndex(v => v.id === viewpoint.id) + 1;
              return (
                <Button
                  key={viewpoint.id}
                  onClick={() => navigateToLocation(viewpoint.id, targetPhotoIndex)}
                  disabled={isTransitioning}
                  className={cn(
                    'bg-white/90 hover:bg-white text-black shadow-lg',
                    isLowVisionMode && 'text-base lv-forward-button'
                  )}
                >
                  <ArrowUp 
                    className={cn('w-4 h-4 mr-2', isLowVisionMode && 'w-5 h-5')} 
                    style={{ transform: direction ? `rotate(${getDirectionRotation(direction)}deg)` : 'rotate(0deg)' }}
                  />
                  {isDevMode ? `Локация №${viewpointIndex}` : viewpoint.name} (W)
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Photo Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {Array.from({ length: currentPhotoCount }, (_, index) => index + 1).map((photoIndex) => (
            <button
              key={photoIndex}
              onClick={() => setCurrentPhotoIndex(photoIndex)}
              className={cn(`rounded-full transition-all ${
                photoIndex === currentPhotoIndex ? 'bg-white w-6 h-2' : 'bg-white/40 hover:bg-white/60 w-2 h-2'
              }`, isLowVisionMode && 'lv-rotation-dot lv-focusable', isLowVisionMode && photoIndex === currentPhotoIndex && 'lv-rotation-dot-active')}
              disabled={isTransitioning}
            >
              <span className="sr-only">Фото {photoIndex}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
