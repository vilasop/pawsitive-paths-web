import { useState } from "react";
import { Users, Clock, Award, Heart, Calendar, User, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const Volunteer = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    experience: "",
    availability: [],
    skills: [],
    motivation: "",
  });

  const availabilityOptions = [
    "Weekday mornings",
    "Weekday afternoons", 
    "Weekday evenings",
    "Weekend mornings",
    "Weekend afternoons",
    "Weekend evenings"
  ];

  const skillOptions = [
    "Animal care",
    "Dog walking",
    "Cat socialization",
    "Photography",
    "Marketing/Social media",
    "Event planning",
    "Administrative work",
    "Fundraising",
    "Medical/Veterinary background",
    "Transportation"
  ];

  const handleAvailabilityChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: checked 
        ? [...prev.availability, option]
        : prev.availability.filter(item => item !== option)
    }));
  };

  const handleSkillsChange = (skill: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      skills: checked 
        ? [...prev.skills, skill]
        : prev.skills.filter(item => item !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your interest in volunteering! We'll contact you within 48 hours.");
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      age: "",
      experience: "",
      availability: [],
      skills: [],
      motivation: "",
    });
  };

  const requirements = [
    {
      icon: "👤",
      title: "Age Requirement",
      description: "Must be 16 years or older (under 18 requires parent/guardian consent)"
    },
    {
      icon: "⏰",
      title: "Time Commitment", 
      description: "Minimum 4 hours per month for at least 6 months"
    },
    {
      icon: "❤️",
      title: "Love for Animals",
      description: "Genuine passion for animal welfare and helping those in need"
    },
    {
      icon: "🤝",
      title: "Reliability",
      description: "Commitment to scheduled volunteer shifts and responsibilities"
    }
  ];

  const benefits = [
    {
      icon: <Award className="h-8 w-8 text-secondary" />,
      title: "Certificate of Recognition",
      description: "Receive official recognition for your volunteer service hours"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community Impact",
      description: "Make a real difference in animal lives and your local community"
    },
    {
      icon: <Heart className="h-8 w-8 text-destructive" />,
      title: "Personal Fulfillment",
      description: "Experience the joy of helping animals find their forever homes"
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Flexible Schedule",
      description: "Choose volunteer opportunities that fit your lifestyle"
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Join Our Volunteer Family
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Make a difference in the lives of animals in need. Our volunteers are the heart of our organization,
            helping us rescue, care for, and find homes for countless animals.
          </p>
        </div>

        {/* Requirements */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Volunteer Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {requirements.map((req, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{req.icon}</div>
                  <h3 className="font-semibold mb-2">{req.title}</h3>
                  <p className="text-muted-foreground text-sm">{req.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Volunteer Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Opportunities */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Volunteer Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="animal-card">
                <div className="text-4xl text-center mb-4">🐕</div>
                <h3 className="font-semibold mb-2 text-center">Dog Care</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Walk dogs, help with feeding, cleaning kennels, and providing love and attention.
                </p>
              </div>
              <div className="animal-card">
                <div className="text-4xl text-center mb-4">🐱</div>
                <h3 className="font-semibold mb-2 text-center">Cat Care</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Socialize cats, help with grooming, cleaning spaces, and assist with adoption events.
                </p>
              </div>
              <div className="animal-card">
                <div className="text-4xl text-center mb-4">📋</div>
                <h3 className="font-semibold mb-2 text-center">Administrative</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Help with paperwork, phone calls, data entry, and general office support.
                </p>
              </div>
              <div className="animal-card">
                <div className="text-4xl text-center mb-4">📸</div>
                <h3 className="font-semibold mb-2 text-center">Photography</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Take photos of animals for adoption profiles and help with social media content.
                </p>
              </div>
              <div className="animal-card">
                <div className="text-4xl text-center mb-4">🎉</div>
                <h3 className="font-semibold mb-2 text-center">Event Support</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Assist with adoption events, fundraisers, and community outreach programs.
                </p>
              </div>
              <div className="animal-card">
                <div className="text-4xl text-center mb-4">🚐</div>
                <h3 className="font-semibold mb-2 text-center">Transportation</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Help transport animals to vet appointments, adoption events, and foster homes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Volunteer Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <Label className="text-base font-semibold mb-4 block">When are you available? *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availabilityOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.availability.includes(option)}
                        onCheckedChange={(checked) => handleAvailabilityChange(option, checked as boolean)}
                      />
                      <Label htmlFor={option} className="text-sm">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label className="text-base font-semibold mb-4 block">What skills or interests do you have?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skillOptions.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={formData.skills.includes(skill)}
                        onCheckedChange={(checked) => handleSkillsChange(skill, checked as boolean)}
                      />
                      <Label htmlFor={skill} className="text-sm">{skill}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <Label htmlFor="experience">Previous experience with animals (if any)</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="form-input"
                  rows={3}
                />
              </div>

              {/* Motivation */}
              <div>
                <Label htmlFor="motivation">Why do you want to volunteer with us? *</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                  className="form-input"
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full hero-button-primary">
                <Users className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Volunteer;