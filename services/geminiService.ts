
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BusinessData, GeneratedContent } from "../types";

export const generateWebsiteContent = async (data: BusinessData): Promise<GeneratedContent> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Module 3: Industry-Specific Prompting
  const prompt = `
    You are a professional website copywriter and SEO specialist for the ${data.industry || 'Retail'} industry.
    Generate high-converting website content based on the following details:
    
    Business Name: ${data.businessName}
    Tagline: ${data.tagline}
    Location: ${data.address.city}, ${data.address.state}
    Founded Year: ${data.foundedYear}
    Description: ${data.description}
    Industry: ${data.industry}

    User Provided SEO Meta Description: ${data.userSeoMetaDescription || "N/A"}
    User Provided SEO Keywords: ${data.userSeoKeywords || "N/A"}
    
    Context:
    The brand operates in the ${data.industry} sector.
    Tone: Professional, Trustworthy, Engaging, and specific to the ${data.industry} niche.
    
    Requirements:
    1. **Headline (H1)**: Captivating and SEO-rich (max 12 words).
    2. **Subheadline**: Reinforce value proposition and heritage.
    3. **About Us**: A compelling narrative (approx 100 words).
    4. **Collections**: Generate 4 distinct collections/categories relevant to ${data.industry}.
       - For each, provide a Title, a Short Description, and a single English keyword for image search.
    5. **Value Props**: 3 short, punchy trust signals relevant to ${data.industry}.
    6. **Meta Description**: SEO optimized summary (max 160 chars). If "User Provided SEO Meta Description" is provided, prioritize it or enhance it.
    7. **SEO Keywords**: List of 10 comma-separated high-ranking keywords. If "User Provided SEO Keywords" are provided, include them.
    8. **Footer Bio**: A short 2-sentence summary for the footer.
  `;

  const collectionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      imageKeyword: { type: Type.STRING },
    },
    required: ["title", "description", "imageKeyword"],
  };

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      subheadline: { type: Type.STRING },
      aboutText: { type: Type.STRING },
      collections: {
        type: Type.ARRAY,
        items: collectionSchema,
      },
      valueProps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      metaDescription: { type: Type.STRING },
      seoKeywords: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      footerBio: { type: Type.STRING }
    },
    required: ["headline", "subheadline", "aboutText", "collections", "valueProps", "metaDescription", "seoKeywords", "footerBio"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};

export const generateProductImage = async (
  productName: string, 
  productCategory: string, 
  industry: string,
  referenceImage?: string
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  let parts: any[] = [];
  
  if (referenceImage) {
    // Extract base64 data ensuring safe handling of the data URI prefix
    const match = referenceImage.match(/^data:(.+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const data = match[2];
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: data
        }
      });
      
      parts.push({
        text: `Enhance this product image of ${productName} (${productCategory}) for the ${industry} industry. 
        Important: Keep the product itself exactly as it appears in the original image (shape, details, and branding). Do not alter the product's identity.
        Place the product in a premium, professional studio setting with commercial-grade lighting. 
        Replace the background with a clean, elegant, or industry-appropriate context that elevates the product. 
        The final output should look like a 4k high-resolution product advertisement.`
      });
    } else {
      // Fallback if reference image is not a valid base64 data URI
      parts.push({
        text: `Professional product photography of ${productName} (${productCategory}) for the ${industry} industry. High resolution, studio lighting, white background, commercial advertisement style, 4k.`
      });
    }
  } else {
    parts.push({
      text: `Professional product photography of ${productName} (${productCategory}) for the ${industry} industry. High resolution, studio lighting, white background, commercial advertisement style, 4k.`
    });
  }

  try {
    // Using 'gemini-2.5-flash-image' (nano banana) for image generation/editing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: parts },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generateLogo = async (
  businessName: string,
  industry: string,
  style: string
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Design a professional logo for a business named "${businessName}" in the "${industry}" industry.
    Style: ${style}.
    Requirements:
    - The logo should be centered.
    - Use a solid pure white background (RGB 255,255,255) to make it easy to remove later.
    - High contrast.
    ${style === '3D' 
      ? '- Create a 3D rendered look with depth, soft shadows, and lighting (isometric or perspective). It should look like a high-quality 3D icon.' 
      : '- Vector art style, flat design principles, scalable look. No realistic photo elements.'}
    - If the style is 'Minimalist', use simple lines and negative space.
    - If the style is 'Vintage', use retro typography and badges.
    - If the style is 'Iconic', focus on a strong symbol.
    - If the style is '3D', focus on volumetric shapes, glossy or matte finishes appropriate for the industry.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating logo:", error);
    throw error;
  }
};

export const generateHeroImage = async (
  businessName: string,
  industry: string
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  // Nano Banana Prompt Optimized for Indian Culture
  const prompt = `
    Generate a high-resolution, photorealistic website hero banner for a business named "${businessName}" in the "${industry}" industry, infused with Indian cultural aesthetics.
    Dimensions: Wide panoramic (16:9 aspect ratio aesthetic).
    Visual Style: Cinematic, commercial advertisement quality, 4k, hyper-realistic. Use rich, vibrant colors (like saffron, turmeric, indigo, teal) and warm lighting inspired by Indian festivals and traditions.
    Lighting: Warm, natural golden hour lighting or festive ambient lighting.
    Content: An abstract or lifestyle scene that represents ${industry} in a modern Indian context. Elements like Indian architecture, textiles, marigolds, or diverse Indian models should be subtly integrated.
    Negative Prompt: Do not include text, logos, or watermarks. No blurry areas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
            aspectRatio: "16:9"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating hero image:", error);
    throw error;
  }
};

export const generateProductDescription = async (
  productName: string,
  category: string,
  industry: string
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Write a short, appealing product description (max 2 sentences) for a product named "${productName}" in the category "${category}".
    The industry is "${industry}".
    Focus on key features and benefits.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    return null;
  }
};

export const removeBackground = async (image: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  const match = image.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          },
          {
            text: "Remove the background from this image. Return the image with a transparent background. Keep the main subject exactly as is."
          }
        ]
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error removing background:", error);
    throw error;
  }
};

export const generateSEODescription = async (
  businessName: string,
  industry: string,
  description: string,
  keywords: string
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Write a high-ranking SEO meta description (max 155 characters) for a business named "${businessName}" in the "${industry}" industry.
    Business Context: ${description}
    Target Keywords: ${keywords}
    
    The description should be click-worthy, professional, and directly address customer needs.
    Output only the description text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating SEO description:", error);
    return null;
  }
};
