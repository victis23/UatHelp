document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealItems = document.querySelectorAll(".reveal-section");
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    const uatConsole = document.getElementById("uatConsole");
    const consoleRing = document.getElementById("consoleRing");
    const releaseHealthValue = document.getElementById("releaseHealthValue");
    const readinessValue = document.getElementById("readinessValue");
    const criticalBlockersValue = document.getElementById("criticalBlockersValue");
    const miniBlockersValue = document.getElementById("miniBlockersValue");
    const stakeholderAlignmentValue = document.getElementById("stakeholderAlignmentValue");
    const consoleRow1 = document.getElementById("consoleRow1");
    const consoleRow2 = document.getElementById("consoleRow2");
    const consoleRow3 = document.getElementById("consoleRow3");
    const consoleRow1Status = document.getElementById("consoleRow1Status");
    const consoleRow2Status = document.getElementById("consoleRow2Status");
    const consoleRow3Status = document.getElementById("consoleRow3Status");
    const miniCards = document.querySelectorAll(".console-mini-card");

    if (!uatConsole || !consoleRing) return;

    const initialState = {
        releaseHealth: 82,
        readiness: 81,
        blockers: 7,
        alignment: 91,
        row1: "Done",
        row2: "Live",
        row3: "Queued"
    };

    const finalState = {
        releaseHealth: 100,
        readiness: 100,
        blockers: 0,
        alignment: 100,
        row1: "Done",
        row2: "Done",
        row3: "Done"
    };

    let currentAnimationFrame = null;
    let sequenceTimeouts = [];
    let isAnimatingForward = false;
    let isAnimatingReverse = false;
    let hasUserScrolled = false;
    let hasAnimatedOnce = false;

    function clearAnimationFrameIfNeeded() {
        if (currentAnimationFrame) {
            cancelAnimationFrame(currentAnimationFrame);
            currentAnimationFrame = null;
        }
    }

    function clearSequenceTimeouts() {
        sequenceTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        sequenceTimeouts = [];
    }

    function setRingProgress(value) {
        consoleRing.style.setProperty("--progress", value);
    }

    function applyInitialUIState() {
        releaseHealthValue.textContent = String(initialState.releaseHealth);
        readinessValue.textContent = String(initialState.readiness);
        criticalBlockersValue.textContent = String(initialState.blockers);
        miniBlockersValue.textContent = String(initialState.blockers);
        stakeholderAlignmentValue.textContent = String(initialState.alignment);

        setRingProgress(initialState.readiness);

        consoleRow1.classList.add("complete");
        consoleRow2.classList.remove("complete");
        consoleRow3.classList.remove("complete");

        consoleRow1Status.textContent = initialState.row1;
        consoleRow2Status.textContent = initialState.row2;
        consoleRow3Status.textContent = initialState.row3;

        consoleRing.classList.remove("ring-complete", "ring-pulse");
        uatConsole.classList.remove("console-finished");
        miniCards.forEach((card) => card.classList.remove("card-finished"));
    }

    function applyFinalUIState() {
        releaseHealthValue.textContent = String(finalState.releaseHealth);
        readinessValue.textContent = String(finalState.readiness);
        criticalBlockersValue.textContent = String(finalState.blockers);
        miniBlockersValue.textContent = String(finalState.blockers);
        stakeholderAlignmentValue.textContent = String(finalState.alignment);

        setRingProgress(finalState.readiness);

        consoleRow1.classList.add("complete");
        consoleRow2.classList.add("complete");
        consoleRow3.classList.add("complete");

        consoleRow1Status.textContent = finalState.row1;
        consoleRow2Status.textContent = finalState.row2;
        consoleRow3Status.textContent = finalState.row3;

        consoleRing.classList.add("ring-complete", "ring-pulse");
        uatConsole.classList.add("console-finished");
        miniCards.forEach((card) => card.classList.add("card-finished"));
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function animateConsole(fromState, toState, duration = 1500, onComplete) {
        clearAnimationFrameIfNeeded();

        const startTime = performance.now();

        function frame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);

            const releaseHealth = Math.round(
                fromState.releaseHealth + (toState.releaseHealth - fromState.releaseHealth) * eased
            );
            const readiness = Math.round(
                fromState.readiness + (toState.readiness - fromState.readiness) * eased
            );
            const blockers = Math.round(
                fromState.blockers + (toState.blockers - fromState.blockers) * eased
            );
            const alignment = Math.round(
                fromState.alignment + (toState.alignment - fromState.alignment) * eased
            );

            releaseHealthValue.textContent = String(releaseHealth);
            readinessValue.textContent = String(readiness);
            criticalBlockersValue.textContent = String(blockers);
            miniBlockersValue.textContent = String(blockers);
            stakeholderAlignmentValue.textContent = String(alignment);

            setRingProgress(readiness);

            if (progress < 1) {
                currentAnimationFrame = requestAnimationFrame(frame);
            } else {
                currentAnimationFrame = null;
                if (typeof onComplete === "function") onComplete();
            }
        }

        currentAnimationFrame = requestAnimationFrame(frame);
    }

    function runForwardSequence() {
        clearSequenceTimeouts();

        consoleRow1.classList.add("complete");
        consoleRow1Status.textContent = "Done";

        const row2Timer = setTimeout(() => {
            consoleRow2.classList.add("complete");
            consoleRow2Status.textContent = "Done";
        }, 420);

        const row3Timer = setTimeout(() => {
            consoleRow3.classList.add("complete");
            consoleRow3Status.textContent = "Done";
        }, 860);

        const finishTimer = setTimeout(() => {
            consoleRing.classList.add("ring-complete", "ring-pulse");
            uatConsole.classList.add("console-finished");
            miniCards.forEach((card) => card.classList.add("card-finished"));
        }, 1100);

        sequenceTimeouts.push(row2Timer, row3Timer, finishTimer);
    }

    function runReverseSequence() {
        clearSequenceTimeouts();

        consoleRing.classList.remove("ring-pulse", "ring-complete");
        uatConsole.classList.remove("console-finished");
        miniCards.forEach((card) => card.classList.remove("card-finished"));

        consoleRow2.classList.remove("complete");
        consoleRow3.classList.remove("complete");

        consoleRow2Status.textContent = "Live";
        consoleRow3Status.textContent = "Queued";
    }

    function animateForward() {
        if (reduceMotion) {
            applyFinalUIState();
            hasAnimatedOnce = true;
            return;
        }

        if (isAnimatingForward || hasAnimatedOnce) return;

        isAnimatingForward = true;
        isAnimatingReverse = false;

        animateConsole(initialState, finalState, 1500, () => {
            runForwardSequence();
            isAnimatingForward = false;
            hasAnimatedOnce = true;
        });
    }

    function animateReverse() {
        if (reduceMotion) {
            applyInitialUIState();
            hasAnimatedOnce = false;
            return;
        }

        if (isAnimatingReverse) return;

        isAnimatingReverse = true;
        isAnimatingForward = false;

        runReverseSequence();

        animateConsole(finalState, initialState, 950, () => {
            applyInitialUIState();
            isAnimatingReverse = false;
            hasAnimatedOnce = false;
        });
    }

    applyInitialUIState();

    window.addEventListener(
        "scroll",
        () => {
            if (window.scrollY > 40) {
                hasUserScrolled = true;
            }
        },
        { passive: true }
    );

    const consoleObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const mostlyVisible = entry.intersectionRatio >= 0.68;
                const mostlyHidden = entry.intersectionRatio <= 0.12;

                if (mostlyVisible && hasUserScrolled) {
                    animateForward();
                } else if (mostlyHidden && hasAnimatedOnce) {
                    animateReverse();
                }
            });
        },
        { threshold: [0, 0.12, 0.24, 0.4, 0.68, 0.85, 1] }
    );

    consoleObserver.observe(uatConsole);
});

const form = document.getElementById("contactForm");
const status = document.getElementById("formMessage");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = new FormData(form);

        const normalizedEntries = [];
        for (const [key, value] of data.entries()) {
            normalizedEntries.push([
                String(key).trim(),
                String(value ?? "").trim()
            ]);
        }

        const leadData = {};
        normalizedEntries.forEach(([key, value]) => {
            leadData[key] = value;
        });

        try {
            const { collection, addDoc, serverTimestamp } = window.firebaseFns;
            const db = window.db;

            await addDoc(collection(db, "leads"), {
                ...leadData,
                createdAt: serverTimestamp()
            });

            status.textContent = "Submitted successfully.";
            form.reset();

        } catch (err) {
            console.error("Submit error:", err);
            status.textContent = "Something went wrong. Please try again.";
        }
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
