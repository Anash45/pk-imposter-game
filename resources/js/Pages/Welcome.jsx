import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const MIN_PLAYERS = 3;
const MIN_WORDS = 30;
const COLOR_COUNT = 8;

const initialPlayerInputs = ["Player 1", "Player 2", "Player 3"];
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

export default function Welcome({ categories = {} }) {
    const [playerInputs, setPlayerInputs] = useState(initialPlayerInputs);
    const [players, setPlayers] = useState(initialPlayerInputs);
    const [mode, setMode] = useState("offline");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [step, setStep] = useState("players"); // players | categories | game | share
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [currentWord, setCurrentWord] = useState("");
    const [imposterIndex, setImposterIndex] = useState(-1);
    const [cardColors, setCardColors] = useState([]);
    const [cardFlipped, setCardFlipped] = useState(false);
    const [hasViewed, setHasViewed] = useState(false);
    const [discussionReady, setDiscussionReady] = useState(false);
    const [showReveal, setShowReveal] = useState(false);
    const [shareLinks, setShareLinks] = useState([]);
    const [creatingOnline, setCreatingOnline] = useState(false);
    const [gameSlug, setGameSlug] = useState("");

    const activePlayers = useMemo(
        () => playerInputs.map((p) => p.trim()).filter(Boolean),
        [playerInputs]
    );

    const allWords = useMemo(
        () => selectedCategories.flatMap((cat) => categories[cat] || []),
        [selectedCategories, categories]
    );

    useEffect(() => {
        setPlayers(activePlayers);
    }, [activePlayers]);

    // useEffect(() => {
    //     if ("serviceWorker" in navigator) {
    //         navigator.serviceWorker
    //             .register("/service-worker.js", { scope: "/" })
    //             .catch(() => {});
    //     }
    // }, []);

    const canGoToCategories = activePlayers.length >= MIN_PLAYERS;
    const canStartRound = allWords.length >= MIN_WORDS;
    const currentPlayer = players[currentPlayerIndex];
    const cardGradient = CARD_GRADIENTS[(cardColors[currentPlayerIndex] || 1) - 1];

    const shuffle = (items) => {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const addPlayerInput = () => {
        setPlayerInputs((prev) => [...prev, ""]);
    };

    const updatePlayerInput = (index, value) => {
        setPlayerInputs((prev) => prev.map((p, i) => (i === index ? value : p)));
    };

    const removePlayerInput = (index) => {
        setPlayerInputs((prev) => prev.filter((_, i) => i !== index));
    };

    const goToCategories = () => {
        if (!canGoToCategories) return;
        setStep("categories");
    };

    const goBackToPlayers = () => {
        setStep("players");
    };

    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const copyLink = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied!");
        } catch (error) {
            window.prompt("Copy link", url);
            toast("Copied link ready to paste.");
        }
    };

    const voiceUrl = gameSlug ? `https://meet.jit.si/pk-imposter-${gameSlug}` : "";
    const lobbyUrl = gameSlug ? `${window.location.origin}/games/${gameSlug}` : "";

    const startNewRound = async () => {
        if (!canStartRound || creatingOnline) return;

        setShareLinks([]);
        setGameSlug("");

        if (mode === "online") {
            setCreatingOnline(true);
            try {
                const token =
                    document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

                const response = await fetch("/games", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": token,
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        mode: "online",
                        players: activePlayers,
                        categories: selectedCategories,
                    }),
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.message || "Unable to create online game.");
                }

                const data = await response.json();
                setShareLinks(data.players || []);
                setGameSlug(data.game?.slug || "");
                setStep("share");
                toast.success("Online game created. Share the links below.");
            } catch (error) {
                toast.error(error.message || "Something went wrong creating the online game.");
            } finally {
                setCreatingOnline(false);
            }
            return;
        }

        const orderedPlayers = [...players];
        const word = shuffle(allWords)[0];
        const colors = orderedPlayers.map(
            () => Math.floor(Math.random() * COLOR_COUNT) + 1
        );

        setPlayers(orderedPlayers);
        setCurrentWord(word);
        setCardColors(colors);
        setImposterIndex(Math.floor(Math.random() * orderedPlayers.length));
        setCurrentPlayerIndex(0);
        setCardFlipped(false);
        setHasViewed(false);
        setDiscussionReady(false);
        setShowReveal(false);
        setStep("game");
    };

    const handleHoldStart = (event) => {
        event?.preventDefault();
        setCardFlipped(true);
    };

    const handleHoldEnd = (event) => {
        event?.preventDefault();
        setCardFlipped(false);
        const isLastPlayer = currentPlayerIndex === players.length - 1;
        if (isLastPlayer) {
            setDiscussionReady(true);
            setShowReveal(false);
            setHasViewed(false);
        } else {
            setHasViewed(true);
        }
    };

    const proceedToNext = () => {
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex((idx) => idx + 1);
            setCardFlipped(false);
            setHasViewed(false);
        } else {
            setDiscussionReady(true);
            setShowReveal(false);
        }
    };

    const startDiscussion = () => {
        setShowReveal(true);
    };

    const revealImposter = () => {
        toast(
            () => (
                <div className="text-left">
                    <div className="font-semibold">Secret word:</div>
                    <div className="mb-2">{currentWord}</div>
                    <div className="font-semibold">Imposter:</div>
                    <div>{players[imposterIndex]}</div>
                </div>
            ),
            { duration: 6000 }
        );
    };

    const resetToCategories = () => {
        setStep("categories");
        setCardFlipped(false);
        setHasViewed(false);
        setDiscussionReady(false);
        setShowReveal(false);
        setShareLinks([]);
        setCreatingOnline(false);
        setGameSlug("");
    };

    const playAgain = () => {
        startNewRound();
    };

    return (
        <>
            <Head>
                <title>Pakistani Imposter Game - Online Party Game</title>
            </Head>

            <Toaster position="top-center" />

            <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center px-4 py-6">
                <div className="relative w-full max-w-5xl bg-white rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
                    {step === "players" && (
                        <div className="border-b-4 border-pink-500 pb-6 mb-6 flex flex-col items-center gap-3">
                            <div className="text-6xl animate-pulse">
                                <img src="/images/logo.png" alt="Logo" className="h-24 w-24 rounded-full" />
                            </div>
                            <div className="text-cyan-300 tracking-[0.2em] font-semibold text-lg">
                                PAKISTANI IMPOSTER GAME
                            </div>
                        </div>
                    )}

                    <button
                        className="fixed top-4 right-4 z-50 bg-sky-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-sky-300/60 hover:bg-sky-600 transition"
                        onClick={resetToCategories}
                    >
                        New Game
                    </button>

                    {step === "players" && (
                        <section className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-6">
                                Step 1: Players (min. 3)
                            </h2>
                            <div className="flex flex-wrap justify-center gap-3 mb-4">
                                <button
                                    className={`px-4 py-2 rounded-xl font-semibold shadow-sm border-2 transition ${
                                        mode === "offline"
                                            ? "bg-cyan-500 border-cyan-500 text-white shadow-cyan-200/60"
                                            : "bg-white border-slate-200 text-slate-700 hover:border-cyan-400"
                                    }`}
                                    onClick={() => setMode("offline")}
                                >
                                    Offline (pass device)
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-xl font-semibold shadow-sm border-2 transition ${
                                        mode === "online"
                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200/60"
                                            : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400"
                                    }`}
                                    onClick={() => setMode("online")}
                                >
                                    Online (share links)
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 mb-6">
                                Offline: everyone uses the same device. Online: generate one-time links per player (no account needed).
                            </p>
                            <button
                                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-xl shadow-md shadow-pink-300/50 transition"
                                onClick={addPlayerInput}
                            >
                                + Add Player
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                {playerInputs.map((value, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                                            placeholder={`Player ${idx + 1}`}
                                            value={value}
                                            onChange={(e) => updatePlayerInput(idx, e.target.value)}
                                        />
                                        <button
                                            className="px-3 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                                            onClick={() => removePlayerInput(idx)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 my-6">
                                {activePlayers.map((p) => (
                                    <span
                                        key={p}
                                        className="bg-cyan-300 text-slate-900 font-bold px-4 py-2 rounded-full shadow-md shadow-cyan-200/60"
                                    >
                                        {p}
                                    </span>
                                ))}
                            </div>

                            <button
                                className="mt-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-pink-300/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={goToCategories}
                                disabled={!canGoToCategories}
                            >
                                {canGoToCategories ? "Next → Categories" : `Need ${MIN_PLAYERS - activePlayers.length} more`}
                            </button>
                        </section>
                    )}

                    {step === "categories" && (
                        <section className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-4">
                                Step 2: Pick Categories
                            </h2>
                            <p className="text-base text-indigo-300 mb-2">
                                <strong>Current Players:</strong> <span className="text-cyan-300">{players.join(", ")}</span>
                                <button
                                    className="ml-4 px-3 py-2 text-sm rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    onClick={goBackToPlayers}
                                >
                                    Change Players
                                </button>
                            </p>

                            <p className="text-lg font-semibold text-slate-800 my-4">
                                Selected words: <span className="text-pink-500">{allWords.length}</span> / {MIN_WORDS}+
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                                {Object.keys(categories).map((cat) => {
                                    const selected = selectedCategories.includes(cat);
                                    const count = categories[cat]?.length ?? 0;
                                    return (
                                        <div
                                            key={cat}
                                            className={`rounded-2xl border-2 px-4 py-4 text-lg font-medium transition cursor-pointer shadow-sm ${
                                                selected
                                                    ? "bg-pink-500 text-white border-pink-500 shadow-pink-300/60"
                                                    : "bg-slate-50 text-slate-800 border-slate-200 hover:-translate-y-1 hover:border-pink-500 hover:shadow-lg"
                                            }`}
                                            onClick={() => toggleCategory(cat)}
                                        >
                                            {cat} ({count})
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                className="mt-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-pink-300/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={startNewRound}
                                disabled={!canStartRound || creatingOnline}
                            >
                                {!canStartRound
                                    ? `Need ${MIN_WORDS - allWords.length} more words`
                                    : creatingOnline
                                    ? "Creating..."
                                    : mode === "online"
                                    ? "Create online game"
                                    : "Start Round!"}
                            </button>
                        </section>
                    )}

                    {step === "share" && (
                        <section className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-4">
                                Share links with players
                            </h2>
                            <p className="text-slate-700 mb-4">
                                Choose one: share a single lobby link where everyone clicks their name, or send individual one-time links.
                            </p>

                            {lobbyUrl && (
                                <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 px-5 py-4 text-left shadow-sm mb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <div className="text-lg font-semibold text-blue-700">🎮 Single lobby link (recommended)</div>
                                            <div className="text-sm text-blue-800">One link for all players. They click their name to reveal their card.</div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            <input
                                                className="flex-1 rounded-xl border-2 border-blue-200 bg-white px-3 py-2 text-sm text-blue-900"
                                                value={lobbyUrl}
                                                readOnly
                                            />
                                            <button
                                                className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200/70 hover:bg-blue-600"
                                                onClick={() => copyLink(lobbyUrl)}
                                            >
                                                Copy link
                                            </button>
                                            <a
                                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-300 hover:bg-blue-100 text-center"
                                                href={lobbyUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Open lobby
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {voiceUrl && (
                                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-5 py-4 text-left shadow-sm mb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <div className="text-lg font-semibold text-emerald-700">Group voice room (free)</div>
                                            <div className="text-sm text-emerald-800">Powered by Jitsi; no account required, only host should login.</div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            <input
                                                className="flex-1 rounded-xl border-2 border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900"
                                                value={voiceUrl}
                                                readOnly
                                            />
                                            <button
                                                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200/70 hover:bg-emerald-600"
                                                onClick={() => copyLink(voiceUrl)}
                                            >
                                                Copy link
                                            </button>
                                            <a
                                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-300 hover:bg-emerald-100 text-center"
                                                href={voiceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Open voice room
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <details className="text-left mb-6">
                                <summary className="cursor-pointer text-slate-700 font-semibold mb-2">
                                    Or use individual links (one per player)
                                </summary>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                {shareLinks.length === 0 && (
                                    <div className="col-span-full text-slate-600">No links generated yet.</div>
                                )}
                                {shareLinks.map((player) => (
                                    <div
                                        key={player.url}
                                        className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-left shadow-sm"
                                    >
                                        <div className="text-lg font-semibold text-slate-800">{player.name}</div>
                                        <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                            <input
                                                className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                                value={player.url}
                                                readOnly
                                            />
                                            <button
                                                className="whitespace-nowrap rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200/70 hover:bg-emerald-600"
                                                onClick={() => copyLink(player.url)}
                                            >
                                                Copy link
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </details>

                            <div className="flex flex-wrap justify-center gap-3 mt-8">
                                <button
                                    className="rounded-xl bg-emerald-500 px-6 py-3 text-white font-semibold shadow-md shadow-emerald-200/70 hover:bg-emerald-600 disabled:opacity-50"
                                    onClick={startNewRound}
                                    disabled={creatingOnline}
                                >
                                    {creatingOnline ? "Creating..." : "Create another online round"}
                                </button>
                                <button
                                    className="rounded-xl bg-slate-200 px-6 py-3 text-slate-800 font-semibold hover:bg-slate-300"
                                    onClick={resetToCategories}
                                >
                                    Back to categories
                                </button>
                            </div>
                        </section>
                    )}

                    {step === "game" && (
                        <section className="text-center">
                            <h2 className={`text-xl sm:text-2xl font-semibold text-slate-800 mb-4 ${discussionReady ? "visible" : "invisible"}`}>
                                {discussionReady && (
                                    <>
                                        <strong>{players.find((_, i) => i !== imposterIndex)}</strong> — start the discussion!
                                    </>
                                )}
                            </h2>

                            <div className="text-lg font-medium text-slate-700 mb-4">
                                Touch &amp; hold card to see your secret
                            </div>

                            <div
                                className={`relative w-80 h-[480px] mx-auto my-12 [perspective:1100px] select-none touch-none ${
                                    showReveal ? "hidden" : ""
                                }`}
                                onMouseDown={handleHoldStart}
                                onTouchStart={handleHoldStart}
                                onMouseUp={handleHoldEnd}
                                onMouseLeave={handleHoldEnd}
                                onTouchEnd={handleHoldEnd}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <div
                                    className={`relative w-full h-full rounded-3xl shadow-2xl transition-transform duration-[900ms] ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] [transform-style:preserve-3d] ${
                                        cardFlipped ? "[transform:rotateY(180deg)]" : ""
                                    }`}
                                >
                                    <div
                                        className="absolute inset-0 rounded-3xl flex items-center justify-center px-6 text-2xl font-bold text-center text-slate-100 bg-gradient-to-br from-slate-800 to-slate-700 [backface-visibility:hidden]"
                                    >
                                        {currentPlayer}
                                    </div>
                                    <div
                                        className={`absolute inset-0 rounded-3xl flex items-center justify-center px-6 text-2xl font-bold text-center whitespace-pre-line [transform:rotateY(180deg)] [backface-visibility:hidden] ${cardGradient}`}
                                    >
                                        {currentPlayerIndex === imposterIndex ? "YOU ARE\nTHE IMPOSTER!" : currentWord}
                                    </div>
                                </div>
                            </div>

                            <div className="text-lg font-medium text-slate-700 mb-4">
                                {discussionReady ? "Everyone has seen their card!" : `Pass device to ${currentPlayer}`}
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <button
                                    className={`bg-cyan-300 text-slate-900 font-semibold px-6 py-3 rounded-xl shadow-md shadow-cyan-200/60 transition ${
                                        hasViewed && !discussionReady ? "block" : "hidden"
                                    }`}
                                    onClick={proceedToNext}
                                >
                                    Next Player
                                </button>

                                <button
                                    className={`bg-green-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-green-300/60 transition ${
                                        discussionReady && !showReveal ? "block" : "hidden"
                                    }`}
                                    onClick={startDiscussion}
                                >
                                    Start Game!
                                </button>

                                <button
                                    className={`bg-rose-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-rose-300/60 transition ${
                                        showReveal ? "block" : "hidden"
                                    }`}
                                    onClick={revealImposter}
                                >
                                    Reveal Word + Imposter
                                </button>

                                <button
                                    className={`bg-pink-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-pink-300/60 transition ${
                                        showReveal ? "block" : "hidden"
                                    }`}
                                    onClick={playAgain}
                                >
                                    New Round (same players &amp; categories)
                                </button>
                            </div>
                        </section>
                    )}

                    <footer className="mt-10 pt-8 border-t-2 border-slate-200 text-left text-slate-600 text-base leading-relaxed">
                        <h3 className="text-2xl font-semibold text-slate-800 mb-3">About Pakistani Imposter Game</h3>
                        <p>
                            Welcome to the <strong>Pakistani Imposter Game</strong>, an engaging multiplayer party game that brings Pakistani culture and traditions to life.
                        </p>
                        <p>
                            The game features <strong>12 diverse categories</strong> including Pakistani foods, kitchen utensils, everyday objects, occupations, animals, sports, transportation, music, hobbies, school items, brands, and video games.
                        </p>
                        <p>
                            Perfect for family gatherings, parties, and social events, the Pakistani Imposter Game promotes cultural awareness, strategic thinking, and fun-filled entertainment.
                        </p>
                        <p>
                            Whether you are celebrating a family dawat or hosting a mehndi party, this game delivers engaging entertainment that celebrates Pakistani culture and traditions.
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}