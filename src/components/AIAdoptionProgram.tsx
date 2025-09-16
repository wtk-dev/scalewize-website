'use client';

import { useState, useEffect, useRef } from 'react';

interface Stage {
  id: number;
  label: string;
  purpose: string;
  chips: string[];
  cta: string;
  ctaLink?: string;
}

const stages: Stage[] = [
  {
    id: 1,
    label: 'Diagnose',
    purpose: 'Assess AI maturity, risks, and opportunities; leave with a clear roadmap.',
    chips: ['Readiness report', 'Risk register', 'Roadmap'],
    cta: 'Start Assessment',
    ctaLink: '/assessment'
  },
  {
    id: 2,
    label: 'Enable',
    purpose: 'Train ambassadors and set leadership guardrails (governance, incentives, ethics).',
    chips: ['Ambassador training', 'Governance', 'Prompt library'],
    cta: 'Begin Training',
    ctaLink: '/training'
  },
  {
    id: 3,
    label: 'Pilot',
    purpose: 'Ship a scoped V1 on henly.ai and validate real use cases.',
    chips: ['V1 chatbot', 'Test results', 'Validation report'],
    cta: 'Launch Pilot',
    ctaLink: '/pilot'
  },
  {
    id: 4,
    label: 'Deploy',
    purpose: 'Roll out the refined chatbot and playbook across the company.',
    chips: ['AI playbook', 'Training', 'Adoption dashboard'],
    cta: 'Scale Deployment',
    ctaLink: '/deploy'
  },
  {
    id: 5,
    label: 'Evolve',
    purpose: 'Improve monthly, add new use cases, and report ROI.',
    chips: ['Monthly review', 'New use cases', 'Quarterly ROI'],
    cta: 'Optimize Results',
    ctaLink: '/optimize'
  }
];

export default function AIAdoptionProgram() {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerTop = container.offsetTop;
      const containerHeight = container.offsetHeight;
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      // Calculate which stage should be active based on scroll position
      const stageHeight = containerHeight / stages.length;
      const relativeScroll = scrollPosition - containerTop;
      const stageIndex = Math.min(
        Math.max(0, Math.floor(relativeScroll / stageHeight)),
        stages.length - 1
      );

      setActiveStage(stageIndex + 1);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  return (
    <section 
      ref={containerRef}
      className="py-24 bg-white"
      id="ai-adoption-program"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Our 5-Stage AI Adoption Program
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A proven roadmap to transform your business with AI. Get it in 10 seconds, 
            scan all stages in 2–3 minutes.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
            <span className="text-sm font-medium text-gray-600">
              {activeStage}/5
            </span>
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(activeStage / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Folder Stack */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const isActive = activeStage === stage.id;
            const isExpanded = isActive;
            
            return (
              <div
                key={stage.id}
                className={`
                  relative transition-all duration-500 ease-out
                  ${isExpanded ? 'z-10' : 'z-0'}
                `}
                style={{
                  transform: isExpanded 
                    ? 'scale(1.02)' 
                    : `scale(${1 - (stages.length - index) * 0.02})`,
                }}
              >
                {/* Folder */}
                <div
                  className={`
                    relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ease-out
                    ${isExpanded 
                      ? 'bg-white border-blue-200 shadow-xl' 
                      : 'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md'
                    }
                  `}
                >
                  {/* Folder Header */}
                  <div
                    className={`
                      px-8 py-6 cursor-pointer transition-all duration-300 ease-out
                      ${isExpanded ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
                    `}
                    onClick={() => setActiveStage(stage.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Stage Number */}
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                            ${isExpanded 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
                            }
                          `}
                        >
                          {stage.id}
                        </div>
                        
                        {/* Stage Label */}
                        <div>
                          <h3 className={`
                            text-2xl font-bold transition-colors duration-300
                            ${isExpanded ? 'text-blue-900' : 'text-gray-900'}
                          `}>
                            {stage.label}
                          </h3>
                          <p className={`
                            text-sm transition-colors duration-300 mt-1
                            ${isExpanded ? 'text-blue-700' : 'text-gray-500'}
                          `}>
                            {stage.purpose}
                          </p>
                        </div>
                      </div>

                      {/* Expand/Collapse Indicator */}
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                          ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                        `}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : 'rotate-0'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Folder Content */}
                  <div
                    className={`
                      overflow-hidden transition-all duration-500 ease-out
                      ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="px-8 pb-8">
                      {/* Chips */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                          You Get:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {stage.chips.map((chip, chipIndex) => (
                            <span
                              key={chipIndex}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <a
                          href={stage.ctaLink}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          {stage.cta}
                        </a>
                        <a
                          href={`/learn-more/${stage.label.toLowerCase()}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                        >
                          Learn more →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Ready to start your AI transformation journey?
          </p>
          <a
            href="/get-started"
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </section>
  );
}
