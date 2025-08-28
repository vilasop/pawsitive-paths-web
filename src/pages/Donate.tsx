import { useState } from "react";
import { Heart, CreditCard, Smartphone, Building2, Wallet, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Donate = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationType, setDonationType] = useState("one-time");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  const impactMessages = {
    25: "Provides food for a rescue animal for one week",
    50: "Covers basic vaccinations for one animal",
    100: "Provides emergency medical care",
    250: "Sponsors a complete health check-up",
    500: "Covers major medical surgery",
    1000: "Supports our shelter operations for a full day"
  };

  const handleDonorInfoChange = (field: string, value: string) => {
    setDonorInfo(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('donations')
        .insert({
          name: `${donorInfo.firstName} ${donorInfo.lastName}`,
          email: donorInfo.email,
          phone: donorInfo.phone || '',
          amount: parseFloat(donationAmount),
          payment_status: 'success'
        });

      if (error) throw error;

      toast({
        title: "Donation Successful!",
        description: "Thank you for your generous donation! Your contribution will help save animal lives.",
      });

      // Reset form
      setStep(1);
      setDonationAmount("");
      setDonorInfo({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem processing your donation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-8 bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Make a Difference Today
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your donation helps us rescue, rehabilitate, and rehome animals in need. 
            Every contribution makes a real impact.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= i 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {i}
                </div>
                {i < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > i ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-medium">
          <CardContent className="p-8">
            {/* Step 1: Donation Amount */}
            {step === 1 && (
              <div>
                <CardHeader className="px-0 pb-6">
                  <CardTitle className="text-2xl text-center">Choose Your Donation Amount</CardTitle>
                </CardHeader>

                {/* Donation Type */}
                <div className="mb-8">
                  <Label className="text-base font-semibold mb-4 block">Donation Type</Label>
                  <RadioGroup value={donationType} onValueChange={setDonationType} className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one-time" id="one-time" />
                      <Label htmlFor="one-time">One-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Predefined Amounts */}
                <div className="mb-6">
                  <Label className="text-base font-semibold mb-4 block">Quick Amount Selection</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {predefinedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={donationAmount === amount.toString() ? "default" : "outline"}
                        onClick={() => setDonationAmount(amount.toString())}
                        className="h-20 flex flex-col"
                      >
                        <span className="text-xl font-bold">${amount}</span>
                        <span className="text-xs text-center mt-1 opacity-80">
                          {impactMessages[amount as keyof typeof impactMessages]}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="mb-8">
                  <Label htmlFor="custom-amount" className="text-base font-semibold mb-2 block">
                    Or enter a custom amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="0.00"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Impact Message */}
                {donationAmount && (
                  <div className="mb-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-primary">Your Impact:</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your ${donationAmount} donation will help us continue our mission of saving animal lives.
                    </p>
                  </div>
                )}

                <Button 
                  onClick={nextStep} 
                  disabled={!donationAmount}
                  className="w-full hero-button-primary"
                >
                  Continue to Donor Information
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Donor Information */}
            {step === 2 && (
              <div>
                <CardHeader className="px-0 pb-6">
                  <CardTitle className="text-2xl text-center">Donor Information</CardTitle>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={donorInfo.firstName}
                      onChange={(e) => handleDonorInfoChange('firstName', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={donorInfo.lastName}
                      onChange={(e) => handleDonorInfoChange('lastName', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={donorInfo.email}
                      onChange={(e) => handleDonorInfoChange('email', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={donorInfo.phone}
                      onChange={(e) => handleDonorInfoChange('phone', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={donorInfo.address}
                      onChange={(e) => handleDonorInfoChange('address', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={donorInfo.city}
                      onChange={(e) => handleDonorInfoChange('city', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={donorInfo.zipCode}
                      onChange={(e) => handleDonorInfoChange('zipCode', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mt-8">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={!donorInfo.firstName || !donorInfo.lastName || !donorInfo.email}
                    className="flex-1 hero-button-primary"
                  >
                    Continue to Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div>
                <CardHeader className="px-0 pb-6">
                  <CardTitle className="text-2xl text-center">Payment Method</CardTitle>
                </CardHeader>

                {/* Donation Summary */}
                <div className="mb-8 p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Donation Summary</h3>
                  <div className="flex justify-between items-center">
                    <span>
                      {donationType === 'monthly' ? 'Monthly' : 'One-time'} Donation
                    </span>
                    <span className="font-bold text-lg">${donationAmount}</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <Label className="text-base font-semibold mb-4 block">Choose Payment Method</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('upi')}
                      className="h-16 flex items-center justify-center space-x-3"
                    >
                      <Smartphone className="h-6 w-6" />
                      <span>UPI</span>
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('card')}
                      className="h-16 flex items-center justify-center space-x-3"
                    >
                      <CreditCard className="h-6 w-6" />
                      <span>Credit/Debit Card</span>
                    </Button>
                    <Button
                      variant={paymentMethod === 'netbanking' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('netbanking')}
                      className="h-16 flex items-center justify-center space-x-3"
                    >
                      <Building2 className="h-6 w-6" />
                      <span>Net Banking</span>
                    </Button>
                    <Button
                      variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('wallet')}
                      className="h-16 flex items-center justify-center space-x-3"
                    >
                      <Wallet className="h-6 w-6" />
                      <span>Digital Wallet</span>
                    </Button>
                  </div>
                </div>

                {/* Payment Form */}
                {paymentMethod && (
                  <div className="mb-8 p-4 rounded-lg border border-border">
                    <h4 className="font-semibold mb-4">
                      {paymentMethod === 'upi' && 'UPI Payment'}
                      {paymentMethod === 'card' && 'Card Details'}
                      {paymentMethod === 'netbanking' && 'Net Banking'}
                      {paymentMethod === 'wallet' && 'Digital Wallet'}
                    </h4>
                    
                    {paymentMethod === 'upi' && (
                      <div>
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input id="upi-id" placeholder="yourname@upi" className="form-input" />
                      </div>
                    )}
                    
                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input id="card-number" placeholder="1234 5678 9012 3456" className="form-input" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" className="form-input" />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" className="form-input" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === 'netbanking' && (
                      <div>
                        <Label htmlFor="bank">Select Bank</Label>
                        <select className="w-full form-input">
                          <option>Select your bank</option>
                          <option>State Bank of India</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Axis Bank</option>
                        </select>
                      </div>
                    )}
                    
                    {paymentMethod === 'wallet' && (
                      <div>
                        <Label htmlFor="wallet">Select Wallet</Label>
                        <select className="w-full form-input">
                          <option>Select wallet</option>
                          <option>Paytm</option>
                          <option>PhonePe</option>
                          <option>Google Pay</option>
                          <option>Amazon Pay</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!paymentMethod}
                    className="flex-1 hero-button-primary"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Donate ${donationAmount}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Why Donate Section */}
        <Card className="mt-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Why Your Donation Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="font-semibold mb-2">Medical Care</h3>
                <p className="text-muted-foreground text-sm">
                  Provide life-saving medical treatments, surgeries, and ongoing healthcare for rescued animals.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="font-semibold mb-2">Food & Shelter</h3>
                <p className="text-muted-foreground text-sm">
                  Ensure every animal has nutritious food, clean water, and a safe place to stay.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="font-semibold mb-2">Training & Support</h3>
                <p className="text-muted-foreground text-sm">
                  Fund behavioral training and support programs to help animals find loving homes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Donate;