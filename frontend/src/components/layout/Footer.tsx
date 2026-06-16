import { Link } from "react-router-dom";
import { Briefcase, ExternalLink, Globe, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-400 py-14 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              JobHub
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Connecting talent with opportunity. Find your dream job or the perfect candidate.
            </p>
            <div className="flex gap-3">
              {[Globe, Code2, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              {["Browse Jobs", "Create Profile", "Upload Resume", "Track Applications"].map((item) => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">For Recruiters</h4>
            <ul className="space-y-2 text-sm">
              {["Post a Job", "Find Candidates", "Manage Applications", "Company Profile"].map((item) => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About Us", "Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 text-center text-sm">
          <p>© {new Date().getFullYear()} JobHub. Built with FastAPI + React + MongoDB.</p>
        </div>
      </div>
    </footer>
  );
}
