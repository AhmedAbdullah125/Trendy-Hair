

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, Product, Brand, Category, Package, Question, GameSettings, Review, ContentSettings } from '../types';
import { STORAGE_KEYS, INITIAL_DATA, INITIAL_GAME_SETTINGS, INITIAL_CONTENT_SETTINGS } from '../constants';

interface DataContextType extends AppData {
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (pkg: Package) => void;
  deletePackage: (id: string) => void;

  addBrand: (brand: Omit<Brand, 'id'>) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (id: number) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  addQuestion: (question: Omit<Question, 'id'>) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (id: number) => void;

  addReview: (review: Omit<Review, 'id'>) => void;
  updateReview: (review: Review) => void;
  deleteReview: (id: string) => void;
  
  updateGameSettings: (settings: GameSettings) => void;
  updateContentSettings: (settings: ContentSettings) => void;
  
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);

  // Initial Load & Sync
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DATA_STORE);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        let needsSave = false;
        
        // Ensure questions array exists in stored data (migration)
        if (!parsed.questions) {
            parsed.questions = INITIAL_DATA.questions;
            needsSave = true;
        }

        // Ensure game settings exist (migration)
        if (!parsed.gameSettings) {
            parsed.gameSettings = INITIAL_GAME_SETTINGS;
            needsSave = true;
        } else {
            // MIGRATION: Convert Hours to Minutes if old format exists
            const settings: any = parsed.gameSettings;
            if (settings.cooldownLossHours !== undefined) {
               settings.cooldownLossMinutes = (settings.cooldownLossHours * 60) || 60;
               delete settings.cooldownLossHours;
               needsSave = true;
            } else if (settings.cooldownLossMinutes === undefined) {
               settings.cooldownLossMinutes = INITIAL_GAME_SETTINGS.cooldownLossMinutes;
               needsSave = true;
            }

            if (settings.cooldownWinHours !== undefined) {
               settings.cooldownWinMinutes = (settings.cooldownWinHours * 60) || 1440;
               delete settings.cooldownWinHours;
               needsSave = true;
            } else if (settings.cooldownWinMinutes === undefined) {
               settings.cooldownWinMinutes = INITIAL_GAME_SETTINGS.cooldownWinMinutes;
               needsSave = true;
            }
        }

        // Ensure Content Settings exist (migration)
        if (!parsed.contentSettings) {
            parsed.contentSettings = INITIAL_CONTENT_SETTINGS;
            needsSave = true;
        }

        // Ensure categories exist (migration for old data)
        if (!parsed.categories || parsed.categories.length === 0) {
            parsed.categories = INITIAL_DATA.categories;
            needsSave = true;
        } else {
            // Migration: Ensure all categories have isActive defined (default to true)
            const migratedCategories = parsed.categories.map((c: any) => ({
                ...c,
                isActive: c.isActive !== undefined ? c.isActive : true
            }));
            
            // Check if any change occurred
            if (JSON.stringify(migratedCategories) !== JSON.stringify(parsed.categories)) {
                parsed.categories = migratedCategories;
                needsSave = true;
            }
        }

        // Ensure reviews exist (migration)
        if (!parsed.reviews) {
            parsed.reviews = INITIAL_DATA.reviews;
            needsSave = true;
        }

        if (needsSave) {
            saveToStorage(parsed);
        }

        setData(parsed);
      } catch (e) {
        console.error("Failed to parse local data, seeding initial data.");
        saveToStorage(INITIAL_DATA);
      }
    } else {
      // Seed if empty
      saveToStorage(INITIAL_DATA);
    }
  }, []);

  const saveToStorage = (newData: AppData) => {
    localStorage.setItem(STORAGE_KEYS.DATA_STORE, JSON.stringify(newData));
    setData(newData);
  };

  const refreshData = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.DATA_STORE);
    if (stored) setData(JSON.parse(stored));
  };

  // --- Product Actions ---
  const addProduct = (newP: Omit<Product, 'id'>) => {
    const newId = Math.max(...data.products.map(p => p.id), 0) + 1;
    const newData = {
      ...data,
      products: [...data.products, { ...newP, id: newId }]
    };
    saveToStorage(newData);
  };

  const updateProduct = (updatedP: Product) => {
    const newData = {
      ...data,
      products: data.products.map(p => p.id === updatedP.id ? updatedP : p)
    };
    saveToStorage(newData);
  };

  const deleteProduct = (id: number) => {
    const newData = {
      ...data,
      products: data.products.filter(p => p.id !== id)
    };
    saveToStorage(newData);
  };

  // --- Package Actions ---
  const addPackage = (newPkg: Omit<Package, 'id'>) => {
    const newId = `pkg_${Date.now()}`;
    const newData = {
      ...data,
      packages: [...data.packages, { ...newPkg, id: newId }]
    };
    saveToStorage(newData);
  };

  const updatePackage = (updatedPkg: Package) => {
    const newData = {
      ...data,
      packages: data.packages.map(p => p.id === updatedPkg.id ? updatedPkg : p)
    };
    saveToStorage(newData);
  };

  const deletePackage = (id: string) => {
    const newData = {
      ...data,
      packages: data.packages.filter(p => p.id !== id)
    };
    saveToStorage(newData);
  };

  // --- Brand Actions ---
  const addBrand = (newB: Omit<Brand, 'id'>) => {
    const newId = Math.max(...data.brands.map(b => b.id), 0) + 1;
    const newData = {
      ...data,
      brands: [...data.brands, { ...newB, id: newId }]
    };
    saveToStorage(newData);
  };

  const updateBrand = (updatedB: Brand) => {
    const newData = {
      ...data,
      brands: data.brands.map(b => b.id === updatedB.id ? updatedB : b)
    };
    saveToStorage(newData);
  };

  const deleteBrand = (id: number) => {
    const newData = {
      ...data,
      brands: data.brands.filter(b => b.id !== id)
    };
    saveToStorage(newData);
  };

  // --- Category Actions ---
  const addCategory = (newC: Omit<Category, 'id'>) => {
    // Generate simple ID
    const newId = `cat_${Date.now()}`;
    const newData = {
      ...data,
      categories: [...data.categories, { ...newC, id: newId }]
    };
    saveToStorage(newData);
  };

  const updateCategory = (updatedC: Category) => {
    const newData = {
      ...data,
      categories: data.categories.map(c => c.id === updatedC.id ? updatedC : c)
    };
    saveToStorage(newData);
  };

  const deleteCategory = (id: string) => {
    const newData = {
      ...data,
      categories: data.categories.filter(c => c.id !== id)
    };
    saveToStorage(newData);
  };

  // --- Review Actions ---
  const addReview = (newReview: Omit<Review, 'id'>) => {
    const newId = `rev_${Date.now()}`;
    const newData = {
      ...data,
      reviews: [...data.reviews, { ...newReview, id: newId }]
    };
    saveToStorage(newData);
  };

  const updateReview = (updatedReview: Review) => {
    const newData = {
      ...data,
      reviews: data.reviews.map(r => r.id === updatedReview.id ? updatedReview : r)
    };
    saveToStorage(newData);
  };

  const deleteReview = (id: string) => {
    const newData = {
      ...data,
      reviews: data.reviews.filter(r => r.id !== id)
    };
    saveToStorage(newData);
  };

  // --- Question Actions ---
  const addQuestion = (newQ: Omit<Question, 'id'>) => {
    const newId = Math.max(...data.questions.map(q => q.id), 0) + 1;
    const newData = {
      ...data,
      questions: [...data.questions, { ...newQ, id: newId }]
    };
    saveToStorage(newData);
  };

  const updateQuestion = (updatedQ: Question) => {
    const newData = {
      ...data,
      questions: data.questions.map(q => q.id === updatedQ.id ? updatedQ : q)
    };
    saveToStorage(newData);
  };

  const deleteQuestion = (id: number) => {
    const newData = {
      ...data,
      questions: data.questions.filter(q => q.id !== id)
    };
    saveToStorage(newData);
  };

  // --- Game Settings Actions ---
  const updateGameSettings = (settings: GameSettings) => {
    const newData = {
      ...data,
      gameSettings: settings
    };
    saveToStorage(newData);
  };

  // --- Content Settings Actions ---
  const updateContentSettings = (settings: ContentSettings) => {
    const newData = {
      ...data,
      contentSettings: settings
    };
    saveToStorage(newData);
  };

  return (
    <DataContext.Provider value={{
      ...data,
      addProduct, updateProduct, deleteProduct,
      addPackage, updatePackage, deletePackage,
      addBrand, updateBrand, deleteBrand,
      addCategory, updateCategory, deleteCategory,
      addQuestion, updateQuestion, deleteQuestion,
      addReview, updateReview, deleteReview,
      updateGameSettings,
      updateContentSettings,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};