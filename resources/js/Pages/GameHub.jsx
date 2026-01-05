import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function GameHub() {
    const [gameCode, setGameCode] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const handleCreateGame = async () => {
        setIsCreating(true);

        try {
            const token =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") ?? "";

            const response = await fetch("/authenticated-games", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": token,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to create game");
            }

            const data = await response.json();
            window.location.href = `/authenticated-games/${data.slug}/moderator`;
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinGame = async (e) => {
        e.preventDefault();

        if (!gameCode.trim()) {
            toast.error("Please enter a game code");
            return;
        }

        setIsJoining(true);

        try {
            const token =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") ?? "";

            const response = await fetch("/authenticated-games/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": token,
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    game_code: gameCode.toUpperCase(),
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(
                    err.message || "Failed to join game. Check the code."
                );
            }

            const data = await response.json();
            window.location.href = `/authenticated-games/${data.slug}/lobby/${data.player_id}`;
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <>
            <Head>
                <title>Game Hub - Pakistani Imposter Game</title>
            </Head>

            <Toaster position="top-center" />

            <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center px-4 py-6">
                <div className="relative w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
                    {/* Header */}
                    <div className="border-b-4 border-pink-500 pb-6 mb-8 flex flex-col items-center gap-3">
                        <div className="text-6xl">
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="h-24 w-24 rounded-full mx-auto"
                            />
                        </div>
                        <div className="text-cyan-300 tracking-[0.2em] font-semibold text-lg">
                            PAKISTANI IMPOSTER GAME
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                        Game Hub
                    </h1>
                    <p className="text-slate-600 mb-8">
                        Create a game or join one using a code
                    </p>

                    {/* Create Game */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Create Game Card */}
                        <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6">
                            <div className="text-4xl mb-3">🎮</div>
                            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                                Create Game
                            </h2>
                            <p className="text-slate-600 text-sm mb-4">
                                You will be the moderator. Configure categories, imposters, and start
                                the game.
                            </p>
                            <button
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-green-300/60 transition disabled:opacity-50"
                                onClick={handleCreateGame}
                                disabled={isCreating}
                            >
                                {isCreating ? "Creating..." : "Create New Game"}
                            </button>
                        </div>

                        {/* Join Game Card */}
                        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
                            <div className="text-4xl mb-3">🔗</div>
                            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                                Join Game
                            </h2>
                            <p className="text-slate-600 text-sm mb-4">
                                Enter the game code provided by the moderator
                            </p>
                            <form onSubmit={handleJoinGame}>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-xl font-bold tracking-widest uppercase text-blue-900 text-center focus:outline-none focus:border-blue-500 mb-3"
                                    placeholder="XXXXXX"
                                    value={gameCode}
                                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                                    maxLength="6"
                                />
                                <button
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-300/60 transition disabled:opacity-50"
                                    type="submit"
                                    disabled={isJoining}
                                >
                                    {isJoining ? "Joining..." : "Join Game"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-slate-200">
                        <a
                            href="/dashboard"
                            className="text-slate-600 hover:text-slate-900 font-semibold"
                        >
                            ← Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
