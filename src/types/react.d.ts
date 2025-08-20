import React from 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Allow any data attribute
    [key: `data-${string}`]: any;
  }

  interface KeyboardEvent extends React.SyntheticEvent {
    key: string;
    shiftKey: boolean;
    preventDefault(): void;
  }
} 