
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type ModelOption = {
  id: string;
  name: string;
  type: 'uploaded' | 'realtime';
};

export type ModelType = 'CNN' | 'MobileNetV2';

type ModelSelectorProps = {
  selectedModelId: string;
  onChange: (modelId: string) => void;
};

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModelId, onChange }) => {
  const modelOptions: ModelOption[] = [
    { id: 'cnn-uploaded', name: 'CNN (Uploaded Image)', type: 'uploaded' },
    { id: 'cnn-realtime', name: 'CNN (Real-time Detection)', type: 'realtime' },
    { id: 'mobilenet-uploaded', name: 'MobileNetV2 (Uploaded Image)', type: 'uploaded' },
    { id: 'mobilenet-realtime', name: 'MobileNetV2 (Real-time Detection)', type: 'realtime' },
  ];

  return (
    <Card className="border border-gray-800">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Select Model</h2>
        <RadioGroup value={selectedModelId} onValueChange={onChange} className="space-y-2">
          {modelOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="cursor-pointer">{option.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ModelSelector;
