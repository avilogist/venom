function venomCookieChoice() {
    const match =
        document.cookie
            .split("; ")
            .find(
                item =>
                    item.startsWith(
                        "venom_cookie_choice="
                    )
            );

    if (
        !match
    ) {
        return null;
    }

    return decodeURIComponent(
        match.split("=")[1] ||
        ""
    );
}

function venomRememberLogin() {
    return venomCookieChoice() ===
        "allow";
}

function venomSetCookieChoice(
    value
) {
    document.cookie =
        `venom_cookie_choice=${encodeURIComponent(
            value
        )}; Path=/; Max-Age=15552000; SameSite=Lax`;

    window.dispatchEvent(
        new CustomEvent(
            "venom-cookie-choice",
            {
                detail: {
                    value
                }
            }
        )
    );
}

function venomCookieBanner() {
    if (
        venomCookieChoice()
    ) {
        return;
    }

    const wrap =
        document.createElement(
            "div"
        );

    wrap.className =
        "venom-cookie-banner";

    wrap.innerHTML = `
        <div class="venom-cookie-inner">
            <div class="venom-cookie-copy">
                <div class="venom-cookie-title">
                    Cookies
                </div>

                <div class="venom-cookie-text">
                    Venom uses an essential authentication cookie when you sign in.
                    Allowing cookies keeps you signed in for up to 30 days.
                    Choosing essential only keeps login limited to the browser session.
                    We do not use advertising cookies.
                </div>

                <a
                    class="venom-cookie-link"
                    href="cookies.html"
                >
                    Cookie Policy
                </a>
            </div>

            <div class="venom-cookie-actions">
                <button
                    class="venom-cookie-btn venom-cookie-essential"
                    id="venomCookieEssential"
                    type="button"
                >
                    Essential only
                </button>

                <button
                    class="venom-cookie-btn venom-cookie-allow"
                    id="venomCookieAllow"
                    type="button"
                >
                    Allow cookies
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(
        wrap
    );

    document
        .querySelector(
            "#venomCookieEssential"
        )
        ?.addEventListener(
            "click",
            () => {
                venomSetCookieChoice(
                    "essential"
                );

                wrap.remove();
            }
        );

    document
        .querySelector(
            "#venomCookieAllow"
        )
        ?.addEventListener(
            "click",
            () => {
                venomSetCookieChoice(
                    "allow"
                );

                wrap.remove();
            }
        );
}

function venomCookieStyles() {
    if (
        document.querySelector(
            "#venomCookieStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "venomCookieStyles";

    style.textContent = `
        .venom-cookie-banner {
            position: fixed;
            left: 16px;
            right: 16px;
            bottom: 16px;
            z-index: 9998;
            display: flex;
            justify-content: center;
            pointer-events: none;
        }

        .venom-cookie-inner {
            width: min(760px, 100%);
            padding: 15px;
            border: 1px solid #272727;
            border-radius: 13px;
            background:
                radial-gradient(
                    circle at 8% 0%,
                    rgba(255,255,255,.055),
                    transparent 34%
                ),
                rgba(11,11,11,.97);
            box-shadow:
                0 18px 60px rgba(0,0,0,.55);
            backdrop-filter: blur(18px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            pointer-events: auto;
        }

        .venom-cookie-copy {
            min-width: 0;
        }

        .venom-cookie-title {
            color: #ddd;
            font-size: 12px;
            font-weight: 600;
        }

        .venom-cookie-text {
            margin-top: 5px;
            max-width: 510px;
            color: #777;
            font-size: 9px;
            line-height: 1.55;
        }

        .venom-cookie-link {
            display: inline-block;
            margin-top: 6px;
            color: #b94a4a;
            font-size: 9px;
            text-decoration: none;
        }

        .venom-cookie-actions {
            display: flex;
            gap: 9px;
            flex: 0 0 auto;
        }

        .venom-cookie-btn {
            min-height: 39px;
            padding: 0 13px;
            border-radius: 8px;
            font: 600 10px Inter, system-ui, sans-serif;
            cursor: pointer;
        }

        .venom-cookie-essential {
            color: #aaa;
            border: 1px solid #2b2b2b;
            background: #151515;
            box-shadow: 0 3px 0 #2c2c2c;
        }

        .venom-cookie-allow {
            color: #fff;
            border: 1px solid #bb2626;
            background:
                linear-gradient(
                    145deg,
                    #ef4949,
                    #d62c2c 56%,
                    #b71f1f
                );
            box-shadow: 0 3px 0 #e27676;
        }

        .venom-cookie-btn:active {
            transform: translateY(2px);
        }

        @media (max-width: 620px) {
            .venom-cookie-inner {
                align-items: stretch;
                flex-direction: column;
            }

            .venom-cookie-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
            }
        }
    `;

    document.head.appendChild(
        style
    );
}

venomCookieStyles();

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        venomCookieBanner
    );
} else {
    venomCookieBanner();
}