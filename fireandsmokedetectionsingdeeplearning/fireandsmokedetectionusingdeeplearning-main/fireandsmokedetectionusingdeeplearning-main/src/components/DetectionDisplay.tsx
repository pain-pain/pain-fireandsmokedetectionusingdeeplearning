
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FireIcon from './FireIcon';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

export type DetectionResult = {
  label: string;
  confidence: number;
  bbox?: { x: number; y: number; width: number; height: number };
};

type DetectionDisplayProps = {
  detectionResults: DetectionResult[] | null;
  isAnalyzing: boolean;
  imagePreview: string | null;
};

const DetectionDisplay: React.FC<DetectionDisplayProps> = ({ 
  detectionResults, 
  isAnalyzing,
  imagePreview
}) => {
  // Improved check for fire/smoke with more accurate criteria
  const hasFireOrSmoke = detectionResults?.some(
    result => (
      (result.label.toLowerCase().includes('fire') || 
       result.label.toLowerCase().includes('smoke') ||
       result.label.toLowerCase().includes('flame') ||
       result.label.toLowerCase().includes('hazard')) && 
      result.confidence > 0.45  // Slightly lower threshold to catch more potential fires
    )
  );

  // Get the highest confidence fire/smoke detection for display with improved matching
  const highestConfidenceResult = detectionResults?.reduce((prev, current) => {
    const isFireRelated = 
      current.label.toLowerCase().includes('fire') || 
      current.label.toLowerCase().includes('smoke') ||
      current.label.toLowerCase().includes('flame') ||
      current.label.toLowerCase().includes('hazard');
      
    if (isFireRelated && current.confidence > (prev?.confidence || 0)) {
      return current;
    }
    return prev;
  }, null as DetectionResult | null);

  const renderDetectionBox = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-pulse flex flex-col items-center">
            <FireIcon size={48} className="text-fire-500 mb-4" />
            <p className="text-lg">Analyzing...</p>
          </div>
        </div>
      );
    }

    if (!detectionResults || detectionResults.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">No detections yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {detectionResults.map((result, index) => {
          // Determine if this result is fire-related
          const isFireRelated = 
            result.label.toLowerCase().includes('fire') || 
            result.label.toLowerCase().includes('smoke') ||
            result.label.toLowerCase().includes('flame') ||
            result.label.toLowerCase().includes('hazard');
            
          // Set color based on confidence and whether it's fire-related
          const confidenceColor = isFireRelated 
            ? result.confidence > 0.65 ? 'text-red-500' 
            : result.confidence > 0.45 ? 'text-amber-500' 
            : 'text-yellow-400'
            : result.confidence > 0.7 ? 'text-green-500' 
            : 'text-blue-400';
            
          // Set progress bar color
          const progressBarColor = isFireRelated
            ? result.confidence > 0.65 ? 'bg-red-900' 
            : result.confidence > 0.45 ? 'bg-amber-900' 
            : 'bg-yellow-900'
            : result.confidence > 0.7 ? 'bg-green-900' 
            : 'bg-blue-900';
          
          return (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{result.label}</span>
                <span className={`font-medium ${confidenceColor}`}>
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <Progress 
                value={result.confidence * 100}
                className={`h-2 ${progressBarColor}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {imagePreview && (
        <div className="relative rounded-lg overflow-hidden">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-auto object-contain max-h-[400px]"
          />
          {/* For future: Add bounding boxes on image if bbox coordinates are provided */}
        </div>
      )}
    
      <Card className={`border ${hasFireOrSmoke ? 'border-red-500' : 'border-gray-800'}`}>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FireIcon className="mr-2 text-fire-500" /> 
            Detection Results
          </h2>
          
          {renderDetectionBox()}
          
          {hasFireOrSmoke && highestConfidenceResult && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                {highestConfidenceResult.label} detected with {Math.round(highestConfidenceResult.confidence * 100)}% confidence! 
                {highestConfidenceResult.confidence > 0.65 && " Alert sent to emergency services."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetectionDisplay;
