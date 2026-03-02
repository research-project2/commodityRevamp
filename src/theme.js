const theme = {
  colors: {
    // Primary colors
    accent: '#3B82F6', // Blue
    primary: '#1F2937',
    
    // Background colors
    background: '#FFFFFF',
    surface: '#F9FAFB',
    
    // Text colors
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    // Border colors
    border: '#E5E7EB',
    borderFocused: '#3B82F6',
    
    // Semantic colors
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Utility colors
    white: '#FFFFFF',
    black: '#000000',
    disabled: '#D1D5DB',
  },
  
  fonts: {
    bold: 'System',
    semiBold: 'System',
    medium: 'System',
    regular: 'System',
  },
  
  radii: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export default theme;
