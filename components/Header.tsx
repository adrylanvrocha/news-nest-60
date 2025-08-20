'use client';

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Header = () => {
  const categories = [
    { name: "Últimas", href: "/" },
    { name: "Política", href: "/politica" },
    { name: "Mundo", href: "/mundo" },
    { name: "Cultura", href: "/cultura" },
    { name: "Entretenimento", href: "/entretenimento" },
    { name: "Podcasts", href: "/podcasts" }
  ];

  return (
    <header className="bg-background border-b border-border">
      {/* Top banner space */}
      <div className="bg-muted py-2 text-center text-body-small text-muted-foreground">
        Espaço para Banner TOP
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <span className="text-heading-2 font-bold text-foreground">Frances News</span>
          </Link>
          
          {/* Search */}
          <div className="relative max-w-md w-full mx-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar notícias..." 
              className="pl-10 bg-muted border-0 focus:ring-2 focus:ring-primary"
            />
          </div>
          
          {/* CTA Button */}
          <Button variant="default" className="bg-primary hover:bg-primary-hover">
            Newsletter
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center space-x-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;