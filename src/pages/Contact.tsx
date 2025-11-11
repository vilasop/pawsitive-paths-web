import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validators, errorMessages } from "@/lib/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Contact = () => {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!validators.required(formData.name)) newErrors.name = errorMessages.required;
    if (!validators.email(formData.email)) newErrors.email = errorMessages.email;
    if (formData.phone && !validators.phone(formData.phone)) newErrors.phone = errorMessages.phone;
    if (!validators.required(formData.message)) newErrors.message = errorMessages.required;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form and try again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          message: `Subject: ${formData.subject}\n\n${formData.message}`
        });

      if (error) {
        console.error("Contact submission error:", error);
        toast({
          title: "Submission Failed",
          description: error.message || "There was a problem sending your message. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for your message! We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Phone",
      details: ["+1 (555) 123-4567", "Mon-Fri: 9AM-6PM", "Sat-Sun: 10AM-4PM"]
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email",
      details: ["help@pawshaven.org", "adoptions@pawshaven.org", "volunteer@pawshaven.org"]
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Address",
      details: ["123 Shelter Lane", "Pet City, PC 12345", "United States"]
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Hours",
      details: ["Mon-Fri: 9AM-6PM", "Saturday: 10AM-4PM", "Sunday: 12PM-4PM"]
    }
  ];

  const emergencyContacts = [
    {
      title: "24/7 Emergency Animal Line",
      number: "+1 (555) 911-PETS",
      description: "For injured or distressed animals"
    },
    {
      title: "Police Emergency",
      number: "911",
      description: "For dangerous animal situations"
    },
    {
      title: "Fire Department",
      number: "911", 
      description: "For animals trapped in emergencies"
    },
    {
      title: "Animal Control",
      number: "+1 (555) ANIMAL",
      description: "For stray or aggressive animals"
    }
  ];

  const departments = [
    "General Information",
    "Animal Adoption",
    "Volunteer Opportunities", 
    "Donations & Fundraising",
    "Lost & Found Pets",
    "Medical Services",
    "Educational Programs",
    "Media & Press Inquiries"
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about adoption, volunteering, or our services? 
            We're here to help! Reach out to us using any of the methods below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="animal-card">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      {info.icon}
                      <h3 className="text-lg font-semibold">{info.title}</h3>
                    </div>
                    <div className="space-y-1">
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-muted-foreground text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span>Emergency Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="border-l-4 border-destructive pl-4 py-2">
                    <h4 className="font-semibold text-foreground">{contact.title}</h4>
                    <p className="text-lg font-bold text-destructive">{contact.number}</p>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Find Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Interactive Map</p>
                    <p className="text-sm text-muted-foreground">
                      123 Shelter Lane, Pet City, PC 12345
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="10-digit phone number (optional)"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleFormChange('phone', value);
                      }}
                      className={errors.phone ? "form-input border-destructive" : "form-input"}
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={formData.subject} onValueChange={(value) => handleFormChange('subject', value)} required>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      className="form-input"
                      rows={6}
                      placeholder="Please provide as much detail as possible..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full hero-button-primary">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Response Times</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">General Inquiries</span>
                    <span className="font-medium">24-48 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Adoption Questions</span>
                    <span className="font-medium">Same day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Emergency Situations</span>
                    <span className="font-medium text-destructive">Immediate</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Volunteer Applications</span>
                    <span className="font-medium">48 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Visit Us Section */}
        <Card className="mt-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Plan Your Visit</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🚗</div>
                <h3 className="font-semibold mb-2">Parking</h3>
                <p className="text-muted-foreground text-sm">
                  Free parking available on-site. Accessible parking spaces near the entrance.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">♿</div>
                <h3 className="font-semibold mb-2">Accessibility</h3>
                <p className="text-muted-foreground text-sm">
                  Our facility is fully wheelchair accessible with ramps and accessible restrooms.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🐕</div>
                <h3 className="font-semibold mb-2">Pet Policy</h3>
                <p className="text-muted-foreground text-sm">
                  Personal pets are welcome but must be leashed and up-to-date on vaccinations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;