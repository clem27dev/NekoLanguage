import React from "react";
import { Link } from "wouter";
import { FaDiscord, FaGithub, FaBook } from "react-icons/fa";

interface CommunityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ 
  icon, 
  title, 
  description, 
  linkText, 
  linkHref 
}) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center h-16 w-16 bg-neko-primary bg-opacity-10 rounded-full mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="font-poppins font-semibold text-xl mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <a 
        href={linkHref} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-neko-primary font-medium hover:underline"
      >
        {linkText}
      </a>
    </div>
  );
};

const CommunitySection: React.FC = () => {
  const communityItems = [
    {
      icon: <FaDiscord className="text-neko-primary text-2xl" />,
      title: "Discord",
      description: "Rejoignez notre serveur Discord pour discuter avec d'autres développeurs nekoScript.",
      linkText: "Rejoindre le Discord",
      linkHref: "#"
    },
    {
      icon: <FaGithub className="text-neko-primary text-2xl" />,
      title: "GitHub",
      description: "Contribuez au développement de nekoScript ou partagez vos projets sur GitHub.",
      linkText: "Voir le GitHub",
      linkHref: "#"
    },
    {
      icon: <FaBook className="text-neko-primary text-2xl" />,
      title: "Documentation",
      description: "Explorez la documentation complète et les tutoriels pour maîtriser nekoScript.",
      linkText: "Consulter la documentation",
      linkHref: "/documentation"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-bold text-3xl text-center mb-12">
          Rejoignez la communauté nekoScript
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communityItems.map((item, index) => (
            <CommunityCard 
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              linkText={item.linkText}
              linkHref={item.linkHref}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
