import { useEffect, useState } from 'react';
import { HOUSES } from './houses';

const STORAGE_KEY = 'hp-house';

function readStoredHouse() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && HOUSES[value] ? value : null;
  } catch {
    return null;
  }
}

function writeStoredHouse(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage unavailable, so the theme just will not persist.
  }
}

function applyHouseAttribute(id) {
  document.documentElement.setAttribute('data-house', id ?? 'default');
}

export function useHouseTheme() {
  const [house, setHouseState] = useState(() => readStoredHouse());

  useEffect(() => {
    applyHouseAttribute(house);
  }, [house]);

  const setHouse = (id) => {
    writeStoredHouse(id);
    setHouseState(id);
  };

  return { house, setHouse };
}
