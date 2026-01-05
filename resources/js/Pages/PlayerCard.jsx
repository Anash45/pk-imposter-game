import { Head } from "@inertiajs/react";
import { useState } from "react";
import Chat from "@/Components/Chat";

const CARD_GRADIENTS = [
    "bg-gradient-to-br from-cyan-400 to-cyan-600 text-slate-900",
    "bg-gradient-to-br from-emerald-500 to-teal-400 text-white",
    "bg-gradient-to-br from-indigo-600 to-blue-400 text-white",
    "bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900",
    "bg-gradient-to-br from-rose-500 to-pink-400 text-white",
    "bg-gradient-to-br from-slate-800 to-slate-600 text-white",
    "bg-gradient-to-br from-lime-400 to-green-500 text-slate-900",
    "bg-gradient-to-br from-purple-600 to-fuchsia-400 text-white",
];

const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return hash;
};

export default function PlayerCard({ playerName, alreadyViewed, isImposter, word, voiceUrl, gameSlug }) {
    const [chatOpen, setChatOpen] = useState(false);
    
    const display = alreadyViewed
        ? {
              title: "Card already revealed",
              body: "This card was already viewed. Ask the host for your status.",
          }
        : isImposter
          ? { title: "You are the Imposter!", body: "Bluff your way through the round." }
          : { title: "Your Secret Word", body: word };

    const cardGradient = CARD_GRADIENTS[Math.abs(hashString(playerName || "")) % CARD_GRADIENTS.length];

    return (
        <>
            <Head>
                <title>Imposter Card</title>
            </Head>
            <div className="min-h-screen w-full flex flex-col items-center px-4 py-10">
                <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Hi, {playerName}</h1>
                    <p className="text-slate-600 mb-6">Keep this page secret from other players.</p>

                    <div className="relative w-full h-72 mx-auto my-6 [perspective:1100px] select-none">
                        <div className={`relative w-full h-full rounded-3xl shadow-2xl text-white flex flex-col items-center justify-center px-6 text-center ${cardGradient}`}>
                            <div className="text-2xl font-bold mb-3">{display.title}</div>
                            <div className="text-lg whitespace-pre-line">{display.body}</div>
                        </div>
                    </div>

                    <div className="text-sm text-slate-500 mb-6">
                        If you refresh this page, you will not see your card again.
                    </div>

                    {voiceUrl && (
                        <a
                            href={voiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded-xl bg-emerald-500 px-5 py-3 text-white font-semibold shadow-md shadow-emerald-200/70 hover:bg-emerald-600"
                        >
                            Join group voice chat
                        </a>
                    )}

                    {gameSlug && (
                        <button
                            onClick={() => setChatOpen(true)}
                            className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-600"
                            aria-label="Open Chat"
                        >
                            💬
                        </button>
                    )}

                    {chatOpen && (
                        <Chat
                            gameSlug={gameSlug}
                            playerName={playerName}
                            onClose={() => setChatOpen(false)}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
