export type ElementType = 'icon' | 'text' | 'arrow' | 'rect' | 'circle';

export interface VisualElement {
  id: string;
  type: ElementType;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  label?: string;
  color?: string;
  // Specific props
  iconName?: string; // for 'icon' type
  size?: number; // for icon/text/shapes
  width?: number; // for rect
  height?: number; // for rect
  toX?: number; // for arrow
  toY?: number; // for arrow
}

export interface Frame {
  id: number;
  explanation: string;
  elements: VisualElement[];
}

export interface DiagramData {
  title: string;
  palette: string[];
  frames: Frame[];
}

export interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}