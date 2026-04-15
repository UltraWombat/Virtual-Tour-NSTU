import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowUp, MapPin, X, Eye, EyeOff, Hammer, User, Building } from 'lucide-react';
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
  const [currentLocationId, setCurrentLocationId] = useState('campus-point1');
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
  const [highlightedRoute, setHighlightedRoute] = useState<string[]>([]);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [hoveredViewpointId, setHoveredViewpointId] = useState<string | null>(null);

  const currentLocation = viewpoints.find((v) => v.id === currentLocationId)!;
  const currentLocationIndex = viewpoints.findIndex((v) => v.id === currentLocationId);
  const currentPhotoCount = currentLocation.photoCount;

  const getRouteToLocation = (locationId: string): string[] => {
    if (locationId === currentLocationId) return [];
    return findShortestPath(currentLocationId, locationId);
  };

  const isSegmentHighlighted = (fromId: string, toId: string): boolean => {
    for (let i = 0; i < highlightedRoute.length - 1; i += 1) {
      const currentSegmentFrom = highlightedRoute[i];
      const currentSegmentTo = highlightedRoute[i + 1];
      if ((currentSegmentFrom === fromId && currentSegmentTo === toId) ||
          (currentSegmentFrom === toId && currentSegmentTo === fromId)) {
        return true;
      }
    }
    return false;
  };

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

  const teleportToStartingPoint = (locationKey: string, floor?: string) => {
    const startingPoints: { [key: string]: { id: string; photoIndex: number } } = {
      'campus': { id: 'campus-point9', photoIndex: 3 },
      'fpmi-1': { id: 'fpmi-1-point1', photoIndex: 1 },
      'fpmi-2': { id: 'fpmi-2-point1', photoIndex: 4 },
      'fen-2': { id: 'fen-2-point1', photoIndex: 1 },
      'mtf-1': { id: 'mtf-1-point1', photoIndex: 1 },
      'mtf-2': { id: 'mtf-2-point1', photoIndex: 1 }
    };
    const key = floor ? `${locationKey}-${floor}` : locationKey;
    const point = startingPoints[key];
    if (point) {
      navigateToLocation(point.id, point.photoIndex);
    }
    setIsLocationSelectorOpen(false);
  };

  const toggleMap = () => setIsMapOpen(prev => !prev);

  const getAvailableConnections = () => {
    const connectionAtCurrentFrame = currentLocation.connections[currentPhotoIndex];
    if (connectionAtCurrentFrame) {
      const targetViewpoint = viewpoints.find(v => v.id === connectionAtCurrentFrame.target);
      return targetViewpoint ? [{
        viewpoint: targetViewpoint,
        direction: connectionAtCurrentFrame.direction,
        targetPhotoIndex: connectionAtCurrentFrame.targetPhotoIndex,
        additionalInfo: connectionAtCurrentFrame.additionalInfo
      }] : [];
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
        navigateToLocation(connectedViewpoints[0].viewpoint.id, connectedViewpoints[0].targetPhotoIndex);
      if (key === 'm' || key === 'ь') toggleMap();
      if (key === 'v' || key === 'м') toggleLowVisionMode();
      if (key === 'r' || key === 'к') toggleDevMode();
      if (key === 'l' || key === 'д') setIsLocationSelectorOpen(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [connectedViewpoints, isTransitioning, toggleDevMode]);

  return (
    <div className={cn('virtual-tour relative w-full h-screen flex flex-col', isLowVisionMode && 'tour-low-vision')}>
      {/* Title Bar */}
      <div className={cn('absolute bottom-28 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 shadow-lg rounded-lg p-4', isLowVisionMode && 'lv-title-bar')}>
        <div className="flex flex-col items-center text-neutral-700">
          <div className="flex items-center gap-2">
            <MapPin className={cn('w-5 h-5', isLowVisionMode && 'w-6 h-6')} />
            <h1 className={cn('text-2xl font-bold', isLowVisionMode && 'text-3xl font-bold')}>{getLocationName(currentLocation.location)}</h1>
          </div>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        <Button
          size="sm"
          onClick={() => setIsLocationSelectorOpen(true)}
          className={cn(
            'bg-white/90 hover:bg-white text-neutral-700 shadow-lg',
            isLowVisionMode && 'lv-top-button'
          )}
        >
          <Building className="w-4 h-4 mr-2" />
          Выбор локации (L)
        </Button>
        <Button
          size="sm"
          onClick={toggleMap}
          className={cn(
            'bg-white/90 hover:bg-white text-neutral-700 shadow-lg',
            isLowVisionMode && 'lv-top-button'
          )}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Карта (M)
        </Button>
        <Button
          size="sm"
          onClick={toggleLowVisionMode}
          aria-pressed={isLowVisionMode}
          className={cn(
            'bg-white/90 hover:bg-white text-neutral-700 shadow-lg',
            isLowVisionMode && 'lv-top-button'
          )}
        >
          {isLowVisionMode ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {isLowVisionMode ? 'Обычный режим (V)' : 'Для слабовидящих (V)'}
        </Button>
        <Button
          size="sm"
          onClick={toggleDevMode}
          aria-pressed={isDevMode}
          className={cn(
            'bg-white/90 hover:bg-white text-neutral-700 shadow-lg',
            isLowVisionMode && 'lv-top-button'
          )}
        >
          {isDevMode ? <User className="w-5 h-5 mr-2" /> : <Hammer className="w-5 h-5 mr-2" />}
          {isDevMode ? 'Режим экскурсии (R)' : 'Режим разработчика (R)'}
        </Button>
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
              src={`/tour-images/${currentLocation.location}/${currentLocationId.split('-').pop()}/${currentPhotoIndex}.jpg`}
              alt={`${currentLocation.name} — фото ${currentPhotoIndex}`}
              className={cn('w-full h-full object-cover', isLowVisionMode && 'lv-image')}
              onClick={(e) => {
                if (!isDevMode) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const roundedX = Math.round(x * 1000) / 1000;
                const roundedY = Math.round(y * 1000) / 1000;
                alert(`Координаты на фото:\nX: ${roundedX}\nY: ${roundedY}\n\nИспользуйте при разметке точек или для отладки.`);
              }}
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
                    <h2 className={cn('text-xl', isLowVisionMode && 'text-2xl')}>{getLocationName(currentLocation.location)}</h2>
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
                        const isHighlighted = isSegmentHighlighted(fromPoint.id, toPoint.id);
                        return (
                          <line
                            key={`path-${index}`}
                            x1={`${fromPoint.mapPosition.x * 100}%`}
                            y1={`${fromPoint.mapPosition.y * 100}%`}
                            x2={`${toPoint.mapPosition.x * 100}%`}
                            y2={`${toPoint.mapPosition.y * 100}%`}
                            stroke={isHighlighted ? '#f97316' : isActivePath ? mapConfig.pathStyle.activeColor : mapConfig.pathStyle.normalColor}
                            strokeWidth={isHighlighted ? mapConfig.pathStyle.activeWidth + 1 : isActivePath ? mapConfig.pathStyle.activeWidth : mapConfig.pathStyle.normalWidth}
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
                        <button
                          type="button"
                          onClick={() => {
                            const route = getRouteToLocation(viewpoint.id);
                            setHighlightedRoute(route);
                            teleportToLocation(viewpoint.id);
                          }}
                          onMouseEnter={() => {
                            setHighlightedRoute(getRouteToLocation(viewpoint.id));
                            setHoveredViewpointId(viewpoint.id);
                          }}
                          onMouseLeave={() => {
                            setHighlightedRoute([]);
                            setHoveredViewpointId(null);
                          }}
                          disabled={isTransitioning}
                          aria-label={`Перейти к ${viewpoint.name}`}
                          title={viewpoint.name}
                          className={`flex items-center justify-center rounded-full transition-all shadow-lg flex-shrink-0 ${
                            isActive
                              ? `bg-gradient-to-br ${mapConfig.markerColors.active.from} ${mapConfig.markerColors.active.to} text-white ring-4 ${mapConfig.markerColors.active.ring} animate-pulse ${mapConfig.markerColors.normal.border}`
                              : `${mapConfig.markerColors.normal.bg} ${mapConfig.markerColors.normal.hover} ${mapConfig.markerColors.normal.border}`
                          } ${isLowVisionMode ? 'lv-map-marker lv-focusable' : 'cursor-pointer'}`}
                          style={{
                            width: `${isLowVisionMode ? mapConfig.markerSize.normal + 8 : mapConfig.markerSize.normal}px`,
                            height: `${isLowVisionMode ? mapConfig.markerSize.normal + 8 : mapConfig.markerSize.normal}px`,
                            transform: isActive ? `scale(${mapConfig.markerSize.activeScale})` : "scale(1)",
                          }}
                        >
                          {!isDevMode && (
                            <span className={cn(isActive ? 'text-base' : 'text-sm', isLowVisionMode && 'text-base font-medium')}>
                              {index + 1}
                            </span>
                          )}
                        </button>
                        {(isActive || hoveredViewpointId === viewpoint.id) && (
                          <div className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none" style={{ right: '-100%', top: '-120%' }}>
                            {viewpoint.name}
                          </div>
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
            {connectedViewpoints.map(({ viewpoint, direction, targetPhotoIndex, additionalInfo }) => {
              const locationViewpoints = viewpoints.filter(v => v.location === viewpoint.location);
              const viewpointIndex = locationViewpoints.findIndex(v => v.id === viewpoint.id) + 1;
              const label = isDevMode
                ? `Локация №${viewpointIndex}`
                : `${viewpoint.name}${additionalInfo ? ` (${additionalInfo})` : ''}`;
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
                  {label} (W)
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

      {/* Location Selector Modal */}
      <AnimatePresence>
        {isLocationSelectorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsLocationSelectorOpen(false)}
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
                width: '400px',
                height: 'auto',
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
                    <Building className="w-6 h-6" />
                    <h2 className={cn('text-xl', isLowVisionMode && 'text-2xl')}>Выбор локации</h2>
                  </div>
                  <button
                    onClick={() => setIsLocationSelectorOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors lv-focusable',
                      isLowVisionMode && 'text-base px-4 py-2 bg-white/30'
                    )}
                  >
                    <span className="text-sm">Закрыть</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-0 divide-y">
                {/* Кампус */}
                <Button
                  onClick={() => teleportToStartingPoint('campus')}
                  className={cn(
                    'w-full justify-start rounded-none px-4 py-2',
                    currentLocation.location === 'campus'
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                  size="sm"
                >
                  • Кампус
                </Button>

                {/* ФПМИ */}
                <div>
                  <div className="px-4 py-2 bg-gray-100 text-gray-800 font-medium text-sm">ФПМИ (1 корпус):</div>
                  <Button
                    onClick={() => teleportToStartingPoint('fpmi', '1')}
                    className={cn(
                      'w-full justify-start rounded-none px-6 py-2 border-b',
                      currentLocation.location === 'fpmi-1'
                        ? 'bg-black text-white hover:bg-black'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    )}
                    size="sm"
                  >
                    • 1 этаж
                  </Button>
                  <Button
                    onClick={() => teleportToStartingPoint('fpmi', '2')}
                    className={cn(
                      'w-full justify-start rounded-none px-6 py-2',
                      currentLocation.location === 'fpmi-2'
                        ? 'bg-black text-white hover:bg-black'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    )}
                    size="sm"
                  >
                    • 2 этаж
                  </Button>
                </div>

                {/* ФЭН */}
                <div>
                  <div className="px-4 py-2 bg-gray-100 text-gray-800 font-medium text-sm">ФЭН (2 корпус):</div>
                  <Button
                    onClick={() => teleportToStartingPoint('fen', '2')}
                    className={cn(
                      'w-full justify-start rounded-none px-6 py-2',
                      currentLocation.location === 'fen-2'
                        ? 'bg-black text-white hover:bg-black'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    )}
                    size="sm"
                  >
                    • 2 этаж
                  </Button>
                </div>

                {/* МТФ */}
                <div>
                  <div className="px-4 py-2 bg-gray-100 text-gray-800 font-medium text-sm">МТФ (5 корпус):</div>
                  <Button
                    onClick={() => teleportToStartingPoint('mtf', '1')}
                    className={cn(
                      'w-full justify-start rounded-none px-6 py-2 border-b',
                      currentLocation.location === 'mtf-1'
                        ? 'bg-black text-white hover:bg-black'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    )}
                    size="sm"
                  >
                    • 1 этаж
                  </Button>
                  <Button
                    onClick={() => teleportToStartingPoint('mtf', '2')}
                    className={cn(
                      'w-full justify-start rounded-none px-6 py-2',
                      currentLocation.location === 'mtf-2'
                        ? 'bg-black text-white hover:bg-black'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    )}
                    size="sm"
                  >
                    • 2 этаж
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
