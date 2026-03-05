/**
 * HardHatTour.tsx — 5-room backstage tour dialog
 *
 * DESIGN: "Warm Noir" — immersive walkthrough of the Bingo City concept
 * Opens as a Dialog with room-by-room navigation
 *
 * shadcn/ui: Dialog, Button
 * Icons: ChevronLeft, ChevronRight, HardHat (Lucide)
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, HardHat } from "lucide-react";
import { useState } from "react";
import { TOUR_ROOMS } from "../data/mockData";

interface HardHatTourProps {
  /** Custom trigger element */
  trigger?: React.ReactNode;
}

export default function HardHatTour({ trigger }: HardHatTourProps) {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [open, setOpen] = useState(false);

  const room = TOUR_ROOMS[currentRoom];
  const isFirst = currentRoom === 0;
  const isLast = currentRoom === TOUR_ROOMS.length - 1;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) setCurrentRoom(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="gap-2 border-[#ff8833]/30 text-[#ff8833] hover:bg-[#ff8833]/10 hover:text-[#ff8833]"
          >
            <HardHat className="w-4 h-4" />
            Backstage Tour
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0e0e1a 0%, #0a0a14 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="bingo-label text-[10px]">
              🏗️ hard hat tour — room {currentRoom + 1} of {TOUR_ROOMS.length}
            </div>
          </div>
          <DialogTitle className="text-lg font-bold text-white/90 mt-2">
            <span className="text-2xl mr-2">{room.emoji}</span>
            {room.title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4">
          {/* Room image (if available) */}
          {room.imageSrc && (
            <div
              className="rounded-lg overflow-hidden mb-4 mt-2"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <img
                src={room.imageSrc}
                alt={room.imageAlt || room.title}
                className="w-full h-40 object-cover object-top"
                loading="lazy"
              />
            </div>
          )}

          {/* Room description */}
          <p className="text-sm text-white/70 leading-relaxed mb-6">
            {room.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {TOUR_ROOMS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentRoom(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentRoom
                    ? "bg-[#ff8833] w-6"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentRoom((c) => c - 1)}
              disabled={isFirst}
              className="text-white/50 hover:text-white/80"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {isLast ? (
              <Button
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="bg-[#ff8833] text-black hover:bg-[#ff8833]/90 font-medium"
              >
                Done — Let's Build!
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentRoom((c) => c + 1)}
                className="text-white/50 hover:text-white/80"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
