import { Head } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
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

export default function GameLobby({ gameSlug, players = [], voiceUrl }) {
    const [revealedPlayer, setRevealedPlayer] = useState(null);
    const [revealedData, setRevealedData] = useState(null);
    const [revealing, setRevealing] = useState(false);
    const [lobbyPlayers, setLobbyPlayers] = useState(players);
    const [chatOpen, setChatOpen] = useState(false);
    const [currentPlayerName, setCurrentPlayerName] = useState(() => {
        return localStorage.getItem(`lobby-player-${gameSlug}`) || null;
    });
    const lockedPlayerName = currentPlayerName;

    const handleReveal = async (player) => {
        // 🚫 If someone already viewed a card on this device
        if (lockedPlayerName && lockedPlayerName !== player.name) {
            toast.error("You can only view your own card.");
            return;
        }

        if (player.hasViewed) {
            toast.error("This card has already been revealed.");
            return;
        }

        setRevealing(true);
        try {
            const token =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") ?? "";

            const response = await fetch(
                `/games/${gameSlug}/reveal/${player.id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": token,
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to reveal card.");
            }

            const data = await response.json();

            if (data.alreadyViewed) {
                toast.error("This card has already been revealed.");
                return;
            }

            setRevealedPlayer(player);
            setRevealedData(data);

            // 🔒 Lock this device to this player
            localStorage.setItem(`lobby-player-${gameSlug}`, player.name);
            setCurrentPlayerName(player.name);

            setLobbyPlayers((prev) =>
                prev.map((p) =>
                    p.id === player.id ? { ...p, hasViewed: true } : p
                )
            );
        } catch (error) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setRevealing(false);
        }
    };

    const closeReveal = () => {
        setRevealedPlayer(null);
        setRevealedData(null);
    };

    const cardGradient = revealedPlayer
        ? CARD_GRADIENTS[
              Math.abs(hashString(revealedPlayer.name || "")) %
                  CARD_GRADIENTS.length
          ]
        : "";

    const display = revealedData
        ? revealedData.alreadyViewed
            ? {
                  title: "Card already revealed",
                  body: "This card was already viewed.",
              }
            : revealedData.isImposter
            ? {
                  title: "You are the Imposter!",
                  body: "Bluff your way through the round.",
              }
            : { title: "Your Secret Word", body: revealedData.word }
        : null;

    return (
        <>
            <Head>
                <title>Game Lobby - Pakistani Imposter Game</title>
            </Head>

            <Toaster position="top-center" />

            <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center px-4 py-10">
                <div className="w-full max-w-4xl bg-white rounded-3xl p-8 shadow-2xl text-center">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-slate-900">
                                Game Lobby
                            </h1>
                            <p className="text-slate-600">
                                Click your name to reveal your card. Keep it
                                secret!
                            </p>
                        </div>
                        <button
                            className="self-start inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-700 border border-slate-200 hover:bg-slate-200"
                            onClick={() => setChatOpen((prev) => !prev)}
                        >
                            <span>💬</span>
                            <span className="font-semibold">Chat</span>
                        </button>
                    </div>

                    {/* {voiceUrl && (
                        <div className="mb-6">
                            <a
                                href={voiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block rounded-xl bg-emerald-500 px-5 py-3 text-white font-semibold shadow-md shadow-emerald-200/70 hover:bg-emerald-600"
                            >
                                Join group voice chat
                            </a>
                        </div>
                    )} */}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-8">
                        {lobbyPlayers.map((player) => {
                            const isLockedOut =
                                lockedPlayerName &&
                                lockedPlayerName !== player.name;

                            return (
                                <button
                                    key={player.id}
                                    onClick={() => handleReveal(player)}
                                    disabled={
                                        player.hasViewed ||
                                        revealing ||
                                        isLockedOut
                                    }
                                    className={`rounded-2xl border-2 px-6 py-8 text-lg font-semibold transition shadow-sm ${
                                        player.hasViewed
                                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                            : isLockedOut
                                            ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                                            : "bg-gradient-to-br from-pink-400 to-rose-400 text-white border-pink-500 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                                    }`}
                                >
                                    {player.name}

                                    {player.hasViewed && (
                                        <div className="text-sm mt-1 font-normal">
                                            Already revealed
                                        </div>
                                    )}

                                    {isLockedOut && !player.hasViewed && (
                                        <div className="text-xs mt-1 opacity-70">
                                            Locked
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {revealedPlayer && display && (
                        <div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                            onClick={closeReveal}
                        >
                            <div
                                className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                    Hi, {revealedPlayer.name}
                                </h2>

                                <div className="relative w-full h-72 mx-auto my-6 [perspective:1100px] select-none">
                                    <div
                                        className={`relative w-full h-full rounded-3xl shadow-2xl flex flex-col items-center justify-center px-6 text-center ${cardGradient}`}
                                    >
                                        <div className="text-2xl font-bold mb-3">
                                            {display.title}
                                        </div>
                                        <div className="text-lg whitespace-pre-line">
                                            {display.body}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-sm text-slate-500 mb-4">
                                    {!revealedData.alreadyViewed &&
                                        "Remember your card! You can't view it again."}
                                </div>

                                <button
                                    className="w-full rounded-xl bg-pink-500 px-6 py-3 text-white font-semibold shadow-md hover:bg-pink-600"
                                    onClick={closeReveal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {chatOpen && (
                        <Chat
                            gameSlug={gameSlug}
                            playerName={currentPlayerName || "Guest"}
                            onClose={() => setChatOpen(false)}
                        />
                    )}

                    <div className="text-sm text-slate-500 mt-8">
                        Share this page's URL with all players to let them
                        reveal their cards.
                    </div>
                </div>
            </div>
        </>
    );
}
