import { Heart, Gamepad2 } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="about" className="bg-gray-900/50 border-t border-cyan-900/20">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center">
              <Gamepad2 className="h-6 w-6 mr-2 text-cyan-400" />
              <h3 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                8BitPixel Arcade
              </h3>
            </div>
            <p className="text-gray-400 max-w-md mt-4">
              A curated collection of retro-inspired modern web games designed to challenge your mind and deliver hours of entertainment.
            </p>
            <div className="mt-6 flex space-x-4">
              <div className="w-8 h-8 rounded-full bg-cyan-900/30 flex items-center justify-center">
                <Heart className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                <Gamepad2 className="h-4 w-4 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="md:text-right">
            <h3 className="text-xl font-bold font-display text-white mb-4">About Us</h3>
            <p className="text-gray-400">
              8BitPixel Arcade celebrates the golden age of gaming while embracing modern technologies.
              We curate games that blend nostalgic pixel art with innovative gameplay mechanics.
            </p>
            <p className="text-cyan-400 mt-4 pixel-title text-xs">Level up your gaming experience</p>
            <div className="mt-4 md:justify-end"></div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-cyan-900/20 flex justify-center">
          <p className="text-gray-400 text-sm">&copy; {currentYear} ByteBrush Studios. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
