// Theme and preference utilities

/**
 * User preference interface that matches the one in settings.tsx
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  contentLayout: 'grid' | 'list';
  autoSave: boolean;
  lessonDefaults: {
    showObjectives: boolean;
    includeAssessment: boolean;
    defaultDuration: number;
  };
}

// Default preferences - should match the ones in settings.tsx
export const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  contentLayout: 'grid',
  autoSave: true,
  lessonDefaults: {
    showObjectives: true,
    includeAssessment: true,
    defaultDuration: 45,
  }
};

/**
 * Load user preferences from localStorage
 */
export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }
  
  try {
    const savedPreferences = localStorage.getItem('teachprep_user_preferences');
    if (savedPreferences) {
      return JSON.parse(savedPreferences);
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
  
  return defaultPreferences;
}

/**
 * Apply theme based on preferences
 */
export function applyTheme(preferences: UserPreferences = loadUserPreferences()): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Clear existing theme classes
  document.documentElement.classList.remove('light-theme', 'dark-theme');
  
  // Apply theme class
  if (preferences.theme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else if (preferences.theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  } else {
    // System preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }
  
  // Apply font size CSS variable
  const rootStyle = document.documentElement.style;
  switch(preferences.fontSize) {
    case 'small':
      rootStyle.setProperty('--font-size-base', '0.875rem');
      break;
    case 'medium':
      rootStyle.setProperty('--font-size-base', '1rem');
      break;
    case 'large':
      rootStyle.setProperty('--font-size-base', '1.125rem');
      break;
  }
  
  // Apply content layout preference
  if (preferences.contentLayout === 'grid') {
    document.documentElement.classList.remove('list-layout');
    document.documentElement.classList.add('grid-layout');
  } else {
    document.documentElement.classList.remove('grid-layout');
    document.documentElement.classList.add('list-layout');
  }
}

/**
 * Save preferences to localStorage and apply immediately
 */
export function saveAndApplyPreferences(preferences: UserPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem('teachprep_user_preferences', JSON.stringify(preferences));
  applyTheme(preferences);
}

/**
 * Preview a theme without saving (used for live preview)
 */
export function previewTheme(theme: UserPreferences['theme']): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  document.documentElement.classList.remove('light-theme', 'dark-theme');
  
  if (theme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  } else {
    // System preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }
}

/**
 * Preview a font size without saving (used for live preview)
 */
export function previewFontSize(fontSize: UserPreferences['fontSize']): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const rootStyle = document.documentElement.style;
  switch(fontSize) {
    case 'small':
      rootStyle.setProperty('--font-size-base', '0.875rem');
      break;
    case 'medium':
      rootStyle.setProperty('--font-size-base', '1rem');
      break;
    case 'large':
      rootStyle.setProperty('--font-size-base', '1.125rem');
      break;
  }
} 