import { ArrowUpCircle, ArrowDownCircle, BarChart } from 'lucide-react';
import { Prediction } from '../hooks/predictions';
import { Card, CardContent } from './ui/card';

interface PredictionCardProps {
  prediction: Prediction;
}

function isValidPrediction(prediction: Prediction): boolean {
  return !!(
    prediction &&
    prediction.symbol &&
    prediction.lastPrice !== undefined &&
    prediction.predictedPrice !== undefined &&
    prediction.signals &&
    prediction.signals.type &&
    prediction.signals.entry !== undefined &&
    prediction.signals.stopLoss !== undefined &&
    prediction.signals.takeProfit !== undefined &&
    prediction.signals.potentialReturn !== undefined &&
    prediction.signals.confidence
  );
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  if (!isValidPrediction(prediction)) {
    return null;
  }

  const isPositivePrediction = prediction.predictedPrice > prediction.lastPrice;
  const priceDifference = prediction.predictedPrice - prediction.lastPrice;
  const percentageChange = (priceDifference / prediction.lastPrice) * 100;

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return 'text-green-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSignalColor = (type: string) => {
    return type === 'BUY' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">{prediction.symbol}</h3>
            <p className="text-gray-500">Last Updated: {new Date(prediction.timestamp).toLocaleString()}</p>
          </div>
          <div className={`flex items-center ${getSignalColor(prediction.signals.type)}`}>
            {prediction.signals.type === 'BUY' ? (
              <ArrowUpCircle className="w-6 h-6" />
            ) : (
              <ArrowDownCircle className="w-6 h-6" />
            )}
            <span className="ml-2 font-semibold">{prediction.signals.type}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Last Price</p>
            <p className="text-xl font-semibold">${prediction.lastPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Predicted Price</p>
            <p className={`text-xl font-semibold ${isPositivePrediction ? 'text-green-600' : 'text-red-600'}`}>
              ${prediction.predictedPrice.toFixed(2)}
              <span className="text-sm ml-1">
                ({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Entry</p>
            <p className="font-medium">${prediction.signals.entry.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stop Loss</p>
            <p className="font-medium text-red-600">${prediction.signals.stopLoss.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Take Profit</p>
            <p className="font-medium text-green-600">${prediction.signals.takeProfit.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center">
            <BarChart className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">Potential Return:</span>
            <span className="ml-2 font-medium">
              {prediction.signals.potentialReturn.toFixed(2)}%
            </span>
          </div>
          <div className={`flex items-center ${getConfidenceColor(prediction.signals.confidence)}`}>
            <span className="text-sm mr-2">Confidence:</span>
            <span className="font-medium">{prediction.signals.confidence}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}