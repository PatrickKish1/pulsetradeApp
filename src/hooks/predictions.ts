export interface ModelMetrics {
    lookbackPeriod: number;
    iterations: number;
    learningRate: number;
    hiddenLayers: number[];
  }
  
  export interface Signal {
    type: 'BUY' | 'SELL';
    entry: number;
    prediction: number;
    stopLoss: number;
    takeProfit: number;
    potentialReturn: number;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  }
  
  export interface Prediction {
    symbol: string;
    lastPrice: number;
    predictedPrice: number;
    signals: Signal;
    modelMetrics: ModelMetrics;
    timestamp: string;
  }