import { Head } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";

const MIN_WORDS = 30;
const COLOR_COUNT = 8;

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

export default function ModeratorDashboard({
    gameCode,
    gameSlug,
    gameStatus,
    players,
    categories,
    selectedCategories: initialSelectedCategories,
    impostersCount: initialImpostersCount,
}) {
    const [selectedCategories, setSelectedCategories] = useState(
        initialSelectedCategories || []
    );
    const [imposterCount, setImposterCount] = useState(
        initialImpostersCount || 1
    );
    const [isStarting, setIsStarting] = useState(false);

    const allWords = useMemo(() => {
        return categories
            .filter((category) => selectedCategories.includes(category.name))
            .flatMap((category) => category.words ?? []);
    }, [selectedCategories, categories]);

    const playerCount = players.length;
    const maxImposters =
        playerCount >= 10 ? 3 : playerCount >= 6 ? 2 : playerCount >= 3 ? 1 : 0;

    const canStartGame = allWords.length >= MIN_WORDS && selectedCategories.length > 0;

    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const selectAllCategories = () => {
        const allSelected = selectedCategories.length === categories.length;
        setSelectedCategories(
            allSelected ? [] : categories.map((c) => c.name)
        );
    };

    const copyGameCode = async () => {
        try {
            await navigator.clipboard.writeText(gameCode);
            toast.success("Game code copied!");
        } catch (error) {
            window.prompt("Copy game code", gameCode);
            toast("Code ready to paste.");
        }
    };

    const handleStartGame = async () => {
        if (!canStartGame || isStarting) return;

        setIsStarting(true);

        try {
            const token =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") ?? "";

            const response = await fetch(`/authenticated-games/${gameSlug}/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": token,
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    categories: selectedCategories,
                    imposters: imposterCount,
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || "Failed to start game");
            }

            toast.success("Game started! Players will see their cards.");
            // Optionally redirect or update UI
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Moderator Dashboard - Pakistani Imposter Game</title>
            </Head>

            <Toaster position="top-center" />

            <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center px-4 py-6">
                <div className="relative w-full max-w-5xl bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
                    {/* Header */}
                    <div className="border-b-4 border-pink-500 pb-6 mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                            Moderator Dashboard
                        </h1>
                        <p className="text-slate-600">
                            Configure game settings and manage players
                        </p>
                    </div>

                    {/* Game Code Section */}
                    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 px-5 py-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <div className="text-lg font-semibold text-blue-700">
                                    🎮 Game Code
                                </div>
                                <div className="text-sm text-blue-800">
                                    Share this code with players to join
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    className="rounded-xl border-2 border-blue-200 bg-white px-4 py-2 text-2xl font-bold text-blue-900 tracking-widest"
                                    value={gameCode}
                                    readOnly
                                />
                                <button
                                    className="rounded-xl bg-blue-500 px-4 py-2 text-white font-semibold shadow-md hover:bg-blue-600"
                                    onClick={copyGameCode}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Players Section */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                            Players Joined ({players.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {players.length === 0 ? (
                                <div className="col-span-full text-slate-600 text-center py-8">
                                    Waiting for players to join...
                                </div>
                            ) : (
                                players.map((player) => (
                                    <div
                                        key={player.id}
                                        className="rounded-2xl border-2 border-pink-200 bg-pink-50 px-4 py-3"
                                    >
                                        <div className="text-lg font-semibold text-slate-800">
                                            {player.name}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            Position: {player.position + 1}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                            Select Categories
                        </h2>
                        <p className="text-lg font-semibold text-slate-800 mb-4">
                            Selected words:{" "}
                            <span className="text-pink-500">{allWords.length}</span> /{" "}
                            {MIN_WORDS}+
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Select all */}
                            <div className="sm:col-span-2">
                                <button
                                    className={`rounded-2xl w-full border-2 px-4 py-4 text-lg font-medium transition cursor-pointer shadow-sm ${
                                        selectedCategories.length === categories.length
                                            ? "bg-pink-500 text-white border-pink-500 shadow-pink-300/60"
                                            : "bg-slate-50 text-slate-800 border-slate-200 hover:-translate-y-1 hover:border-pink-500 hover:shadow-lg"
                                    }`}
                                    onClick={selectAllCategories}
                                >
                                    {selectedCategories.length === categories.length
                                        ? "Clear all categories"
                                        : "Select all categories"}
                                </button>
                            </div>

                            {/* Categories */}
                            {categories.map((category) => {
                                const selected = selectedCategories.includes(
                                    category.name
                                );
                                const count = category.words?.length ?? 0;

                                return (
                                    <div
                                        key={category.id}
                                        className={`rounded-2xl border-2 px-4 py-4 text-lg font-medium transition cursor-pointer shadow-sm ${
                                            selected
                                                ? "bg-pink-500 text-white border-pink-500 shadow-pink-300/60"
                                                : "bg-slate-50 text-slate-800 border-slate-200 hover:-translate-y-1 hover:border-pink-500 hover:shadow-lg"
                                        }`}
                                        onClick={() => toggleCategory(category.name)}
                                    >
                                        {category.name} ({count})
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Imposters Count Section */}
                    {maxImposters > 0 && (
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-slate-700 mb-2">
                                Number of Imposters
                            </p>

                            <div className="flex justify-center gap-3">
                                {Array.from({ length: maxImposters }, (_, i) => i + 1).map(
                                    (count) => (
                                        <button
                                            key={count}
                                            onClick={() => setImposterCount(count)}
                                            className={`px-4 py-2 rounded-xl font-semibold border-2 transition ${
                                                imposterCount === count
                                                    ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-300/60"
                                                    : "bg-white border-slate-200 text-slate-700 hover:border-rose-400"
                                            }`}
                                        >
                                            {count}
                                        </button>
                                    )
                                )}
                            </div>

                            <p className="text-xs text-slate-500 mt-2">
                                Allowed: 1 – {maxImposters} imposters for {playerCount} players
                            </p>
                        </div>
                    )}

                    {/* Start Game Button */}
                    <button
                        className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-4 text-xl rounded-xl shadow-md shadow-green-300/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleStartGame}
                        disabled={!canStartGame || isStarting}
                    >
                        {!canStartGame
                            ? `Need ${Math.max(
                                  0,
                                  MIN_WORDS - allWords.length
                              )} more words`
                            : isStarting
                            ? "Starting..."
                            : "Start Game!"}
                    </button>
                </div>
            </div>
        </>
    );
}
