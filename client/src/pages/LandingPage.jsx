import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Users, Lock, Zap, BarChart3, CheckCircle2, GitBranch } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-custom-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-custom-900">DocWise</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-6 py-2 text-slate-custom-700 hover:text-primary-600 font-medium transition">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 mb-6">
              <span className="w-2 h-2 bg-accent-600 rounded-full" />
              <span className="text-sm font-semibold text-primary-700">Trusted by 10,000+ teams</span>
            </div>

            <h1 className="text-6xl font-bold text-slate-custom-900 mb-6 leading-tight">
              Real-time collaboration,
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                made simple
              </span>
            </h1>

            <p className="text-xl text-slate-custom-600 mb-8 leading-relaxed">
              DocWise brings real-time collaboration to your documents. Edit together, see changes instantly, and keep your team in sync effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/signup" className="btn btn-primary inline-flex items-center justify-center gap-2 text-base">
                Start Free <ArrowRight size={18} />
              </Link>
              <button className="btn bg-slate-custom-100 text-slate-custom-900 border border-slate-custom-200 hover:bg-slate-custom-200">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-8 text-sm text-slate-custom-600">
              <div>
                <div className="font-semibold text-slate-custom-900 mb-1">10K+</div>
                <div>Active Users</div>
              </div>
              <div>
                <div className="font-semibold text-slate-custom-900 mb-1">99.9%</div>
                <div>Uptime</div>
              </div>
              <div>
                <div className="font-semibold text-slate-custom-900 mb-1">SOC 2</div>
                <div>Certified</div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl blur-2xl opacity-40" />
            <div className="relative bg-white rounded-2xl border border-slate-custom-200 p-8 shadow-lg">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-3 pt-4">
                  <div className="h-3 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full w-3/4" />
                  <div className="h-3 bg-slate-custom-200 rounded-full w-full" />
                  <div className="h-3 bg-slate-custom-200 rounded-full w-5/6" />
                  <div className="pt-3 space-y-2">
                    <div className="h-2 bg-slate-custom-200 rounded-full w-1/2" />
                    <div className="h-2 bg-slate-custom-200 rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-custom-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-custom-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-slate-custom-600 max-w-2xl mx-auto">Everything your team needs to collaborate better</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Real-Time Sync',
                description: 'See every change instantly across all users'
              },
              {
                icon: Lock,
                title: 'Enterprise Security',
                description: 'Bank-level encryption for all documents'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Sub-50ms latency for seamless collaboration'
              },
              {
                icon: GitBranch,
                title: 'Version History',
                description: 'Track changes and restore previous versions'
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                description: 'Track team productivity and document usage'
              },
              {
                icon: FileText,
                title: 'Rich Formatting',
                description: 'Full formatting options for professional docs'
              },
              {
                icon: CheckCircle2,
                title: 'Comments & Reviews',
                description: 'Built-in commenting and review workflows'
              },
              {
                icon: Users,
                title: 'Team Management',
                description: 'Control permissions and access levels'
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-custom-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mb-4">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <h3 className="font-bold text-slate-custom-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-custom-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center mb-20">
          <div className="md:col-span-2">
            <h2 className="text-4xl font-bold text-slate-custom-900 mb-6">Collaborate in Real-Time</h2>
            <p className="text-lg text-slate-custom-600 mb-6 leading-relaxed">
              Work together seamlessly with your team. No more waiting for updates, no more version conflicts. Every keystroke is synchronized instantly.
            </p>
            <ul className="space-y-4">
              {['Instant synchronization across all devices', 'See who is editing and where', 'Conflict-free collaborative editing'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-custom-700">
                  <CheckCircle2 className="text-accent-600 flex-shrink-0" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8 h-80 flex items-center justify-center">
            <div className="text-center">
              <Users className="text-primary-600 mx-auto mb-4" size={48} />
              <p className="text-slate-custom-700 font-semibold">Live Collaboration</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="bg-gradient-to-br from-accent-100 to-accent-50 rounded-2xl p-8 h-80 flex items-center justify-center">
            <div className="text-center">
              <Lock className="text-accent-600 mx-auto mb-4" size={48} />
              <p className="text-slate-custom-700 font-semibold">Enterprise Security</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-4xl font-bold text-slate-custom-900 mb-6">Security You Can Trust</h2>
            <p className="text-lg text-slate-custom-600 mb-6 leading-relaxed">
              Your documents are protected with enterprise-grade security. We use AES-256 encryption and comply with industry standards.
            </p>
            <ul className="space-y-4">
              {['256-bit AES encryption', 'GDPR and SOC 2 compliant', 'Zero-knowledge architecture'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-custom-700">
                  <CheckCircle2 className="text-accent-600 flex-shrink-0" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your workflow?</h2>
          <p className="text-xl text-white/90 mb-10">Join thousands of teams already using DocWise</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-slate-custom-50 inline-flex items-center justify-center gap-2">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <button className="btn bg-white/20 text-white border border-white hover:bg-white/30">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-custom-50 border-t border-slate-custom-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-bold text-slate-custom-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-custom-600">
                <li><a href="#" className="hover:text-primary-600 transition">Features</a></li>
                <li><a href="#" className="hover:text-primary-600 transition">Security</a></li>
                <li><a href="#" className="hover:text-primary-600 transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-custom-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-custom-600">
                <li><a href="#" className="hover:text-primary-600 transition">About</a></li>
                <li><a href="#" className="hover:text-primary-600 transition">Blog</a></li>
                <li><a href="#" className="hover:text-primary-600 transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-custom-900 mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-custom-600">
                <li><a href="#" className="hover:text-primary-600 transition">Docs</a></li>
                <li><a href="#" className="hover:text-primary-600 transition">API</a></li>
                <li><a href="#" className="hover:text-primary-600 transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-custom-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-custom-600">
                <li><a href="#" className="hover:text-primary-600 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-primary-600 transition">Terms</a></li>
                <li><a href="#" className="hover:text-primary-600 transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-custom-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-custom-600">
            <p>DocWise 2026. All rights reserved.</p>
            <div className="flex gap-6 mt-6 md:mt-0">
              <a href="#" className="hover:text-primary-600 transition">Twitter</a>
              <a href="#" className="hover:text-primary-600 transition">GitHub</a>
              <a href="#" className="hover:text-primary-600 transition">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

