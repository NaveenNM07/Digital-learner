import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DiagramData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const visualSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short title of the diagram" },
    palette: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Array of 2-3 hex color codes to be used for consistency"
    },
    frames: {
      type: Type.ARRAY,
      description: "Sequence of steps explaining the concept",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          explanation: { type: Type.STRING, description: "Short text explaining this step (max 1 sentence)" },
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['icon', 'text', 'arrow', 'rect', 'circle'] },
                x: { type: Type.NUMBER, description: "X position (0-100)" },
                y: { type: Type.NUMBER, description: "Y position (0-100)" },
                label: { type: Type.STRING, nullable: true },
                color: { type: Type.STRING, nullable: true, description: "Hex code or 'palette[0]', etc." },
                iconName: {
                   type: Type.STRING,
                   nullable: true,
                   description: "Lucide-react icon name (kebab-case), e.g., 'sun', 'cloud-rain', 'atom', 'user', 'arrow-right'"
                },
                size: { type: Type.NUMBER, nullable: true, description: "Size of icon or text" },
                width: { type: Type.NUMBER, nullable: true },
                height: { type: Type.NUMBER, nullable: true },
                toX: { type: Type.NUMBER, nullable: true, description: "End X for arrow" },
                toY: { type: Type.NUMBER, nullable: true, description: "End Y for arrow" }
              },
              required: ['id', 'type', 'x', 'y']
            }
          }
        },
        required: ['id', 'explanation', 'elements']
      }
    }
  },
  required: ['title', 'palette', 'frames']
};

export const generateVisualExplanation = async (topic: string): Promise<DiagramData> => {
  const prompt = `
    You are a visual explainer engine.
    The user wants a visual explanation for: "${topic}".
    Create a step-by-step diagrammatic animation (GIF-style).

    Rules:
    1. Break the concept down into 3-6 sequential frames.
    2. Use a coordinate system of 0-100 for X and Y.
    3. Use 'icon' type frequently to represent objects (e.g., sun, water-drop, tree, brain, database).
    4. Use 'arrow' to show flow or movement.
    5. Keep it minimal and clean.
    6. Use the 'palette' colors for elements to ensure a cohesive look.
    7. For 'iconName', use valid Lucide React icon names in kebab-case.
    8. 'explanation' should be very short and punchy.

    Return ONLY valid JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: visualSchema,
        systemInstruction: "You are a helpful visual teaching assistant. You speak in JSON diagrams.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DiagramData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};