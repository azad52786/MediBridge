/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
 theme: {
  fontFamily: {
    inter: ["Inter", "sans-serif"],
    "edu-sa": ["Edu SA Beginner", "cursive"],
    mono: ["Roboto Mono", "monospace"],
  },
  colors: {
    white: "#ffffff",
    black: "#000000",
    violate : {
    50: "#f8f4fc",    // Very light purple/white
    100: "#f0e3fa",   // Light purple
    200: "#dfc1f6",   // Soft purple
    300: "#d0a0f3",   // Medium-light purple
    400: "#c07ef0",   // Medium purple
    500: "#b15ceb",   // Primary purple
    600: "#9b42d9",   // Darker purple
    700: "#8533b7",   // Dark purple
    800: "#6a1f8c",   // Very dark purple
    900: "#4e1466",   // Deep purple
  }, 
    purple: {
    50: "#f5e6f8",   // Very light purple
    100: "#ebccf1",  // Light purple
    200: "#d699e3",  // Soft purple
    300: "#c266d5",  // Medium-light purple
    400: "#b233c7",  // Medium purple
    500: "#a000b8",  // Primary purple
    600: "#8b009f",  // Darker purple
    700: "#740085",  // Dark purple
    800: "#5c006a",  // Very dark purple
    900: "#45004f",  // Deep purple
  } , 
    grey: {
      50: "#f8f9fa",
      100: "#f1f3f5",
      200: "#e9ecef",
      300: "#dee2e6",
      400: "#ced4da",
      500: "#adb5bd",
      600: "#6c757d",
      700: "#495057",
      800: "#343a40",
      900: "#212529",
    },
    accent: {
      primary: "#06d6a0", // Green for buttons
      secondary: "#ef476f", // Pink for emphasis
      tertiary: "#118ab2", // Blue for icons or interactive elements
    },
    button: {
      record: "#ff5a5f", // Red for recording
      plan: "#2d5a6a", // Dark blue for planning
      upload: "#0a5a72", // Blue for upload
    },
    alert: {
      warning: "#ffd166", // Yellow for warning
      error: "#ef476f", // Pink for error
      success: "#06d6a0", // Green for success
    },
    overlay: "#2C333F", // Dark grey for overlays
    transparent: "transparent",
  },
  extend: {
    maxWidth: {
      maxContent: "1200px",
      maxContentTab: "650px",
    },
    content: {
      'warning': '⚠',
    },
    boxShadow: {
      '3xl': '0 0 0.75rem #2C333F',
    }
  },
},
  plugins: [],
}

