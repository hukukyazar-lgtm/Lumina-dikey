import { useState, useEffect } from 'react';

export const useTabletDetection = (): boolean => {
  // Force tablet detection for development and testing purposes.
  return true;
};
