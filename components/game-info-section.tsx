import { GameData } from "@/lib/games"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"
import { BookOpen, Info, Gamepad2, Lightbulb } from "lucide-react"

interface GameInfoSectionProps {
  gameData?: GameData
}

export function GameInfoSection({ gameData }: GameInfoSectionProps) {
  if (!gameData) {
    return (
      <Card className="bg-gray-900 border-gray-800 text-gray-400">
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No game information available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-cyan-400">{gameData.title} - Game Guide</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="bg-gray-800 w-full justify-start rounded-none border-b border-gray-800">
            <TabsTrigger value="about" className="data-[state=active]:text-cyan-400">
              <Info size={16} className="mr-1" />
              About
            </TabsTrigger>
            <TabsTrigger value="howto" className="data-[state=active]:text-cyan-400">
              <BookOpen size={16} className="mr-1" />
              How to Play
            </TabsTrigger>
            <TabsTrigger value="elements" className="data-[state=active]:text-cyan-400">
              <Gamepad2 size={16} className="mr-1" />
              Game Elements
            </TabsTrigger>
            {gameData.tips && (
              <TabsTrigger value="tips" className="data-[state=active]:text-cyan-400">
                <Lightbulb size={16} className="mr-1" />
                Tips
              </TabsTrigger>
            )}
          </TabsList>
          
          <ScrollArea className="h-[400px]">
            <TabsContent value="about" className="p-6 mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400">About the Game</h3>
                  <p className="text-gray-300 mt-2">{gameData.longDescription}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {gameData.difficulty && (
                    <div>
                      <h4 className="text-sm font-medium text-white">Difficulty</h4>
                      <p className="text-gray-300">{gameData.difficulty}</p>
                    </div>
                  )}
                  {gameData.creator && (
                    <div>
                      <h4 className="text-sm font-medium text-white">Creator</h4>
                      <p className="text-gray-300">{gameData.creator}</p>
                    </div>
                  )}
                  {gameData.version && (
                    <div>
                      <h4 className="text-sm font-medium text-white">Version</h4>
                      <p className="text-gray-300">{gameData.version}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="howto" className="p-6 space-y-6 mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400">How to Play</h3>
                  <ul className="list-disc pl-5 space-y-2 mt-2 text-gray-300">
                    {gameData.howToPlay.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400">Game Rules</h3>
                  <div className="mt-2 space-y-4">
                    {gameData.rules.map((rule, i) => (
                      <div key={i} className="pb-3 border-b border-gray-800 last:border-0">
                        <h4 className="font-medium text-white">{rule.title}</h4>
                        <p className="text-gray-300">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {gameData.controls && (
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Controls</h3>
                    <div className="mt-2 space-y-3">
                      {gameData.controls.keyboard && (
                        <div>
                          <h4 className="text-white font-medium">Keyboard</h4>
                          <ul className="list-disc pl-5 text-gray-300">
                            {gameData.controls.keyboard.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {gameData.controls.touch && (
                        <div>
                          <h4 className="text-white font-medium">Touch/Mobile</h4>
                          <ul className="list-disc pl-5 text-gray-300">
                            {gameData.controls.touch.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="elements" className="p-6 mt-0">
              {gameData.elements ? (
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Game Elements</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gameData.elements.map((element, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{element.symbol}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{element.name}</h4>
                            <p className="text-gray-300 text-sm">{element.description}</p>
                            {element.appearance && (
                              <p className="text-gray-400 text-xs mt-1">Appears as: {element.appearance}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No element details available for this game.</p>
              )}
            </TabsContent>
            
            {gameData.tips && (
              <TabsContent value="tips" className="p-6 mt-0">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Tips & Strategies</h3>
                <ul className="list-disc pl-5 space-y-3 text-gray-300">
                  {gameData.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
