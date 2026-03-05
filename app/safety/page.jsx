import Navbar from '@/components/Navbar'
import { Shield, Eye, Lock, AlertTriangle, CheckCircle, Flag } from 'lucide-react'

const rules = [
  { icon: <CheckCircle size={18} className="text-green-400" />, title: 'Be Respectful', desc: 'Treat every stranger with kindness and respect.' },
  { icon: <Lock size={18} className="text-teal-400" />, title: 'Stay Anonymous', desc: 'Never share personal info like phone number or address.' },
  { icon: <Eye size={18} className="text-violet-400" />, title: 'No Explicit Content', desc: 'Nudity and sexual content are strictly prohibited.' },
  { icon: <AlertTriangle size={18} className="text-yellow-400" />, title: 'Report Bad Actors', desc: 'Use the report button to flag inappropriate behaviour.' },
  { icon: <Flag size={18} className="text-red-400" />, title: 'Zero Harassment', desc: 'Bullying, hate speech, and threats will result in a ban.' },
  { icon: <Shield size={18} className="text-blue-400" />, title: 'Minors Protected', desc: 'Users under 18 are not allowed on this platform.' },
]

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-[#080C18] relative">
      <div className="orb w-96 h-96 bg-blue-600 top-10 -left-32"></div>
      <div className="orb w-72 h-72 bg-teal-500 bottom-10 right-0" style={{ animationDelay: '4s' }}></div>

      <Navbar />

      <div className="relative z-10 pt-24 px-4 md:px-6 pb-10 max-w-[900px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-4 glow-teal">
            <Shield size={32} className="text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Safety Center</h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Your safety is our top priority. ConnectNow uses AI moderation and community reporting to keep chats safe.
          </p>
        </div>

        {/* Safety Badge */}
        <div className="glass border border-green-500/20 rounded-2xl p-4 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AI Moderation Active</p>
            <p className="text-gray-400 text-xs">All video streams are monitored in real-time for policy violations</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
              Protected
            </span>
          </div>
        </div>

        {/* Rules Grid */}
        <h2 className="text-lg font-semibold text-white mb-4">Community Guidelines</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {rules.map(({ icon, title, desc }) => (
            <div key={title} className="glass border border-white/6 rounded-2xl p-5 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  {icon}
                </div>
                <p className="text-white font-semibold text-sm">{title}</p>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Report CTA */}
        <div className="glass border border-red-500/20 rounded-2xl p-6 text-center">
          <Flag size={24} className="text-red-400 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-1">See something wrong?</h3>
          <p className="text-gray-400 text-sm mb-4">Report violations instantly. Our team reviews all reports within 24 hours.</p>
          <button className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-all">
            Report an Issue
          </button>
        </div>
      </div>
    </main>
  )
}
