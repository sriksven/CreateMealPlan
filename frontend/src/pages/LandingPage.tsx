import React from 'react';
import { ArrowRight, ScanLine, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
    return (
        <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="badge">
                    AI-Powered Kitchen Assistant
                </div>

                <h1 className="text-hero">
                    Your Kitchen, <br />
                    <span className="text-gradient">Intelligently Managed.</span>
                </h1>

                <p className="text-xl text-muted" style={{ marginBottom: '3rem', lineHeight: '1.6' }}>
                    Stop guessing what to cook. Track your pantry with AI vision and generate high-protein meal plans based on what you actually own.
                </p>

                <div className="flex justify-center gap-4" style={{ marginBottom: '5rem' }}>
                    <Link to="/signup">
                        <button className="btn btn-primary">
                            Get Started Free
                        </button>
                    </Link>
                    <Link to="/demo">
                        <button className="btn btn-secondary">
                            Watch Demo
                        </button>
                    </Link>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, marginTop: 40 }}
                animate={{ opacity: 1, marginTop: 80 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="grid grid-cols-1 grid-cols-3"
            >
                {[
                    { icon: ScanLine, title: "Snap & Track", desc: "Take a photo of your groceries. Our AI instantly catalogs them." },
                    { icon: Utensils, title: "Smart Recipes", desc: "Get recipes tailored to your ingredients and protein goals." },
                    { icon: ArrowRight, title: "Zero Waste", desc: "Use what you have before it expires. Save money and the planet." }
                ].map((item, index) => (
                    <div key={index} className="glass-panel" style={{ textAlign: 'left' }}>
                        <item.icon color="var(--accent-primary)" size={40} style={{ marginBottom: '1.5rem' }} />
                        <h3 className="text-xl" style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                        <p className="text-muted">{item.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default LandingPage;
