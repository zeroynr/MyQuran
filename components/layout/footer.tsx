"use client";

import Link from "next/link";
import { footerData } from "./footer-data";
import { useState, useEffect } from "react";

export function Footer() {
  const { brand, quotes, links, contact, copyright } = footerData;
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [quotes.length]);

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <footer className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20 border-t border-emerald-200/50 dark:border-emerald-700/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg shadow-lg">
                <brand.logo className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {brand.name}
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                  {brand.tagline}
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
              {brand.description}
            </p>

            {/* Social Media */}
            <div className="flex gap-3">
              {contact.social.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 rounded-lg flex items-center justify-center transition-all duration-300 group shadow-md hover:shadow-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2">
              {links.main.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Links */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">
              Fitur
            </h4>
            <ul className="space-y-2">
              {links.features.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">
              Bantuan
            </h4>
            <ul className="space-y-2">
              {links.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quote Section */}
        <div className="border-t border-emerald-200/50 dark:border-emerald-700/50 pt-6 mb-6">
          <div className="text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 italic text-base md:text-lg mb-2 transition-all duration-500 leading-relaxed">
              "{currentQuote.text}"
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium transition-all duration-500">
              - {currentQuote.reference}
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-emerald-200/50 dark:border-emerald-700/50 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {copyright.year} {copyright.text}
              </p>
            </div>

            {/* Creator Credit */}
            <div className="text-center md:text-right">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {copyright.creator.message} {copyright.creator.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
