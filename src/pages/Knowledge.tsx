import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Utensils, 
  Stethoscope, 
  Sparkles, 
  AlertTriangle,
  Cat,
  Dog,
  Rabbit,
  Bird,
  Baby,
  Clock
} from "lucide-react";

const Knowledge = () => {
  const petData = {
    cats: {
      icon: <Cat className="w-6 h-6" />,
      lifeSpan: "12–18 years (some up to 20+)",
      stages: [
        { name: "Kitten", age: "0–6 months", description: "Needs high-protein diet, vaccines start." },
        { name: "Junior", age: "7 months–2 years", description: "Active, playful, requires training." },
        { name: "Adult", age: "3–6 years", description: "Balanced diet, yearly vet check." },
        { name: "Senior", age: "7+ years", description: "Soft diet, joint care, frequent vet visits." }
      ],
      diet: "Meat-based protein, avoid milk, age-specific food.",
      healthcare: "Vaccines (rabies, feline distemper), deworming.",
      grooming: "Brush fur weekly, clean litter box daily.",
      issues: "Kidney disease, obesity, dental problems."
    },
    dogs: {
      icon: <Dog className="w-6 h-6" />,
      lifeSpan: "10–15 years (depends on breed)",
      stages: [
        { name: "Puppy", age: "0–12 months", description: "Needs 4 meals/day, vaccination schedule." },
        { name: "Adult", age: "1–7 years", description: "2 meals/day, regular exercise." },
        { name: "Senior", age: "8+ years", description: "Softer diet, joint supplements." }
      ],
      diet: "Protein-rich, avoid chocolates, onions, grapes.",
      healthcare: "Core vaccines (rabies, parvovirus, distemper), tick prevention.",
      grooming: "Daily walks, playtime, training for discipline.",
      issues: "Hip dysplasia, obesity, heartworm."
    },
    rabbits: {
      icon: <Rabbit className="w-6 h-6" />,
      lifeSpan: "8–12 years",
      stages: [
        { name: "Baby", age: "0–3 months", description: "Mother's milk or alfalfa hay." },
        { name: "Young", age: "3–6 months", description: "Introduce vegetables, pellets." },
        { name: "Adult", age: "7+ months", description: "High-fiber diet (hay), fewer pellets." }
      ],
      diet: "80% hay, 15% veggies, 5% pellets/fruits.",
      healthcare: "Vaccination (in some regions), nail trimming, dental check.",
      grooming: "Brush weekly, keep habitat clean.",
      issues: "Overgrown teeth, digestive issues, heat stroke."
    },
    birds: {
      icon: <Bird className="w-6 h-6" />,
      lifeSpan: "5–50 years (depends on species)",
      stages: [
        { name: "Chick", age: "0–2 months", description: "Hand-feeding formula." },
        { name: "Young", age: "3–6 months", description: "Learn flying, start seeds & veggies." },
        { name: "Adult", age: "7+ months", description: "Balanced diet, social interaction." }
      ],
      diet: "Seeds, pellets, fresh fruits, veggies. Avoid avocado, chocolate, caffeine.",
      healthcare: "Regular vet visits, wings & nails trimming.",
      grooming: "Bathing or misting, cage cleaning.",
      issues: "Malnutrition, feather plucking, respiratory infections."
    }
  };

  const InfoCard = ({ icon, title, content, variant = "default" }: {
    icon: React.ReactNode;
    title: string;
    content: string | React.ReactNode;
    variant?: "default" | "warning";
  }) => (
    <Card className={`h-full ${variant === "warning" ? "border-destructive/20" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`p-2 rounded-lg ${variant === "warning" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {typeof content === "string" ? (
          <p className="text-muted-foreground leading-relaxed">{content}</p>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );

  const PetTab = ({ petKey, petInfo }: { petKey: string; petInfo: any }) => (
    <div className="space-y-6">
      {/* Life Span Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Life Span</h3>
              <p className="text-muted-foreground">{petInfo.lifeSpan}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Stages */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Baby className="w-5 h-5 text-primary" />
          Growth Stages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {petInfo.stages.map((stage: any, index: number) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-3">
                <Badge variant="secondary" className="w-fit mx-auto">
                  {stage.age}
                </Badge>
                <CardTitle className="text-lg">{stage.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Care Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          icon={<Utensils className="w-5 h-5" />}
          title="Diet & Nutrition"
          content={petInfo.diet}
        />
        <InfoCard
          icon={<Stethoscope className="w-5 h-5" />}
          title="Healthcare"
          content={petInfo.healthcare}
        />
        <InfoCard
          icon={<Sparkles className="w-5 h-5" />}
          title="Grooming & Care"
          content={petInfo.grooming}
        />
        <InfoCard
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Common Issues"
          content={petInfo.issues}
          variant="warning"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Know Your Pet
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive care guides for your beloved companions. Learn about growth stages, nutrition, healthcare, and more.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="cats" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="cats" className="flex items-center gap-2">
                <Cat className="w-4 h-4" />
                Cats
              </TabsTrigger>
              <TabsTrigger value="dogs" className="flex items-center gap-2">
                <Dog className="w-4 h-4" />
                Dogs
              </TabsTrigger>
              <TabsTrigger value="rabbits" className="flex items-center gap-2">
                <Rabbit className="w-4 h-4" />
                Rabbits
              </TabsTrigger>
              <TabsTrigger value="birds" className="flex items-center gap-2">
                <Bird className="w-4 h-4" />
                Birds
              </TabsTrigger>
            </TabsList>

            {Object.entries(petData).map(([key, data]) => (
              <TabsContent key={key} value={key}>
                <PetTab petKey={key} petInfo={data} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Knowledge;