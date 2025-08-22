import { Link } from "react-router-dom";
import { Heart, Users, Home as HomeIcon, Award, ChevronRight, Calendar, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-animals.jpg";
import { useState, useEffect } from "react";

const Home = () => {
  const [stats, setStats] = useState({
    rescued: 0,
    adopted: 0,
    volunteers: 0,
    donations: 0,
  });

  // Animate counters on mount
  useEffect(() => {
    const targets = { rescued: 2847, adopted: 2156, volunteers: 342, donations: 85000 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    const timers = Object.keys(targets).map((key) => {
      const target = targets[key as keyof typeof targets];
      const increment = target / steps;
      let current = 0;
      let step = 0;

      return setInterval(() => {
        step++;
        current = Math.min(current + increment, target);
        setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        
        if (step >= steps) {
          setStats(prev => ({ ...prev, [key]: target }));
          clearInterval(timers[Object.keys(targets).indexOf(key)]);
        }
      }, stepTime);
    });

    return () => timers.forEach(timer => clearInterval(timer));
  }, []);

  const successStories = [
    {
      name: "Bella",
      story: "Found injured on the streets, now living her best life with the Johnson family.",
      image: "🐕"
    },
    {
      name: "Whiskers",
      story: "This shy cat found confidence and love with his new family after 6 months at our shelter.",
      image: "🐱"
    },
    {
      name: "Max",
      story: "Senior dog who found a loving retirement home where he's spoiled every day.",
      image: "🐶"
    }
  ];

  const upcomingEvents = [
    {
      title: "Adoption Day Event",
      date: "March 15, 2024",
      location: "Central Park Pavilion",
      description: "Meet adoptable pets and enjoy family activities"
    },
    {
      title: "Volunteer Training",
      date: "March 20, 2024", 
      location: "Paws Haven Shelter",
      description: "Learn how to help care for our rescued animals"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Together, we give them<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-200">
              a second chance
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Every animal deserves love, care, and a forever home. Join us in making a difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/adopt" className="hero-button-primary">
              <Heart className="h-5 w-5 mr-2" />
              Adopt Now
            </Link>
            <Link to="/donate" className="hero-button-secondary">
              💰 Donate
            </Link>
            <Link to="/volunteer" className="hero-button-outline">
              <Users className="h-5 w-5 mr-2" />
              Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Paws Haven is dedicated to rescuing, rehabilitating, and rehoming animals in need. 
              We believe every animal deserves a chance at happiness and a loving forever home.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="text-center">
              <div className="stat-counter mb-2">{stats.rescued.toLocaleString()}</div>
              <p className="text-muted-foreground">Animals Rescued</p>
            </div>
            <div className="text-center">
              <div className="stat-counter mb-2">{stats.adopted.toLocaleString()}</div>
              <p className="text-muted-foreground">Animals Adopted</p>
            </div>
            <div className="text-center">
              <div className="stat-counter mb-2">{stats.volunteers.toLocaleString()}</div>
              <p className="text-muted-foreground">Volunteers</p>
            </div>
            <div className="text-center">
              <div className="stat-counter mb-2">${stats.donations.toLocaleString()}</div>
              <p className="text-muted-foreground">Donations Raised</p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              How We Help
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="animal-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rescue</h3>
              <p className="text-muted-foreground">
                We rescue animals from dangerous situations and provide immediate care.
              </p>
            </div>

            <div className="animal-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <Award className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Medical Care</h3>
              <p className="text-muted-foreground">
                Every animal receives comprehensive medical care and rehabilitation.
              </p>
            </div>

            <div className="animal-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <HomeIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Adoption</h3>
              <p className="text-muted-foreground">
                We find perfect forever homes through careful matching processes.
              </p>
            </div>

            <div className="animal-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Education</h3>
              <p className="text-muted-foreground">
                We educate the community about responsible pet ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground">
              See the amazing transformations and happy endings we've helped create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="animal-card">
                <div className="text-6xl mb-4 text-center">{story.image}</div>
                <h3 className="text-xl font-semibold mb-3 text-center">{story.name}</h3>
                <p className="text-muted-foreground text-center">{story.story}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Upcoming Events
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="animal-card">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Every action counts. Whether you adopt, donate, or volunteer, 
            you're helping save lives and create happy endings.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/adopt" className="hero-button-outline">
              Find Your Pet
              <ChevronRight className="h-5 w-5 ml-2" />
            </Link>
            <Link to="/donate" className="hero-button-outline">
              Donate Now
              <ChevronRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;