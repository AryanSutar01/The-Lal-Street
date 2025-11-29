import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calculator, Shield, Zap, Target, PieChart, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { SuggestedBuckets } from './SuggestedBuckets';
import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';
import { loadSuggestedBuckets } from '../data/suggestedBuckets';
import { warmUpServer } from '../utils/serverHealthCheck';
import type { SuggestedBucket } from '../types/suggestedBucket';
import type { SelectedFund } from '../App';

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onImportBucket?: (bucket: SuggestedBucket, targetPage: 'investment' | 'retirement') => void;
}

export function HomePage({ onNavigate, onImportBucket }: HomePageProps) {
  const [suggestedBuckets, setSuggestedBuckets] = useState<SuggestedBucket[]>([]);
  const [isLoadingBuckets, setIsLoadingBuckets] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    // Load suggested buckets with server warm-up
    const loadBucketsWithWarmUp = async () => {
      try {
        setIsLoadingBuckets(true);
        // First, warm up the server to prevent cold start delays
        // This is especially important for Render.com deployments
        console.log('Warming up server...');
        await warmUpServer();
        
        // Give the server a moment to fully start up after warm-up
        // Then load suggested buckets
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        
        console.log('Loading suggested buckets...');
        const buckets = await loadSuggestedBuckets(true); // activeOnly = true
        setSuggestedBuckets(buckets);
      } catch (error) {
        console.error('Error loading suggested buckets:', error);
        setSuggestedBuckets([]);
      } finally {
        setIsLoadingBuckets(false);
      }
    };

    loadBucketsWithWarmUp();

    // Check and recalculate buckets if needed (every 5 days, if server is not under load)
    const handleAutoRecalculation = async () => {
      try {
        setIsRecalculating(true);
        const { checkAndRecalculateBuckets } = await import('../utils/bucketRecalculationService');
        await checkAndRecalculateBuckets();
        
        // Reload buckets after recalculation
        const reloaded = await loadSuggestedBuckets(true);
        setSuggestedBuckets(reloaded);
      } catch (error) {
        console.error('Error in auto-recalculation:', error);
      } finally {
        setIsRecalculating(false);
      }
    };

    // Run recalculation check in background (non-blocking)
    handleAutoRecalculation();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      // Fallback: use window location hash
      window.location.hash = page;
    }
  };

  const handleImportBucket = (bucket: SuggestedBucket, targetPage: 'investment' | 'retirement') => {
    if (onImportBucket) {
      onImportBucket(bucket, targetPage);
      // Navigate to the target page after import
      handleNavigate(targetPage === 'investment' ? 'investment-plan' : 'retirement-plan');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Enhanced 3D Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Enhanced 3D Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large Floating Orbs with More Depth */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full mix-blend-screen filter blur-3xl animate-blob opacity-40"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000 opacity-40"></div>
          <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/30 to-violet-600/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000 opacity-35"></div>
          
          {/* Additional Smaller Orbs for Depth */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full mix-blend-screen filter blur-2xl animate-blob animation-delay-3000 opacity-30"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-rose-400/20 to-orange-600/20 rounded-full mix-blend-screen filter blur-2xl animate-blob animation-delay-5000 opacity-25"></div>
          
          {/* Animated Grid Pattern with Perspective */}
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform: 'perspective(1000px) rotateX(60deg)',
            transformOrigin: 'center center',
          }}></div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-1/3 left-1/4 w-32 h-32 border-2 border-white/10 rotate-45 animate-float-slow opacity-20"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border-2 border-white/10 rounded-full animate-float-slow animation-delay-3000 opacity-15"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-white/10 rotate-12 animate-float-slow animation-delay-6000 opacity-20"></div>
          
          {/* Particle-like Small Dots */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
          
          {/* Radial Gradient Overlay */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-purple-900/20 to-slate-900/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
          <div className="mb-6 sm:mb-8">
            {/* Logo Image */}
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-6 sm:mb-8">
              <img 
                src="/favicon.png" 
                alt="The Lal Street Logo" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-100 mb-4 sm:mb-6 animate-fade-in drop-shadow-2xl px-2">
            The Lal Street
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-cyan-50 mb-3 sm:mb-4 max-w-3xl mx-auto font-semibold animate-fade-in animation-delay-200 px-4">
            Your Comprehensive Mutual Fund Portfolio Calculator
          </p>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-100 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto animate-fade-in animation-delay-400 px-4">
            Analyze your investments with real-time NAV data, industry-standard calculations, and powerful planning tools
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in animation-delay-600 px-4">
            <Button 
              size="lg" 
              className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 border-0 font-semibold overflow-hidden animate-gradient w-full sm:w-auto"
              onClick={() => scrollToSection('features')}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Explore Features
              </span>
            </Button>
            <Button 
              size="lg" 
              className="group relative bg-white/10 backdrop-blur-xl border-2 border-white/40 text-white hover:bg-white/20 text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 rounded-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-semibold overflow-hidden w-full sm:w-auto"
              onClick={() => scrollToSection('how-it-works')}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Learn More
              </span>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Why Choose The Lal Street?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We provide the most comprehensive and accurate portfolio analysis tools for your mutual fund investments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 sm:mb-6">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Real-Time NAV Data</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get accurate calculations with live NAV data directly from fund houses. No outdated information, no guesswork.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 sm:mb-6">
                <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Industry-Standard Metrics</h3>
              <p className="text-sm sm:text-base text-gray-600">
                XIRR, CAGR, Rolling Returns, and more. All calculations follow financial industry standards for accuracy.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 sm:mb-6">
                <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Multi-Fund Portfolios</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Build and analyze portfolios with up to 5 funds. Custom weightage allocation and comprehensive analysis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 sm:mb-6">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Advanced Calculators</h3>
              <p className="text-sm sm:text-base text-gray-600">
                SIP, Lumpsum, Combined strategies, SWP - all the tools you need to plan your financial future.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Secure & Private</h3>
              <p className="text-sm sm:text-base text-gray-600">
                All calculations happen locally in your browser. Your data never leaves your device. Complete privacy.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mb-4 sm:mb-6">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Instant calculations, real-time updates, and smooth interactions. Built for speed and performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-16 sm:top-20 md:top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400"></div>

            {/* Step 1 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Select Funds</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Search and add up to 5 mutual funds to create your portfolio. Allocate weightage as per your investment strategy.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Choose Calculator</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Select from Investment Plan calculators (SIP, Lumpsum) or Retirement Plan tools (SWP, Yearly Returns).
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Analyze Results</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                View detailed metrics, interactive charts, and comprehensive reports to make informed investment decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Buckets Section */}
      {isLoadingBuckets ? (
        <section id="recommended-portfolios" className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                Recommended Portfolios
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                Expertly curated fund buckets with proven performance track records. 
                Import these portfolios directly into your investment or retirement plans.
              </p>
            </div>

            {/* Loading State */}
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
              <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 animate-spin text-emerald-600 mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Loading Recommended Portfolios...
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                We're fetching the latest curated investment portfolios for you
              </p>
            </div>

            {/* Loading Skeleton Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 sm:p-5 md:p-6 border-2 flex flex-col">
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Skeleton className="h-5 sm:h-6 w-3/4" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  
                  <div className="mb-3 sm:mb-4 space-y-2">
                    <Skeleton className="h-12 sm:h-14 w-full rounded-lg" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-16 sm:h-20 rounded" />
                      <Skeleton className="h-16 sm:h-20 rounded" />
                    </div>
                  </div>
                  
                  <div className="mb-3 sm:mb-4 flex-1">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 sm:gap-2.5 pt-3 sm:pt-4 border-t mt-auto">
                    <Skeleton className="h-9 sm:h-10 w-full rounded-md" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-9 sm:h-10 w-full rounded-md" />
                      <Skeleton className="h-9 sm:h-10 w-full rounded-md" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : suggestedBuckets.length > 0 ? (
        <SuggestedBuckets 
          buckets={suggestedBuckets} 
          onImportBucket={handleImportBucket}
        />
      ) : null}

      {/* CTA Section with Enhanced Background */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-pink-400/20 to-rose-600/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-100 mb-4 sm:mb-6 drop-shadow-lg px-4">
            Ready to Plan Your Financial Future?
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-cyan-50 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            Start analyzing your portfolio today with real-time data and professional-grade calculations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
            <Button 
              size="lg" 
              className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 border-0 font-semibold overflow-hidden w-full sm:w-auto"
              onClick={() => handleNavigate('investment-plan')}
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Investment Plan
              </span>
            </Button>
            <Button 
              size="lg" 
              className="group relative bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-base sm:text-lg px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 rounded-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 border-0 font-semibold overflow-hidden w-full sm:w-auto"
              onClick={() => handleNavigate('retirement-plan')}
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Retirement Plan
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Hidden Admin Access - Very Subtle, Bottom Right Corner */}
      <div className="fixed bottom-3 right-3 z-50">
        <button
          onClick={() => handleNavigate('admin')}
          className="text-slate-300/5 hover:text-slate-400/15 transition-all duration-300 cursor-pointer select-none"
          title=""
          aria-label="Admin Access"
          style={{
            fontSize: '9px',
            fontFamily: 'system-ui, sans-serif',
            padding: '8px',
            lineHeight: '0.5',
            opacity: 0.02,
            letterSpacing: '2px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.15';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.02';
          }}
        >
          ·
        </button>
      </div>
    </div>
  );
}

