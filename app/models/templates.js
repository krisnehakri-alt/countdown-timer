export const templates = [
  {
    id: "template-1",
    name: "Clean Modern (Free)",
    tier: "Free",
    description: "Clean modern card with a white background and simple countdown.",
    defaultColors: {
      fontColor: "#000000",
      textColor: "#333333",
      buttonColor: "#000000",
      backgroundColor: "#ffffff",
    }
  },
  {
    id: "template-2",
    name: "Floating Glass (Starter)",
    tier: "Starter",
    description: "Animated floating glassmorphism style with attractive hover effects.",
    defaultColors: {
      fontColor: "#ffffff",
      textColor: "#e2e8f0",
      buttonColor: "#3b82f6",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    }
  },
  {
    id: "template-3",
    name: "Neon Sale (Starter)",
    tier: "Starter",
    description: "Neon sale countdown with e-commerce urgency design.",
    defaultColors: {
      fontColor: "#39ff14",
      textColor: "#ffffff",
      buttonColor: "#39ff14",
      backgroundColor: "#111111",
    }
  },
  {
    id: "template-4",
    name: "Luxury Dark (Growth)",
    tier: "Growth",
    description: "Luxury dark countdown with premium gradients.",
    defaultColors: {
      fontColor: "#d4af37",
      textColor: "#f3f4f6",
      buttonColor: "#d4af37",
      backgroundColor: "linear-gradient(135deg, #1f2937, #111827)",
    }
  },
  {
    id: "template-5",
    name: "Product Launch (Growth)",
    tier: "Growth",
    description: "Product launch style countdown with motion effects.",
    defaultColors: {
      fontColor: "#ffffff",
      textColor: "#f8fafc",
      buttonColor: "#ef4444",
      backgroundColor: "#0f172a",
    }
  },
  {
    id: "template-6",
    name: "Black & Gold VIP (Premium)",
    tier: "Premium",
    description: "Black and gold premium countdown with VIP style.",
    defaultColors: {
      fontColor: "#ffd700",
      textColor: "#ffffff",
      buttonColor: "#ffd700",
      backgroundColor: "#000000",
    }
  },
  {
    id: "template-7",
    name: "Enterprise Ultra (Premium)",
    tier: "Premium",
    description: "Enterprise-level countdown design with ultra premium animations.",
    defaultColors: {
      fontColor: "#ffffff",
      textColor: "#cbd5e1",
      buttonColor: "#6366f1",
      backgroundColor: "linear-gradient(to right, #4338ca, #312e81)",
    }
  }
];

export function getTemplateById(id) {
  return templates.find(t => t.id === id) || templates[0];
}
