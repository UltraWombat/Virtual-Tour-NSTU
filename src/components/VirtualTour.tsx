import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowUp, MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { 
  viewpoints, 
  pathConnections, 
  mapConfig, 
  rotationAngles,
  type Viewpoint 
} from '../config/tour-config';

export function VirtualTour() {
  const [currentLocationId, setCurrentLocationId] = useState('point1');
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const currentLocation = viewpoints.find((v) => v.id === currentLocationId)!;
  const currentLocationIndex = viewpoints.findIndex((v) => v.id === currentLocationId);
  const currentAngle = rotationAngles[currentRotationIndex];

  const rotateLeft = () => setCurrentRotationIndex(prev => (prev === 0 ? 3 : prev - 1));
  const rotateRight = () => setCurrentRotationIndex(prev => (prev === 3 ? 0 : prev + 1));

  const navigateToLocation = (locationId: string) => {
    setIsTransitioning(true);
    setIsMapOpen(false);
    setTimeout(() => {
      setCurrentLocationId(locationId);
      setIsTransitioning(false);
    }, 300);
  };

  const toggleMap = () => setIsMapOpen(prev => !prev);

  const getAvailableConnections = () => {
    const connectionAtCurrentAngle = currentLocation.connections[currentAngle];
    if (connectionAtCurrentAngle) {
      const targetViewpoint = viewpoints.find(v => v.id === connectionAtCurrentAngle);
      return targetViewpoint ? [targetViewpoint] : [];
    }
    return [];
  };

  const connectedViewpoints = getAvailableConnections();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'ф') rotateLeft();
      if (key === 'd' || key === 'в') rotateRight();
      if ((key === 'w' || key === 'ц') && connectedViewpoints.length > 0)
        navigateToLocation(connectedViewpoints[0].id);
      if (key === 'm' || key === 'ь') toggleMap();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentRotationIndex, connectedViewpoints, isTransitioning, isMapOpen]);

  return (
    <div className="relative w-full h-screen flex flex-col">
      {/* Title Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-6">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="w-5 h-5" />
          <h1>{currentLocation.name}</h1>
          <span className="text-neutral-400 text-sm ml-2">
            ({currentLocationIndex + 1} из {viewpoints.length})
          </span>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative overflow-hidden bg-neutral-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentLocationId}-${currentRotationIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <img
              src={`/tour-images/${currentLocationId}/${currentAngle}.jpg`}
              alt={`${currentLocation.name} — ${currentAngle}°`}
              className="w-full h-full object-cover"
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
                  <div className="text-neutral-400 mt-2">{currentAngle}°</div>
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
            className="rounded-full w-14 h-14 bg-white/90 hover:bg-white shadow-lg"
            disabled={isTransitioning}
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="sr-only">Повернуть влево (A)</span>
          </Button>
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">Влево (A)</div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 flex flex-col items-center gap-2">
          <Button
            size="lg"
            variant="secondary"
            onClick={rotateRight}
            className="rounded-full w-14 h-14 bg-white/90 hover:bg-white shadow-lg"
            disabled={isTransitioning}
          >
            <ChevronRight className="w-6 h-6" />
            <span className="sr-only">Повернуть вправо (D)</span>
          </Button>
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">Вправо (D)</div>
        </div>
      </div>

      {/* Mini-Map Toggle Button */}
      <div className="absolute top-20 right-4 z-20">
        <Button
          size="lg"
          onClick={toggleMap}
          className="bg-white/95 hover:bg-white text-neutral-700 shadow-xl border border-neutral-200"
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
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0"
                style={{ height: 64, padding: '12px 16px', boxSizing: 'border-box' }}
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6" />
                    <h2 className="text-xl">Карта маршрута</h2>
                  </div>
                  <button
                    onClick={() => setIsMapOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <span className="text-sm">Скрыть (M)</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Map Content */}
              <div
                className={`relative flex-1 overflow-hidden ${mapConfig.backgroundImage ? '' : mapConfig.backgroundColor}`}
                style={{
                  backgroundImage: mapConfig.backgroundImage ? `url(${mapConfig.backgroundImage})` : 'none',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <div className="absolute inset-0 p-4">
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                    {pathConnections.map((connection, index) => {
                      const fromPoint = viewpoints[connection.from];
                      const toPoint = viewpoints[connection.to];
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

                  {viewpoints.map((viewpoint, index) => {
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
                        {/* Номер точки слева */}
                        <button
                          onClick={() => navigateToLocation(viewpoint.id)}
                          className={`flex items-center justify-center rounded-full transition-all shadow-lg flex-shrink-0 ${
                            isActive
                              ? `bg-gradient-to-br ${mapConfig.markerColors.active.from} ${mapConfig.markerColors.active.to} text-white ring-4 ${mapConfig.markerColors.active.ring} animate-pulse`
                              : `${mapConfig.markerColors.normal.bg} text-neutral-700 ${mapConfig.markerColors.normal.hover} hover:scale-110 ${mapConfig.markerColors.normal.border}`
                          }`}
                          style={{
                            width: `${mapConfig.markerSize.normal}px`,
                            height: `${mapConfig.markerSize.normal}px`,
                            transform: isActive ? `scale(${mapConfig.markerSize.activeScale})` : "scale(1)",
                          }}
                        >
                          <span className={isActive ? "text-base" : "text-sm"}>{index + 1}</span>
                        </button>
                  
                        {/* Надпись справа */}
                        <div
                          className={`${mapConfig.labelStyle.fontSize} ${mapConfig.labelStyle.padding} rounded-lg transition-all leading-tight`}
                          style={{
                            maxWidth: mapConfig.labelStyle.maxWidth,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          <div
                            className={`rounded-lg ${mapConfig.labelStyle.padding} ${
                              isActive
                                ? `bg-gradient-to-r ${mapConfig.markerColors.active.from} ${mapConfig.markerColors.active.to} text-white shadow-lg`
                                : "bg-white text-neutral-700 border border-neutral-300"
                            }`}
                          >
                            {viewpoint.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>

              {/* Footer */}
              <div
                className="bg-neutral-50 border-t border-neutral-200 flex-shrink-0"
                style={{ height: 48, padding: '8px 12px', boxSizing: 'border-box' }}
              >
                <div className="flex items-center justify-between text-sm text-neutral-600 h-full">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600"></div>
                    <span>Текущая точка</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-400"></div>
                    <span>Доступно</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {connectedViewpoints.map(viewpoint => (
              <Button
                key={viewpoint.id}
                onClick={() => navigateToLocation(viewpoint.id)}
                disabled={isTransitioning}
                className="bg-white/90 hover:bg-white text-black shadow-lg"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                {viewpoint.name} (W)
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Rotation Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {rotationAngles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentRotationIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentRotationIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
              }`}
              disabled={isTransitioning}
            >
              <span className="sr-only">Вид {rotationAngles[index]}°</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
