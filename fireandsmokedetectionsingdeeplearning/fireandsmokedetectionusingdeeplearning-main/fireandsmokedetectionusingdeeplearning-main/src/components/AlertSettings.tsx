
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { PhoneCall } from 'lucide-react';

type AlertSettingsProps = {
  onSave: (phoneNumber: string, threshold: number) => void;
};

const AlertSettings: React.FC<AlertSettingsProps> = ({ onSave }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [threshold, setThreshold] = useState('70');
  const { toast } = useToast();

  const handleSave = () => {
    // Basic validation
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    const thresholdNumber = parseInt(threshold, 10);
    if (isNaN(thresholdNumber) || thresholdNumber < 1 || thresholdNumber > 100) {
      toast({
        title: "Invalid threshold",
        description: "Threshold must be between 1 and 100",
        variant: "destructive",
      });
      return;
    }

    onSave(phoneNumber, thresholdNumber / 100);
    
    toast({
      title: "Settings saved",
      description: "Alert settings have been updated",
    });
  };

  return (
    <Card className="border border-gray-800">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <PhoneCall className="h-5 w-5 mr-2 text-primary" />
          Alert Settings
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Emergency Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="threshold">Alert Threshold (%)</Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              max="100"
              placeholder="70"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Send alert when detection confidence exceeds this threshold
            </p>
          </div>
          
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertSettings;
