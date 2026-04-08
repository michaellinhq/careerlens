'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'careerlens-skills';

const SkillsContext = createContext<{
  userSkills: string[];
  setUserSkills: (s: string[]) => void;
  toggleSkill: (s: string) => void;
  clearSkills: () => void;
}>({ userSkills: [], setUserSkills: () => {}, toggleSkill: () => {}, clearSkills: () => {} });

export function SkillsProvider({ children }: { children: ReactNode }) {
  const [userSkills, setUserSkillsRaw] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUserSkillsRaw(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (skip initial hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userSkills));
      } catch {}
    }
  }, [userSkills, hydrated]);

  const setUserSkills = useCallback((skills: string[]) => {
    setUserSkillsRaw(skills);
  }, []);

  const toggleSkill = useCallback((skill: string) => {
    setUserSkillsRaw(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  }, []);

  const clearSkills = useCallback(() => {
    setUserSkillsRaw([]);
  }, []);

  return (
    <SkillsContext.Provider value={{ userSkills, setUserSkills, toggleSkill, clearSkills }}>
      {children}
    </SkillsContext.Provider>
  );
}

export function useSkills() {
  return useContext(SkillsContext);
}
