'use client';


interface WaterGaugeProps {
  waterLevel: number;
  connected: boolean;
}

export default function WaterGauge({ waterLevel, connected }: WaterGaugeProps) {
  // Determine color theme based on water level
  const getGaugeColors = (val: number) => {
    if (!connected) {
      return {
        fillClass: 'bg-gray-400/85',
        borderClass: 'border-gray-200',
        textClass: 'text-gray-500',
        bgClass: 'bg-gray-50',
      };
    }
    if (val <= 60) {
      return {
        fillClass: 'bg-green-500/80',
        borderClass: 'border-green-200/50',
        textClass: 'text-green-600',
        bgClass: 'bg-green-50/20',
      };
    }
    if (val <= 80) {
      return {
        fillClass: 'bg-yellow-500/80',
        borderClass: 'border-yellow-200/50',
        textClass: 'text-yellow-600',
        bgClass: 'bg-yellow-50/20',
      };
    }
    return {
      fillClass: 'bg-red-500/80',
      borderClass: 'border-red-200/50',
      textClass: 'text-red-600',
      bgClass: 'bg-red-50/20',
    };
  };

  const colors = getGaugeColors(waterLevel);

  // Map 0-100 level to a percentage bottom position (-100% is empty, 0% is full)
  // Let's offset bottom position to give a realistic display
  const waveBottomOffset = connected ? `${waterLevel - 100}%` : '-100%';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col items-center justify-center h-full">
      <h2 className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-6">
        Sump Water Gauge
      </h2>

      <div className="relative w-52 h-52 flex items-center justify-center">
        {/* Outer styling ring */}
        <div
          className={`absolute inset-0 rounded-full border-4 ${colors.borderClass} ${colors.bgClass} shadow-md transition-all duration-500`}
        />

        {/* Circular liquid container */}
        <div className="relative w-48 h-48 rounded-full bg-white shadow-inner overflow-hidden border border-gray-100">
          
          {/* Animated Wave 1 */}
          <div
            className={`absolute left-1/2 w-[220%] h-[220%] rounded-[42%] -translate-x-1/2 wave-animation transition-all duration-1000 ${colors.fillClass}`}
            style={{ bottom: waveBottomOffset }}
          />

          {/* Animated Wave 2 (Slow offset to create volumetric depth) */}
          <div
            className={`absolute left-1/2 w-[230%] h-[230%] rounded-[40%] -translate-x-1/2 wave-animation-slow opacity-60 transition-all duration-1000 ${colors.fillClass}`}
            style={{ bottom: waveBottomOffset }}
          />

          {/* Digital Readout HUD (Z-Indexed above water waves) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none">
            {connected ? (
              <>
                <div className="flex items-baseline">
                  <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                    {waterLevel}
                  </span>
                  <span className="text-xl font-bold text-gray-500 ml-0.5">
                    %
                  </span>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-1">
                  Water Volume
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-extrabold text-gray-400 tracking-tight">
                  OFFLINE
                </span>
                <span className="text-[9px] font-bold tracking-wider text-gray-400 uppercase mt-1">
                  No Connection
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Threshold Status Indicators */}
      <div className="flex justify-between w-full max-w-xs mt-6 pt-4 border-t border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <div className="flex flex-col items-center">
          <span className="text-green-500">Normal</span>
          <span>&lt; 60%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-yellow-500">Warning</span>
          <span>61% - 80%</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-red-500">Critical</span>
          <span>&gt; 80%</span>
        </div>
      </div>
    </div>
  );
}
