import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type TourType = 'videoCall' | 'audioCall' | 'dashboard' | 'documents' | 'payments' | null;

// Joyride callback data type
interface CallBackProps {
    action: string;
    index: number;
    lifecycle: string;
    status: string;
    type: string;
    step?: {
        target: string;
        data?: Record<string, unknown>;
    };
}

interface TourContextType {
    isRunning: boolean;
    currentTour: TourType;
    hasCompletedTour: (tour: TourType) => boolean;
    startTour: (tour: TourType) => void;
    stopTour: () => void;
    completeTour: (tour: TourType) => void;
    resetTours: () => void;
    onTourCallback: (data: CallBackProps) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const STORAGE_KEY = 'nexus-tour-completions';

interface TourCompletions {
    videoCall?: boolean;
    audioCall?: boolean;
    dashboard?: boolean;
    documents?: boolean;
    payments?: boolean;
}

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTour, setCurrentTour] = useState<TourType>(null);
    const [completions, setCompletions] = useState<TourCompletions>({});

    // Load completions from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCompletions(JSON.parse(stored));
            }
        } catch (err) {
            console.error('Failed to load tour completions:', err);
        }
    }, []);

    // Save completions to localStorage
    const saveCompletions = useCallback((newCompletions: TourCompletions) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompletions));
            setCompletions(newCompletions);
        } catch (err) {
            console.error('Failed to save tour completions:', err);
        }
    }, []);

    const hasCompletedTour = useCallback((tour: TourType): boolean => {
        if (!tour) return false;
        return completions[tour] || false;
    }, [completions]);

    const startTour = useCallback((tour: TourType) => {
        if (!tour) return;
        setCurrentTour(tour);
        setIsRunning(true);
    }, []);

    const stopTour = useCallback(() => {
        setIsRunning(false);
        setCurrentTour(null);
    }, []);

    const completeTour = useCallback((tour: TourType) => {
        if (!tour) return;
        const newCompletions = { ...completions, [tour]: true };
        saveCompletions(newCompletions);
        setIsRunning(false);
        setCurrentTour(null);
    }, [completions, saveCompletions]);

    const resetTours = useCallback(() => {
        saveCompletions({});
        setIsRunning(false);
        setCurrentTour(null);
    }, [saveCompletions]);

    const onTourCallback = useCallback((data: CallBackProps) => {
        const { action, index, lifecycle, status, type, step } = data;

        // Track analytics
        if (type === 'step:after') {
            console.log(`Tour step ${index} completed:`, step?.target);
        }

        // Handle tour completion
        if (status === 'finished' || status === 'skipped') {
            if (currentTour) {
                completeTour(currentTour);
            }
        }

        // Handle context-specific actions
        if (action === 'next' && step?.data?.action) {
            const actionType = step.data.action as string;
            if (actionType === 'toggle-video' || actionType === 'toggle-mute') {
                // Trigger actual toggle actions if needed
                console.log(`Triggering ${actionType} during tour`);
            }
        }
    }, [currentTour, completeTour]);

    return (
        <TourContext.Provider
            value={{
                isRunning,
                currentTour,
                hasCompletedTour,
                startTour,
                stopTour,
                completeTour,
                resetTours,
                onTourCallback,
            }}
        >
            {children}
        </TourContext.Provider>
    );
};

export const useTour = (): TourContextType => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
