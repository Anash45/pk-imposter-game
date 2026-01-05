import { Head, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const CARD_GRADIENTS = [
    "bg-gradient-to-br from-cyan-400 to-cyan-500 text-slate-900",
    "bg-gradient-to-br from-pink-400 to-rose-400 text-white",
    "bg-gradient-to-br from-green-500 to-green-400 text-slate-900",
    "bg-gradient-to-br from-amber-400 to-amber-300 text-slate-900",
    "bg-gradient-to-br from-purple-600 to-purple-400 text-white",
    "bg-gradient-to-br from-orange-500 to-orange-300 text-slate-900",
    "bg-gradient-to-br from-cyan-500 to-teal-300 text-slate-900",
    "bg-gradient-to-br from-indigo-600 to-indigo-400 text-white",
];

export default function PlayerLobby({
    gameSlug,
    playerToken,
    playerName,
    players,
    gameStatus,
}) {
    const [cardFlipped, setCardFlipped] = useState(false);
    const [hasViewed, setHasViewed] = useState(false);
    const [isImposter, setIsImposter] = useState(false);
    const [word, setWord] = useState("");
    const [alreadyViewed, setAlreadyViewed] = useState(false);
    const [isLoadingCard, setIsLoadingCard] = useState(false);
    const [localGameStatus, setLocalGameStatus] = useState(gameStatus);

    // Poll for game status changes
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/authenticated-games/${gameSlug}/card/${playerToken}`,
                    {
                        headers: { Accept: "application/json" },
                    }
                );

                if (response.status === 200) {
                    const data = await response.json();
                    // Game has started, auto-fetch card
                    if (localGameStatus === "waiting") {
                        setLocalGameStatus("active");
                        if (!hasViewed) {
                            fetchCard();
                        }
                    }
                }
            } catch (error) {
                // Continue polling
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [gameSlug, playerToken, localGameStatus, hasViewed]);

    const fetchCard = async () => {
        if (isLoadingCard || hasViewed) return;

        setIsLoadingCard(true);
        try {
            const response = await fetch(
                `/authenticated-games/${gameSlug}/card/${playerToken}`,
                {
                    headers: { Accept: "application/json" },
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                if (response.status === 422) {
                    toast.error("Game hasn't started yet");
                } else {
                    throw new Error(err.message || "Failed to fetch card");
                }
                return;
            }

            const data = await response.json();
            setAlreadyViewed(data.alreadyViewed);
            setIsImposter(data.isImposter);
            if (!data.alreadyViewed && data.word) {
                setWord(data.word);
            }
            setHasViewed(true);
        } catch (error) {
            toast.error(error.message || "Failed to fetch card");
        } finally {
            setIsLoadingCard(false);
        }
    };

    const handleHoldStart = (event) => {
        event?.preventDefault();
        setCardFlipped(true);
    };

    const handleHoldEnd = (event) => {
        event?.preventDefault();
        setCardFlipped(false);
    };

    const cardGradient = CARD_GRADIENTS[0]; // You can randomize this based on playerName

    return (
        <>
            <Head>
                <title>Game Lobby - Pakistani Imposter Game</title>
            </Head>

            <Toaster position="top-center" />

            <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center px-4 py-6">
                <div className="relative w-full max-w-4xl bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                            Game Lobby
                        </h1>
                        <p className="text-slate-600">
                            Welcome, <strong>{playerName}</strong>!
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            {localGameStatus === "waiting"
                                ? "Waiting for moderator to start the game..."
                                : "Game is starting! Touch and hold your card below."}
                        </p>
                    </div>

                    {/* Players Grid */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                            Players ({players.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className="rounded-2xl border-2 border-pink-200 bg-pink-50 px-4 py-3 text-center"
                                >
                                    <div className="font-semibold text-slate-800">
                                        {player.name}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        #{player.position + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card Display */}
                    {localGameStatus === "active" && (
                        <div className="text-center">
                            <div className="text-lg font-medium text-slate-700 mb-4">
                                Touch &amp; hold card to see your secret
                            </div>

                            <div
                                className={`relative w-80 h-[480px] mx-auto my-12 [perspective:1100px] select-none touch-none`}
                                onMouseDown={handleHoldStart}
                                onTouchStart={handleHoldStart}
                                onMouseUp={handleHoldEnd}
                                onMouseLeave={handleHoldEnd}
                                onTouchEnd={handleHoldEnd}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <div
                                    className={`relative w-full h-full rounded-3xl shadow-2xl transition-transform duration-[900ms] ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] [transform-style:preserve-3d] ${
                                        cardFlipped
                                            ? "[transform:rotateY(180deg)]"
                                            : ""
                                    }`}
                                >
                                    <div className="absolute inset-0 rounded-3xl flex items-center justify-center px-6 text-2xl font-bold text-center text-slate-100 bg-gradient-to-br from-slate-800 to-slate-700 [backface-visibility:hidden]">
                                        {playerName}
                                    </div>
                                    <div
                                        className={`absolute inset-0 rounded-3xl flex items-center justify-center px-6 text-2xl font-bold text-center whitespace-pre-line [transform:rotateY(180deg)] [backface-visibility:hidden] ${cardGradient}`}
                                    >
                                        {alreadyViewed
                                            ? "Already Viewed"
                                            : isImposter
                                            ? "YOU ARE\nTHE IMPOSTER!"
                                            : word}
                                    </div>
                                </div>
                            </div>

                            {!hasViewed && (
                                <button
                                    className="mt-4 bg-cyan-300 text-slate-900 font-semibold px-6 py-3 rounded-xl shadow-md shadow-cyan-200/60"
                                    onClick={fetchCard}
                                    disabled={isLoadingCard}
                                >
                                    {isLoadingCard ? "Loading..." : "Click to view your card"}
                                </button>
                            )}

                            {hasViewed && !alreadyViewed && (
                                <div className="mt-4 p-4 rounded-xl bg-green-50 border-2 border-green-200">
                                    <p className="text-green-700 font-semibold">
                                        ✓ Card viewed. Keep your secret!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {localGameStatus === "waiting" && (
                        <div className="text-center py-12">
                            <div className="inline-block">
                                <div className="animate-spin">
                                    <svg
                                        className="w-16 h-16 text-pink-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-slate-600 mt-4">
                                Waiting for the moderator to configure and start the game...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
