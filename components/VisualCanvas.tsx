import React from 'react';
import { VisualElement } from '../types';
import * as Icons from 'lucide-react';

interface VisualCanvasProps {
  elements: VisualElement[];
  palette: string[];
}

// Helper to resolve icon component dynamically
const IconRenderer = ({ name, size, color, ...props }: { name: string; size: number; color: string; [key: string]: any }) => {
  // Convert kebab-case to PascalCase for Lucide import mapping
  // e.g. 'cloud-rain' -> 'CloudRain'
  const iconName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
    
  const IconComponent = (Icons as any)[iconName] || Icons.Circle; // Fallback to Circle

  return <IconComponent size={size} color={color} {...props} />;
};

export const VisualCanvas: React.FC<VisualCanvasProps> = ({ elements, palette }) => {
  
  // Helper to resolve color keywords to palette or hex
  const resolveColor = (color?: string) => {
    if (!color) return palette[0] || '#000';
    if (color === 'palette[0]') return palette[0];
    if (color === 'palette[1]') return palette[1];
    if (color === 'palette[2]') return palette[2];
    return color;
  };

  return (
    <div className="w-full aspect-square md:aspect-video bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative select-none">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#666" />
            </marker>
        </defs>

        {elements.map((el) => {
          const finalColor = resolveColor(el.color);
          
          switch (el.type) {
            case 'rect':
              return (
                <g key={el.id}>
                  <rect
                    x={el.x}
                    y={el.y}
                    width={el.width || 10}
                    height={el.height || 10}
                    fill={finalColor}
                    rx="1"
                    opacity={0.8}
                  />
                  {el.label && (
                    <text
                      x={el.x + (el.width || 10) / 2}
                      y={el.y + (el.height || 10) / 2 + 1}
                      fontSize="3"
                      fill="white"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontWeight="bold"
                    >
                      {el.label}
                    </text>
                  )}
                </g>
              );

            case 'circle':
              return (
                <g key={el.id}>
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={el.size ? el.size / 2 : 5}
                    fill={finalColor}
                    opacity={0.8}
                  />
                   {el.label && (
                    <text
                      x={el.x}
                      y={el.y + 1}
                      fontSize="3"
                      fill="white"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontWeight="bold"
                    >
                      {el.label}
                    </text>
                  )}
                </g>
              );

            case 'arrow':
                if (el.toX === undefined || el.toY === undefined) return null;
                return (
                    <g key={el.id}>
                        <line
                            x1={el.x}
                            y1={el.y}
                            x2={el.toX}
                            y2={el.toY}
                            stroke={finalColor || '#666'}
                            strokeWidth="0.8"
                            markerEnd="url(#arrowhead)"
                        />
                        {el.label && (
                            <text
                                x={(el.x + el.toX) / 2}
                                y={(el.y + el.toY) / 2 - 2}
                                fontSize="3"
                                fill="#4b5563"
                                textAnchor="middle"
                            >
                                {el.label}
                            </text>
                        )}
                    </g>
                );

            case 'text':
              return (
                <text
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  fontSize={el.size || 4}
                  fill={finalColor}
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {el.label || el.iconName} 
                </text>
              );

            case 'icon':
                // Icons are a bit tricky in SVG directly if they are React components.
                // We render them via foreignObject.
                const size = el.size || 8;
                return (
                    <foreignObject
                        key={el.id}
                        x={el.x - size/2}
                        y={el.y - size/2}
                        width={size}
                        height={size}
                        className="overflow-visible"
                    >
                        <div className="flex items-center justify-center w-full h-full">
                            <IconRenderer 
                                name={el.iconName || 'circle'} 
                                size={24} // Render larger then scale down via SVG coordinate system visual
                                color={finalColor} 
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        {el.label && (
                             <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[10px] font-medium text-gray-600 bg-white/80 px-1 rounded">
                                {el.label}
                             </div>
                        )}
                    </foreignObject>
                );

            default:
              return null;
          }
        })}
      </svg>
    </div>
  );
};