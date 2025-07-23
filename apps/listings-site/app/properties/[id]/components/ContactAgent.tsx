// app/properties/[id]/components/ContactAgent.tsx
'use client'

import { useState } from 'react'
import { Phone, Mail, MessageCircle, Send } from 'lucide-react'
import { Property } from '@rental/types'

interface ContactAgentProps {
  property: Property
}

export default function ContactAgent({ property }: ContactAgentProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `I'm interested in ${property.title} at ${property.address}. Please contact me with more information.`
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Contact form submitted:', formData)
    alert('Thank you for your interest! An agent will contact you soon.')
  }

  return (
    <div className="space-y-6">
      {/* Agent Card */}
      <div className="card p-6">
        <div className="text-center mb-6">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            alt="Agent"
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-900">John Smith</h3>
          <p className="text-gray-600">Senior Real Estate Agent</p>
          <div className="flex items-center justify-center mt-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span className="text-gray-600 ml-2 text-sm">(4.9/5 • 150 reviews)</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <a
            href="tel:+15551234567"
            className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call Now
          </a>
          <a
            href="mailto:john.smith@eliteproperties.com"
            className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-5 w-5 mr-2" />
            Send Email
          </a>
          <button className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle className="h-5 w-5 mr-2" />
            Live Chat
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Available: Mon-Fri 9AM-7PM</p>
          <p>Response time: Usually within 1 hour</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Request Information
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="h-5 w-5 mr-2" />
            Send Message
          </button>
        </form>
      </div>

      {/* Schedule Tour */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Schedule a Tour
        </h3>
        
        <div className="space-y-3">
          <button className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Schedule Virtual Tour
          </button>
          <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Book In-Person Visit
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Tours available 7 days a week</p>
          <p>Same-day scheduling available</p>
        </div>
      </div>
    </div>
  )
}
