import React from 'react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Placeholder for agricultural imagery */}
          <div className="w-full h-full bg-green-900 opacity-20"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Saving the Earth, One Harvest at a Time
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Transform your warehouse into an intelligent optimization hub with real-time monitoring and AI-powered decisions
          </p>
          <Button variant="primary" className="text-lg px-8 py-4">
            Get Started
          </Button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Core Innovations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🌡️"
              title="Environmental Monitoring"
              description="Real-time tracking of temperature, humidity, and gas levels to prevent spoilage"
            />
            <FeatureCard
              icon="📊"
              title="Risk Scoring Engine"
              description="AI-powered spoilage prediction to prioritize inventory dispatch"
            />
            <FeatureCard
              icon="🎯"
              title="Smart Allocation"
              description="Demand-aware distribution ensuring optimal freshness for each channel"
            />
            <FeatureCard
              icon="🔍"
              title="Batch Traceability"
              description="Complete farmer-to-market transparency for every produce batch"
            />
            <FeatureCard
              icon="📄"
              title="AI Requirement Parsing"
              description="Convert PDF orders into structured, actionable data instantly"
            />
            <FeatureCard
              icon="♻️"
              title="Waste Reduction"
              description="Minimize post-harvest losses through intelligent intervention"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Optimize Your Warehouse?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join the agricultural revolution and transform your operations today
          </p>
          <Button variant="primary" className="text-lg px-8 py-4">
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
