import React, { useState, useEffect } from "react";

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const FeatureCard = ({ icon, title, description }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={{
          background: "#FFFFFF",
          border: "2px solid #E5E7EB",
          borderRadius: "16px",
          padding: "2rem",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered ? "translateY(-12px)" : "translateY(0)",
          boxShadow: isHovered
            ? "0 20px 40px rgba(30, 58, 95, 0.15)"
            : "0 4px 12px rgba(0, 0, 0, 0.05)",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, #FDB913, #FFCD4D)`,
            transform: isHovered ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            transition: "transform 0.4s ease"
          }}
        />
        <div
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            transition: "transform 0.3s ease",
            transform: isHovered ? "scale(1.1)" : "scale(1)"
          }}
        >
          {icon}
        </div>
        <h4
          style={{
            color: "#1E3A5F",
            fontWeight: 700,
            fontSize: "1.15rem",
            marginBottom: "0.75rem"
          }}
        >
          {title}
        </h4>
        <p
          style={{
            color: "#6B7280",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            margin: 0
          }}
        >
          {description}
        </p>
      </div>
    );
  };

  const AnimatedStat = ({ value, label, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "3rem",
            fontWeight: 800,
            color: "#FDB913",
            marginBottom: "0.5rem"
          }}
        >
          {count}
          {suffix}
        </div>
        <div style={{ color: "#B8C5D6", fontSize: "1rem" }}>{label}</div>
      </div>
    );
  };

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", overflow: "hidden" }}>
      {/* NAVBAR */}
      <nav
        style={{
          background: "#1E3A5F",
          borderBottom: "4px solid #FDB913",
          boxShadow: `0 ${Math.min(scrollY / 10, 8)}px ${Math.min(
            scrollY / 5,
            20
          )}px rgba(0,0,0,${Math.min(scrollY / 500, 0.2)})`,
          position: "sticky",
          top: 0,
          zIndex: 1000,
          transition: "all 0.3s ease"
        }}
      >
        <div
          style={{
            maxWidth: "1920px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div>
            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "1.5rem",
                fontWeight: 700,
                margin: 0
              }}
            >
              Retail Media Creative Builder
            </h1>
            <p style={{ color: "#B8C5D6", margin: 0, fontSize: "0.85rem" }}>
              AI-powered retail creative generation & compliance engine
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/generate"}
            style={{
              padding: "12px 24px",
              fontSize: "0.95rem",
              fontWeight: 700,
              background: "#FDB913",
              color: "#1E3A5F",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(253, 185, 19, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 20px rgba(253, 185, 19, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 12px rgba(253, 185, 19, 0.3)";
            }}
          >
            Launch App →
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        style={{
          position: "relative",
          padding: "6rem 1.5rem 4rem",
          textAlign: "center",
          background: "linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)",
          overflow: "hidden"
        }}
      >
        {/* Animated background elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "300px",
            height: "300px",
            background: "rgba(253, 185, 19, 0.1)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 6s ease-in-out infinite"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "400px",
            height: "400px",
            background: "rgba(184, 197, 214, 0.1)",
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "float 8s ease-in-out infinite reverse"
          }}
        />

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-30px); }
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}
        </style>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(253, 185, 19, 0.2)",
              color: "#FDB913",
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              border: "1px solid rgba(253, 185, 19, 0.3)"
            }}
          >
            ✨ Powered by Generative AI
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: "#FFFFFF",
              marginBottom: "1.5rem",
              lineHeight: 1.2,
              animation: "fadeInUp 0.8s ease-out"
            }}
          >
            Create Stunning Retail Creatives
            <br />
            <span style={{ color: "#FDB913" }}>In Seconds</span>
          </h2>

          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto 3rem",
              color: "#B8C5D6",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              lineHeight: 1.7,
              animation: "fadeInUp 0.8s ease-out 0.2s both"
            }}
          >
            AI-powered creative generation with automatic compliance validation.
            Upload your assets and let our engine create professional,
            retailer-ready campaigns across all formats.
          </p>

          <button
            onClick={() => window.location.href = "/generate"}
            style={{
              padding: "18px 48px",
              fontSize: "1.15rem",
              fontWeight: 700,
              background: "#FDB913",
              color: "#1E3A5F",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 24px rgba(253, 185, 19, 0.4)",
              animation: "fadeInUp 0.8s ease-out 0.4s both, pulse 2s ease-in-out 2s infinite"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-4px)";
              e.target.style.boxShadow = "0 12px 32px rgba(253, 185, 19, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 24px rgba(253, 185, 19, 0.4)";
            }}
          >
            🚀 Start Creating Now
          </button>
        </div>
      </section>

      {/* STATS SECTION */}
      <section
        style={{
          background: "#1E3A5F",
          padding: "3rem 1.5rem",
          borderTop: "1px solid rgba(253, 185, 19, 0.2)"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "3rem"
          }}
        >
          <AnimatedStat value={3} label="Format Options" suffix="" />
          <AnimatedStat value={100} label="Compliance Accuracy" suffix="%" />
          <AnimatedStat value={50} label="Time Saved" suffix="%" />
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        data-animate
        style={{
          padding: "5rem 1.5rem",
          opacity: isVisible.features ? 1 : 0,
          transform: isVisible.features ? "translateY(0)" : "translateY(50px)",
          transition: "all 0.8s ease-out"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h3
            style={{
              color: "#1E3A5F",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 2.5rem)",
              marginBottom: "1rem"
            }}
          >
            Powerful Features
          </h3>
          <p style={{ color: "#6B7280", fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto" }}>
            Everything you need to create professional retail media campaigns
          </p>
        </div>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}
        >
          <FeatureCard
            icon="🤖"
            title="AI Layout Generation"
            description="Google Gemini-powered intelligent layout creation that understands your brand and products"
          />
          <FeatureCard
            icon="✂️"
            title="Smart Background Removal"
            description="Automatic background removal for products and logos with precision edge detection"
          />
          <FeatureCard
            icon="🔍"
            title="Object Detection"
            description="Advanced packshot recognition and content understanding for optimal placement"
          />
          <FeatureCard
            icon="✅"
            title="Compliance Validation"
            description="Automated retail compliance checking with static rules and AI-powered verification"
          />
          <FeatureCard
            icon="🍷"
            title="Alcohol Detection"
            description="Intelligent alcohol product detection with automatic Drink-Aware logo enforcement"
          />
          <FeatureCard
            icon="📐"
            title="Multi-Format Export"
            description="Generate creatives in 1:1, 9:16, and 1.9:1 aspect ratios ready for any platform"
          />
          <FeatureCard
            icon="🎨"
            title="Color Intelligence"
            description="Smart color palette storage with AI-suggested frequently-used brand combinations"
          />
          <FeatureCard
            icon="📦"
            title="Campaign Ready"
            description="Export optimized creatives under size limits, ready for immediate deployment"
          />
        </div>
      </section>


      {/* CTA SECTION */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)",
          padding: "5rem 1.5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background: "rgba(253, 185, 19, 0.05)",
            borderRadius: "50%",
            filter: "blur(100px)"
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h3
            style={{
              color: "#FFFFFF",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              marginBottom: "1.5rem"
            }}
          >
            Ready to Transform Your Creative Workflow?
          </h3>
          <p
            style={{
              color: "#B8C5D6",
              fontSize: "1.15rem",
              marginBottom: "2.5rem",
              maxWidth: "700px",
              margin: "0 auto 2.5rem"
            }}
          >
            Join the future of retail media creation. Start generating
            professional, compliant creatives in seconds.
          </p>
          <button
            onClick={() => window.location.href = "/generate"}
            style={{
              padding: "18px 48px",
              fontSize: "1.15rem",
              fontWeight: 700,
              background: "#FDB913",
              color: "#1E3A5F",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 24px rgba(253, 185, 19, 0.4)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-4px)";
              e.target.style.boxShadow = "0 12px 32px rgba(253, 185, 19, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 24px rgba(253, 185, 19, 0.4)";
            }}
          >
            Get Started Free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#1E3A5F",
          color: "#B8C5D6",
          padding: "2rem 1.5rem",
          textAlign: "center",
          borderTop: "1px solid rgba(253, 185, 19, 0.2)"
        }}
      >
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          Retail Media Creative Builder · Generative AI Project
        </p>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
          Powered by Google Gemini & Advanced AI Technology
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;