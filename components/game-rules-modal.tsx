"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"
import { X, BookOpen, Gamepad2, Lightbulb } from "lucide-react"
import { GameData } from "@/lib/games"

interface GameRulesModalProps {
  gameData?: GameData
  isOpen: boolean
  onClose: () => void
}

export function GameRulesModal({ gameData, isOpen, onClose }: GameRulesModalProps) {
  if (!gameData) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col bg-gray-900 border border-gray-800 text-white">
        <DialogHeader className="border-b border-gray-800 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-cyan-400">{gameData.title} - Game Guide</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {gameData.shortDescription}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="howto" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-gray-800 border-b border-gray-800">
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
          
          <ScrollArea className="flex-1">
            <TabsContent value="howto" className="p-4 space-y-4 mt-0">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-cyan-400">How to Play</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  {gameData.howToPlay.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-cyan-400">Game Rules</h3>
                <div className="space-y-3">
                  {gameData.rules.map((rule, i) => (
                    <div key={i}>
                      <h4 className="font-medium text-white">{rule.title}</h4>
                      <p className="text-gray-300 text-sm">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {gameData.controls && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-cyan-400">Controls</h3>
                  {gameData.controls.keyboard && (
                    <div className="mb-2">
                      <h4 className="text-white text-sm font-medium">Keyboard:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                        {gameData.controls.keyboard.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {gameData.controls.touch && (
                    <div>
                      <h4 className="text-white text-sm font-medium">Touch/Mobile:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                        {gameData.controls.touch.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="elements" className="p-4 space-y-4 mt-0">
              {gameData.elements ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gameData.elements.map((element, i) => (
                    <div key={i} className="bg-gray-800/50 rounded p-3 border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{element.symbol}</div>
                        <div>
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
              ) : (
                <p className="text-gray-400">No element details available for this game.</p>
              )}
            </TabsContent>
            
            {gameData.tips && (
              <TabsContent value="tips" className="p-4 space-y-4 mt-0">
                <h3 className="text-lg font-semibold text-cyan-400">Tips & Strategies</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  {gameData.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
        
        <div className="border-t border-gray-800 pt-3 flex justify-end">
          <Button onClick={onClose} variant="outline" className="bg-gray-800 text-white border-gray-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
