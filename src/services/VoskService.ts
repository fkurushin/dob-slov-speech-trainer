import { createModel, Model } from 'vosk-browser';

// Singleton service to manage Vosk model
class VoskService {
  private static instance: VoskService;
  private model: Model | null = null;
  private modelPromise: Promise<Model> | null = null;
  private modelStatus: 'not-loaded' | 'loading' | 'loaded' | 'error' = 'not-loaded';
  private loadingProgress: number = 0;
  private progressListeners: ((progress: number) => void)[] = [];
  private statusListeners: ((status: string) => void)[] = [];

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): VoskService {
    if (!VoskService.instance) {
      VoskService.instance = new VoskService();
    }
    return VoskService.instance;
  }

  public addProgressListener(listener: (progress: number) => void): () => void {
    this.progressListeners.push(listener);
    // Return function to remove listener
    return () => {
      this.progressListeners = this.progressListeners.filter(l => l !== listener);
    };
  }

  public addStatusListener(listener: (status: string) => void): () => void {
    this.statusListeners.push(listener);
    // Return function to remove listener
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private updateProgress(progress: number): void {
    this.loadingProgress = progress;
    this.progressListeners.forEach(listener => listener(progress));
  }

  private updateStatus(status: string): void {
    this.modelStatus = status as any;
    this.statusListeners.forEach(listener => listener(status));
  }

  public getLoadingProgress(): number {
    return this.loadingProgress;
  }

  public getModelStatus(): string {
    return this.modelStatus;
  }

  public async getModel(): Promise<Model> {
    // If model is already loaded, return it immediately
    if (this.model) {
      return this.model;
    }

    // If model is currently loading, return the existing promise
    if (this.modelPromise) {
      return this.modelPromise;
    }

    // Start loading the model
    this.updateStatus('loading');
    
    // Set up a progress tracker
    const progressTracker = (event: MessageEvent) => {
      if (event.data && event.data.type === 'progress' && typeof event.data.progress === 'number') {
        this.updateProgress(Math.round(event.data.progress * 100));
      }
    };
    
    // Add progress event listener
    window.addEventListener('message', progressTracker);
    
    // Create loading promise
    this.modelPromise = createModel(`${process.env.PUBLIC_URL}/models/vosk-model-small-ru.zip`, 0)
      .then(model => {
        // Remove progress listener
        window.removeEventListener('message', progressTracker);
        
        // Update model and status
        this.model = model;
        this.updateStatus('loaded');
        console.log('Vosk model loaded successfully');
        return model;
      })
      .catch(err => {
        // Remove progress listener
        window.removeEventListener('message', progressTracker);
        
        // Update status on error
        console.error('Error loading Vosk model:', err);
        this.updateStatus('error');
        this.modelPromise = null;
        throw err;
      });
    
    return this.modelPromise;
  }

  public cleanup(): void {
    if (this.model) {
      this.model.terminate();
      this.model = null;
    }
    this.modelPromise = null;
    this.modelStatus = 'not-loaded';
    this.loadingProgress = 0;
  }
}

export default VoskService; 