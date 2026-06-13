"use client";

import { motion } from "framer-motion";

const events = [
  { year: "2010", title: "The Beginning", desc: "A star was born, bringing joy to the world." },
  { year: "2015", title: "First Milestones", desc: "Walking, talking, and spreading smiles everywhere." },
  { year: "2020", title: "Growing Up", desc: "Learning new things, exploring the world, being awesome." },
  { year: "2026", title: "Today", desc: "Celebrating another amazing year of life!" },
];

export default function Timeline() {
  return (
    <section className="min-h-screen bg-slate-900 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">Journey So Far</h2>
        
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1before:bg-gradient-to-b before:from-transparent before:via-pink-500 before:to-transparent">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-pink-500 bg-slate-900 text-pink-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="font-bold text-sm">{event.year}</span>
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-6 rounded-2xl shadow-xl ml-4 md:ml-0">
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-slate-300">{event.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
