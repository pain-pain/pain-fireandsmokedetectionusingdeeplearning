
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import FireIcon from '@/components/FireIcon';
import ModelSelector from '@/components/ModelSelector';
import ImageUploader from '@/components/ImageUploader';
import WebcamCapture from '@/components/WebcamCapture';
import DetectionDisplay from '@/components/DetectionDisplay';
import AlertSettings from '@/components/AlertSettings';
import { detectFireOrSmoke, sendAlertSMS } from '@/services/detectionService';
import { FireExtinguisher, AlarmSmoke, Bell } from 'lucide-react';
import { DetectionResult } from '@/components/DetectionDisplay';

const Index = () => {
  const [selectedModelId, setSelectedModelId] = useState('cnn-uploaded');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[] | null>(null);
  const [alertPhone, setAlertPhone] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(0.7);
  const { toast } = useToast();

  const isRealtimeMode = selectedModelId.includes('realtime');

  // Handle uploaded image preview
  useEffect(() => {
    if (uploadedImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(uploadedImage);
    }
  }, [uploadedImage]);

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    setDetectionResults(null);
    setImagePreview(null);
    setUploadedImage(null);
  };

  const handleImageSelected = (image: File) => {
    setUploadedImage(image);
    setDetectionResults(null);
  };

  const handleFrameCapture = (frameSrc: string) => {
    setImagePreview(frameSrc);
    processDetection(frameSrc);
  };

  const handleAlertSettingsSave = (phone: string, threshold: number) => {
    setAlertPhone(phone);
    setAlertThreshold(threshold);
  };

  const processDetection = async (imageSource: File | string) => {
    setIsAnalyzing(true);
    
    try {
      const results = await detectFireOrSmoke(imageSource, selectedModelId);
      setDetectionResults(results);
      
      // Check if we need to send an alert
      const fireDetected = results.some(result => 
        (result.label.toLowerCase().includes('fire') || result.label.toLowerCase().includes('smoke')) && 
        result.confidence >= alertThreshold
      );
      
      if (fireDetected && alertPhone) {
        try {
          await sendAlertSMS(alertPhone, results);
          toast({
            title: "Alert Sent",
            description: `Emergency alert sent to ${alertPhone}`,
          });
        } catch (error) {
          console.error('Failed to send alert:', error);
          toast({
            title: "Alert Failed",
            description: "Could not send the emergency alert",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
      toast({
        title: "Detection Failed",
        description: "An error occurred while analyzing the image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartAnalysis = () => {
    if (uploadedImage) {
      processDetection(uploadedImage);
    } else {
      toast({
        title: "No Image Selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <FireIcon size={32} className="text-fire-500 mr-3" />
            <h1 className="text-3xl font-bold">Fire and Smoke Detection App</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Alert Log
            </Button>
            <Button variant="destructive" className="flex items-center">
              <AlarmSmoke className="h-4 w-4 mr-2" />
              Emergency
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <ModelSelector 
              selectedModelId={selectedModelId} 
              onChange={handleModelChange}
            />
            
            <AlertSettings onSave={handleAlertSettingsSave} />
            
            <Card className="border border-gray-800">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FireExtinguisher className="h-5 w-5 mr-2 text-primary" />
                  About
                </h2>
                <p className="text-sm text-muted-foreground">
                  This application uses deep learning to detect fire and smoke in images and video 
                  streams. When a detection exceeds the threshold, an alert can be sent to emergency services.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-800">
              <CardContent className="pt-6">
                <Tabs defaultValue={isRealtimeMode ? "realtime" : "upload"} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger 
                      value="upload"
                      disabled={isRealtimeMode}
                    >
                      Upload Image
                    </TabsTrigger>
                    <TabsTrigger 
                      value="realtime"
                      disabled={!isRealtimeMode}
                    >
                      Real-time Detection
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <ImageUploader 
                      onImageSelected={handleImageSelected}
                    />
                    
                    {uploadedImage && (
                      <Button 
                        onClick={handleStartAnalysis}
                        disabled={isAnalyzing}
                        className="w-full"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                      </Button>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="realtime">
                    <WebcamCapture 
                      onFrame={handleFrameCapture}
                      enabled={isRealtimeMode}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <DetectionDisplay 
              detectionResults={detectionResults}
              isAnalyzing={isAnalyzing}
              imagePreview={imagePreview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
