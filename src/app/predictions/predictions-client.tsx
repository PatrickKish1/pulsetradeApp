'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/src/components/Header';
import { Button } from '@/src/components/ui/button';
import useAuth from '@/src/lib/hooks/useAuth';
import { Prediction } from '@/src/hooks/predictions';
import PredictionCard from '@/src/components/PredictionCard';
import { usePayment } from '@/src/hooks/usePayment';

interface PredictionsClientProps {
  initialPredictions: Prediction[];
}

export default function PredictionsClient({ initialPredictions = [] }: PredictionsClientProps) {
  const { address, isConnected, isLoading: authLoading } = useAuth();
  const { initializePayment, checkUserAccess } = usePayment();
  const [predictions, setPredictions] = useState<Prediction[]>(initialPredictions);
  const [visiblePredictions, setVisiblePredictions] = useState<Prediction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Define pagination constants
  const INITIAL_PREDICTIONS = 9;
  const PREDICTIONS_PER_PAGE = 15;
  const totalPages = hasFullAccess 
    ? Math.ceil(predictions.length / PREDICTIONS_PER_PAGE) 
    : 1;

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/predictions');
      if (!response.ok) throw new Error('Failed to fetch predictions');
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      const access = await checkUserAccess();
      setHasFullAccess(access);
    };

    if (address) {
      checkAccess();
    }
  }, [address, checkUserAccess]);

  useEffect(() => {
    if (hasFullAccess) {
      const start = (currentPage - 1) * PREDICTIONS_PER_PAGE;
      const end = start + PREDICTIONS_PER_PAGE;
      setVisiblePredictions(predictions.slice(start, end));
    } else {
      setVisiblePredictions(predictions.slice(0, INITIAL_PREDICTIONS));
    }
  }, [predictions, currentPage, hasFullAccess]);

  const refreshPredictions = async () => {
    setIsRefreshing(true);
    try {
      await fetchPredictions();
    } finally {
      setIsRefreshing(false);
    }
  };

  // PAYMENT CHARGES
  const handleAccessPayment = async () => {
    await initializePayment(1600); // access fee
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8">Please connect your wallet to view predictions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Market Predictions</h1>
            {isRefreshing && (
              <span className="text-sm text-gray-500">(Updating...)</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={refreshPredictions}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto">
          {Array.isArray(visiblePredictions) && visiblePredictions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePredictions.map((prediction, index) => (
                  <PredictionCard 
                    key={`${prediction._id || prediction.symbol + '-' + index}`} 
                    prediction={prediction} 
                  />
                ))}
              </div>
              
              {!hasFullAccess && predictions.length > INITIAL_PREDICTIONS && (
                <div className="mt-10 mb-12 text-center bg-yellow-100 p-4 rounded-lg flex items-center justify-center">
                  <Lock className="mr-2 text-yellow-600" />
                  <p className="text-yellow-800 mr-4">
                    Unlock full predictions access for just $2
                  </p>
                  <Button 
                    onClick={handleAccessPayment}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Unlock Access
                  </Button>
                </div>
              )}

              {/* Pagination controls - only shown after payment and if there are multiple pages */}
              {hasFullAccess && totalPages > 1 && (
                <div className="mt-6 flex justify-center space-x-4">
                  <Button 
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button 
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 text-lg mb-6">No predictions available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}





// 'use client';

// import { useEffect, useState } from 'react';
// import { RefreshCw } from 'lucide-react';
// import Header from '@/src/components/Header';
// import { Button } from '@/src/components/ui/button';
// import useAuth from '@/src/lib/hooks/useAuth';
// import { Prediction } from '@/src/hooks/predictions';
// import PredictionCard from '@/src/components/PredictionCard';



// export default function PredictionsPage() {
//   const { address, isConnected, isLoading: authLoading } = useAuth();
//   const [predictions, setPredictions] = useState<Prediction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const fetchPredictions = async (isRefresh = false) => {
//     if (isRefresh) setIsRefreshing(true);
//     try {
//       const response = await fetch('/api/predictions', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       setPredictions(data);
//     } catch (error) {
//       console.error('Error fetching predictions:', error);
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     if (!authLoading) {
//       fetchPredictions();
//     }
//   }, [authLoading]);

//   if (authLoading) {
//     return (
//       <div className="min-h-screen flex flex-col bg-gray-50">
//         <Header />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!isConnected || !address) {
//     return (
//       <div className="min-h-screen flex flex-col bg-gray-50">
//         <Header />
//         <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
//             <p className="text-gray-600 mb-8">Please connect your wallet to view predictions</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Header />
//       <main className="flex-1 container mx-auto px-4 py-6">
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-2">
//             <h1 className="text-2xl font-bold text-gray-900">Market Predictions</h1>
//             {(loading || isRefreshing) && (
//               <span className="text-sm text-gray-500">(Updating...)</span>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               className="p-1"
//               onClick={() => fetchPredictions(true)}
//               disabled={isRefreshing}
//             >
//               <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
//             </Button>
//           </div>
//         </div>

//         <div className="w-full max-w-7xl mx-auto">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
//               <p className="text-gray-600">Loading predictions...</p>
//             </div>
//           ) : predictions.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {predictions.map((prediction, index) => (
//                 <PredictionCard key={`${prediction.symbol}-${index}`} prediction={prediction} />
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <p className="text-gray-500 text-lg mb-6">No predictions available</p>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }