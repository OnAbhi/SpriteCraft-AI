import { GoogleGenAI } from "@google/genai";
import { SpriteConfig, AnimationState } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates the base character sprite (Idle state usually).
 */
export const generateBaseSprite = async (config: SpriteConfig): Promise<string> => {
  const weaponText = config.weapon && config.weapon !== 'None' 
    ? `The character is wielding a ${config.weapon}.` 
    : 'The character is unarmed.';

  const prompt = `
    Generate a single ${config.style} 2D game sprite of a ${config.category}.
    Description: ${config.description}.
    ${weaponText}
    The character must be in an IDLE pose, facing slightly right (3/4 view).
    The background MUST be a solid, pure white color.
    Full body must be visible within the frame with some padding.
    High contrast, clean outlines, suitable for game assets.
    Do not include any text, grids, or interface elements. Just the character.
    Ensure the character proportions are standard for a 2D platformer or RPG.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: prompt }]
      },
    });

    // Extract image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    // Find image part
    const imagePart = parts.find(p => p.inlineData);
    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error (Base):", error);
    throw error;
  }
};

/**
 * Generates an animation frame based on a reference image and optionally a previous frame.
 */
export const generateActionFrame = async (
  baseImageBase64: string, 
  config: SpriteConfig, 
  action: AnimationState,
  sequenceIndex: number = 1,
  totalFrames: number = 1,
  previousFrameBase64?: string
): Promise<string> => {
  // Strip prefix for API usage
  const base64Data = baseImageBase64.split(',')[1];
  
  let actionguidance = "";
  if (action === AnimationState.Walk) {
    actionguidance = "Create a walking frame. Legs apart, arms swinging. Maintain steady head height.";
  } else if (action === AnimationState.Run) {
    actionguidance = "Dynamic running pose. Body leaning forward, legs extended.";
  } else if (action === AnimationState.Attack) {
    actionguidance = "Action pose swinging weapon or casting spell. Extended limbs.";
  } else if (action === AnimationState.Jump) {
    actionguidance = "Mid-air pose. Knees tucked or legs stretched down. dynamic cloth movement.";
  } else if (action === AnimationState.Death) {
    actionguidance = "Collapsing or lying on the ground.";
  } else if (action === AnimationState.Hit) {
    actionguidance = "Recoiling from damage. Flashing white or red tint optional but posture should show impact.";
  }

  let prompt = "";
  const parts: any[] = [];

  // Add Base Reference (Always first)
  parts.push({
    inlineData: {
      mimeType: 'image/png',
      data: base64Data
    }
  });

  if (previousFrameBase64) {
    // If we have a previous frame, we add it and change the prompt to emphasize continuity
    const prevData = previousFrameBase64.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: prevData
      }
    });

    prompt = `
      TASK: Generate Frame ${sequenceIndex} of ${totalFrames} for a ${action} animation.
      
      INPUTS:
      1. First Image: CHARACTER DESIGN (Identity Source).
      2. Second Image: PREVIOUS FRAME (Motion Source).

      INSTRUCTIONS:
      1. Maintain the identity from Image 1 (Colors, Equipment, Volume).
      2. Continue the motion from Image 2. This is the NEXT frame in the sequence.
      3. ${actionguidance}
      4. Ensure smooth transition from the previous frame.
      5. Keep the same 3/4 side view.
      6. Output on solid white background.
    `;
  } else {
    // First frame of animation, just reference base
    prompt = `
      TASK: Generate Frame ${sequenceIndex} of ${totalFrames} for a ${action} animation.
      
      STRICT CONSISTENCY RULES:
      1. REFERENCE: Use the attached image as the source of truth for the character's design.
      2. DO NOT CHANGE: Head size, limb thickness, clothing details, or colors. The character VOLUME must remain identical.
      3. ACTION: ${actionguidance}
      4. VIEW ANGLE: Keep the same 3/4 side view.
      5. OUTPUT: Single character on solid white background.
      6. Ensure the silhouette is distinct and readable.
    `;
  }

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: parts },
    });

    const resParts = response.candidates?.[0]?.content?.parts;
    if (!resParts) throw new Error("No content generated");

    const imagePart = resParts.find(p => p.inlineData);
    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error(`Gemini API Error (${action}):`, error);
    throw error;
  }
};