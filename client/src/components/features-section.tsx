import React from "react";
import { Code, Package, Rocket } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, bgColor }) => {
  return (
    <div className="bg-neko-light p-6 rounded-lg shadow-sm border border-gray-100">
      <div className={`flex items-center justify-center h-16 w-16 ${bgColor} rounded-full mb-4 mx-auto`}>
        {icon}
      </div>
      <h3 className="font-poppins font-semibold text-xl text-center mb-3">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Code className="text-neko-primary text-xl" />,
      title: "Syntaxe simple en français",
      description: "Programmez dans votre langue maternelle avec des fonctions intuitives préfixées par 'nek'.",
      bgColor: "bg-neko-primary bg-opacity-10"
    },
    {
      icon: <Package className="text-neko-secondary text-xl" />,
      title: "Bibliothèques modulables",
      description: "Créez et partagez facilement des bibliothèques pour étendre les fonctionnalités du langage.",
      bgColor: "bg-neko-secondary bg-opacity-10"
    },
    {
      icon: <Rocket className="text-neko-accent text-xl" />,
      title: "Multi-usage",
      description: "Développez des sites web, des jeux ou des bots Discord grâce à un écosystème riche.",
      bgColor: "bg-neko-accent bg-opacity-10"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-bold text-3xl text-center mb-12">Fonctionnalités principales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              bgColor={feature.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
