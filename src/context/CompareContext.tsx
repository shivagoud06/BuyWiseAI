"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Laptop } from "@/types";
import { LAPTOPS } from "@/data/laptops";

interface CompareContextType {
  comparedLaptops: Laptop[];
  addLaptop: (laptop: Laptop) => boolean;
  removeLaptop: (laptopId: string) => void;
  toggleLaptop: (laptop: Laptop) => void;
  clearCompare: () => void;
  isComparing: (laptopId: string) => boolean;
  count: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "buywise_compared_laptops_v1";

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [comparedLaptops, setComparedLaptops] = useState<Laptop[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load initial from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedIds: string[] = JSON.parse(stored);
        if (Array.isArray(parsedIds)) {
          const matched = parsedIds
            .map((id) => LAPTOPS.find((l) => l.id === id))
            .filter((l): l is Laptop => Boolean(l));
          setComparedLaptops(matched.slice(0, 3));
        }
      }
    } catch {
      // ignore JSON or localStorage errors
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const ids = comparedLaptops.map((l) => l.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [comparedLaptops, isHydrated]);

  const addLaptop = (laptop: Laptop): boolean => {
    if (comparedLaptops.some((l) => l.id === laptop.id)) {
      return true;
    }
    if (comparedLaptops.length >= 3) {
      alert("You can compare a maximum of 3 laptops at a time. Remove one first.");
      return false;
    }
    setComparedLaptops((prev) => [...prev, laptop]);
    return true;
  };

  const removeLaptop = (laptopId: string) => {
    setComparedLaptops((prev) => prev.filter((l) => l.id !== laptopId));
  };

  const toggleLaptop = (laptop: Laptop) => {
    if (comparedLaptops.some((l) => l.id === laptop.id)) {
      removeLaptop(laptop.id);
    } else {
      addLaptop(laptop);
    }
  };

  const clearCompare = () => {
    setComparedLaptops([]);
  };

  const isComparing = (laptopId: string) => {
    return comparedLaptops.some((l) => l.id === laptopId);
  };

  return (
    <CompareContext.Provider
      value={{
        comparedLaptops,
        addLaptop,
        removeLaptop,
        toggleLaptop,
        clearCompare,
        isComparing,
        count: comparedLaptops.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
