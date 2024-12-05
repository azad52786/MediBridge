/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
 theme: {
  fontFamily: {
    inter: ["Inter", "sans-serif"],
    // "edu-sa": ["Edu SA Beginner", "cursive"],
    mono: ["Roboto Mono", "monospace"],
    karla : ["Karla", "sans-serif"] , 
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
    richblack: {
        5: "#F1F2FF",
        25: "#DBDDEA",
        50: "#C5C7D4",
        100: "#AFB2BF",
        200: "#999DAA",
        300: "#838894",
        400: "#6E727F",
        500: "#585D69",
        600: "#424854",
        700: "#2C333F",
        800: "#161D29",
        900: "#000814",
      },
      richblue: {
        5: "#ECF5FF",
        25: "#C6D6E1",
        50: "#A0B7C3",
        100: "#7A98A6",
        200: "#537988",
        300: "#2D5A6A",
        400: "#073B4C",
        500: "#063544",
        600: "#042E3B",
        700: "#032833",
        800: "#01212A",
        900: "#001B22",
      },
      blue: {
        5: "#EAF5FF",
        25: "#B4DAEC",
        50: "#7EC0D9",
        100: "#47A5C5",
        200: "#118AB2",
        300: "#0F7A9D",
        400: "#0C6A87",
        500: "#0A5A72",
        600: "#074B5D",
        700: "#053B48",
        800: "#022B32",
        900: "#001B1D",
      },
      caribbeangreen: {
        5: "#C1FFFD",
        25: "#83F1DE",
        50: "#44E4BF",
        100: "#06D6A0",
        200: "#05BF8E",
        300: "#05A77B",
        400: "#049069",
        500: "#037957",
        600: "#026144",
        700: "#014A32",
        800: "#01321F",
        900: "#001B0D",
      },
      brown: {
        5: "#FFF4C4",
        25: "#FFE395",
        50: "#FFD166",
        100: "#E7BC5B",
        200: "#CFA64F",
        300: "#B89144",
        400: "#A07C39",
        500: "#88662D",
        600: "#705122",
        700: "#593C17",
        800: "#41260B",
        900: "#291100",
      },
      pink: {
        5: "#FFF1F1",
        25: "#FBC7D1",
        50: "#F79CB0",
        100: "#F37290",
        200: "#EF476F",
        300: "#D43D63",
        400: "#BA3356",
        500: "#9F294A",
        600: "#841E3E",
        700: "#691432",
        800: "#4F0A25",
        900: "#340019",
      },
      yellow: {
        5: "#FFF970",
        25: "#FFE83D",
        50: "#FFD60A",
        100: "#E7C009",
        200: "#CFAB08",
        300: "#B69507",
        400: "#9E8006",
        500: "#866A04",
        600: "#6E5503",
        700: "#553F02",
        800: "#3D2A01",
        900: "#251400",
      },
      "pure-greys": {
        5: "#F9F9F9",
        25: "#E2E2E2",
        50: "#CCCCCC",
        100: "#B5B5B5",
        200: "#9E9E9E",
        300: "#888888",
        400: "#717171",
        500: "#5B5B5B",
        600: "#444444",
        700: "#2D2D2D",
        800: "#171717",
        900: "#141414",
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
    } , 
    backgroundImage : {
      // 'custom-radial' : 'radial-gradient(circle at 10% 20%, rgb(151, 41, 247) 0%, rgb(24, 22, 39) 90%)' , 
      'custom-radial' : 'radial-gradient(circle at 90% 80%, rgb(151, 41, 247) 0%, rgb(24, 22, 39) 90%)' , 
    }
  },
},
  plugins: [],
}

