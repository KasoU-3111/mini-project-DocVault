// src/pages/LandingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  ShieldCheck,
  CloudUpload,
  Clock,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import heroVaultImg from "../assets/hero-vault.jpg";

type NavSection = "features" | "workflow" | "faq";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<NavSection>("features");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToSection = (id: NavSection) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does DocVault protect my academic records?",
      a: "DocVault uses end-to-end encryption and S3 bucket protection so your transcripts and certificates remain private and tamper-proof.",
    },
    {
      q: "Is DocVault free for college students?",
      a: "Yes! Every registered student gets full access to document storage, automated expiry tracking, and readiness checklists.",
    },
    {
      q: "How fast are document verifications processed?",
      a: "Admin review portals feature real-time status updates, reducing verification SLAs down to an average of under 4 hours.",
    },
    {
      q: "What file formats are supported?",
      a: "You can upload PDF, PNG, JPG, and JPEG files up to 10 MB per document.",
    },
  ];

  const getNavLinkClass = (section: NavSection) =>
    `px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
      activeNav === section
        ? "bg-[#14213d] text-[#fca311] shadow-xs"
        : "text-[#14213d]/70 hover:bg-[#14213d]/10 hover:text-[#14213d]"
    }`;

  return (
    <div className="min-h-screen bg-[#e5e5e5] text-[#000000] font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#14213d]/15 px-6 py-4 transition shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fca311] text-[#14213d] shadow-md font-bold">
              <FolderOpen size={22} />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#14213d]">
                DocVault
              </span>
              <p className="text-[10px] text-[#14213d]/60 font-semibold -mt-1">Academic Vault</p>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#14213d]/15 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className={getNavLinkClass("features")}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("workflow")}
              className={getNavLinkClass("workflow")}
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("faq")}
              className={getNavLinkClass("faq")}
            >
              FAQ
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-xs font-bold text-[#14213d] hover:text-[#fca311] transition cursor-pointer"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="rounded-xl bg-[#14213d] px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#fca311] hover:text-[#14213d] transition cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-[#fca311]/40 bg-[#fca311]/15 px-3 py-1.5 text-xs font-bold text-[#14213d] mb-6">
              <ShieldCheck size={15} className="text-[#fca311]" /> Encrypted Secure Cloud Storage
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#14213d] leading-[1.15]">
              Your academic documents.{" "}
              <span className="bg-[#14213d] text-[#fca311] px-2.5 py-0.5 rounded-xl inline-block shadow-md">
                Secure.
              </span>{" "}
              Organised. Always available.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#14213d]/80 font-medium leading-relaxed max-w-xl">
              DocVault gives students and colleges a central place to store, verify, and access transcripts, certificates, and ID cards anytime.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#14213d] px-6 py-3.5 text-xs font-extrabold text-white shadow-lg hover:bg-[#fca311] hover:text-[#14213d] transition duration-200 cursor-pointer"
              >
                Get Started <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("features")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#14213d]/20 bg-white px-6 py-3.5 text-xs font-extrabold text-[#14213d] hover:bg-[#14213d] hover:text-white transition cursor-pointer"
              >
                How it works
              </button>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs font-extrabold text-[#14213d]/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-700" /> Instant verification
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-700" /> S3 Encryption
              </span>
            </div>
          </div>

          {/* Hero Image Container */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#14213d]/20 bg-[#14213d] p-3">
              <img
                src={heroVaultImg}
                alt="DocVault Secure 3D Vault"
                className="w-full h-auto rounded-2xl object-cover hover:scale-[1.02] transition duration-300"
              />
              <div className="absolute bottom-7 left-7 bg-[#14213d]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#fca311]/30 shadow-lg flex items-center gap-2 text-xs font-extrabold text-white">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#fca311] animate-pulse" />
                100% Encrypted & Secure
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Metric Counter Bar */}
      <section className="bg-[#14213d] border-y border-[#14213d]/20 py-10 px-6 text-white shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-extrabold text-[#fca311]">24,000+</p>
            <p className="text-xs text-[#e5e5e5]/80 font-bold mt-1">Students Served</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#fca311]">15 hrs</p>
            <p className="text-xs text-[#e5e5e5]/80 font-bold mt-1">Saved per Admin Review</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#fca311]">48</p>
            <p className="text-xs text-[#e5e5e5]/80 font-bold mt-1">College Partners</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#fca311]">99.9%</p>
            <p className="text-xs text-[#e5e5e5]/80 font-bold mt-1">Upload Accuracy</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="scroll-mt-24 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#fca311] bg-[#14213d] px-3 py-1 rounded-full">
            Features
          </span>
          <h2 className="text-3xl font-extrabold text-[#14213d] mt-3">
            Everything a student vault should do
          </h2>
          <p className="text-sm text-[#14213d]/70 font-medium mt-2">
            Built for modern colleges, placement desks, and verification portals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 border border-[#14213d]/15 shadow-2xs hover:border-[#fca311] transition duration-200">
            <div className="h-11 w-11 rounded-xl bg-[#14213d] text-[#fca311] flex items-center justify-center mb-4 shadow-xs">
              <CloudUpload size={22} />
            </div>
            <h3 className="font-extrabold text-[#14213d] text-base">Upload & Management</h3>
            <p className="text-xs text-[#14213d]/70 font-medium leading-relaxed mt-2">
              Organize marksheets, income certificates, and ID cards effortlessly with automated metadata tagging.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-[#14213d]/15 shadow-2xs hover:border-[#fca311] transition duration-200">
            <div className="h-11 w-11 rounded-xl bg-[#14213d] text-[#fca311] flex items-center justify-center mb-4 shadow-xs">
              <Clock size={22} />
            </div>
            <h3 className="font-extrabold text-[#14213d] text-base">Smart Reminders & Alerts</h3>
            <p className="text-xs text-[#14213d]/70 font-medium leading-relaxed mt-2">
              Never miss a scholarship or placement deadline with automated document expiry tracking.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-[#14213d]/15 shadow-2xs hover:border-[#fca311] transition duration-200">
            <div className="h-11 w-11 rounded-xl bg-[#14213d] text-[#fca311] flex items-center justify-center mb-4 shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-extrabold text-[#14213d] text-base">Readiness Checklist</h3>
            <p className="text-xs text-[#14213d]/70 font-medium leading-relaxed mt-2">
              Track eligibility for internships, scholarship applications, and semester exams in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Onboarding Steps */}
      <section id="workflow" className="scroll-mt-24 py-16 px-6 bg-white border-y border-[#14213d]/15">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14213d]">
              <Sparkles size={14} className="text-[#fca311]" /> Simple Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[#14213d] mt-1">Three steps. One time.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#e5e5e5]/40 p-6 border border-[#14213d]/15">
              <span className="text-xs font-mono font-extrabold text-[#14213d] bg-[#fca311] px-2.5 py-1 rounded-lg">
                01.
              </span>
              <h3 className="font-extrabold text-[#14213d] text-base mt-3">Set up account</h3>
              <p className="text-xs text-[#14213d]/70 font-medium mt-1">
                Sign in with your student portal credentials in seconds.
              </p>
            </div>

            <div className="rounded-2xl bg-[#e5e5e5]/40 p-6 border border-[#14213d]/15">
              <span className="text-xs font-mono font-extrabold text-[#14213d] bg-[#fca311] px-2.5 py-1 rounded-lg">
                02.
              </span>
              <h3 className="font-extrabold text-[#14213d] text-base mt-3">Upload documents</h3>
              <p className="text-xs text-[#14213d]/70 font-medium mt-1">
                Drag and drop your PDFs, transcripts, and identification cards.
              </p>
            </div>

            <div className="rounded-2xl bg-[#e5e5e5]/40 p-6 border border-[#14213d]/15">
              <span className="text-xs font-mono font-extrabold text-[#14213d] bg-[#fca311] px-2.5 py-1 rounded-lg">
                03.
              </span>
              <h3 className="font-extrabold text-[#14213d] text-base mt-3">Get verified</h3>
              <p className="text-xs text-[#14213d]/70 font-medium mt-1">
                Admin desk reviews and approves your documents for college portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="scroll-mt-24 py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#14213d]">Help Center</span>
          <h2 className="text-2xl font-extrabold text-[#14213d] mt-1">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className="rounded-2xl bg-white border border-[#14213d]/15 overflow-hidden shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left font-extrabold text-xs text-[#14213d] cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    openFaq === index ? "rotate-180 text-[#fca311]" : "text-[#14213d]/50"
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 text-xs text-[#14213d]/75 font-medium leading-relaxed border-t border-[#14213d]/10 pt-3 bg-[#e5e5e5]/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-[#14213d] p-10 text-center text-white relative overflow-hidden shadow-xl border border-[#14213d]/20">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-[#fca311]/10" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#fca311]/30 bg-[#fca311]/15 px-3 py-1.5 text-xs font-bold text-[#fca311]">
              <Lock size={14} /> Ready to store safely?
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Start your vault in under a minute</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#e5e5e5]/80 font-medium max-w-lg mx-auto">
              All your academic files safe, structured, and ready whenever you need them.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#fca311] px-6 py-3 text-xs font-extrabold text-[#14213d] shadow-md hover:bg-white transition cursor-pointer"
            >
              Start Now <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#14213d]/15 bg-white py-6 text-center text-xs text-[#14213d]/60 font-semibold">
        DocVault · Student Digital Document Repository
      </footer>
    </div>
  );
}