
import { StepBackIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

        const AboutPage: React.FC = () => {          
        return (
            <div className="bg-cover bg-center min-h-screen flex flex-col gap-4 justify-center items-center px-4" style={{ backgroundImage: `url("/assets/hero-bg.jpg")` }}>
            <div className=" p-5 max-md:p-4 self-start">
              <Link href="/">
                <StepBackIcon size={45} className="text-white pl-2 md:pl-5" />
              </Link>
            </div>
              <div className="max-w-3xl bg-white shadow-lg rounded-lg p-6 mb-8 sm:p-8 text-gray-800 w-full md:w-auto">
                <h1 className="text-3xl font-bold text-yellow-500 mb-4 text-center md:text-left">About SolarView</h1>
                <p className="text-lg mb-4 text-center md:text-left">
                  Welcome to <span className="font-semibold">SolarView</span>, your go-to platform for monitoring solar energy power. Our mission is to provide you with real-time data and insights into your solar energy system&apos;s performance.
                </p>
                <h2 className="text-2xl font-semibold text-gray-700 mb-3 text-center md:text-left">With SolarView, you can:</h2>
                <ul className="list-disc list-inside mb-4 text-gray-600 text-center md:text-left">
                  <li>Track energy production and consumption</li>
                  <li>Monitor system efficiency and health</li>
                  <li>Receive alerts and notifications for maintenance</li>
                  <li>Analyze historical data to optimize performance</li>
                </ul>
                <p className="text-lg text-center md:text-left">
                  Our user-friendly interface and advanced analytics tools make it easy for you to stay informed and make data-driven decisions about your solar energy system.
                </p>
                <p className="text-lg font-semibold mt-4 text-gray-700 text-center md:text-left">Thank you for choosing SolarView to help you harness the power of the sun!</p>
              </div>
          </div>


          );
        };
        

        export default AboutPage;