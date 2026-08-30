const api =
    "https://ancient-thunder-8889.cometv2.workers.dev";

const turnstileSiteKey =
    "0x4AAAAAAEiK5VJqSjxtckxE";

const authTokenKey =
    "venom_auth_token";

const form =
    document.querySelector(
        "#authForm"
    );

const fields =
    document.querySelector(
        "#fields"
    );

const title =
    document.querySelector(
        "#authTitle"
    );

const text =
    document.querySelector(
        "#authText"
    );

const submitBtn =
    document.querySelector(
        "#submitBtn"
    );

const authMsg =
    document.querySelector(
        "#authMsg"
    );

let captcha =
    document.querySelector(
        "#captcha"
    );

const googleAuth =
    document.querySelector(
        "#googleAuth"
    );

const discordAuth =
    document.querySelector(
        "#discordAuth"
    );

const googleText =
    document.querySelector(
        "#googleText"
    );

const discordText =
    document.querySelector(
        "#discordText"
    );

const tabs = [
    ...document.querySelectorAll(
        ".authtab"
    )
];

let mode =
    new URLSearchParams(
        location.search
    ).get(
        "mode"
    ) ===
    "signup"
        ? "signup"
        : "login";

let sessionToken =
    "";

let captchaChallenge =
    "";

let captchaVerified =
    false;

let captchaBusy =
    false;

let turnstileToken =
    "";

let turnstileWidgetId =
    null;

let turnstileLoadPromise =
    null;

let usernameAvailable =
    null;

let usernameCheckedValue =
    "";

let usernameCheckSequence =
    0;

let submitting =
    false;

let emailChallenge =
    "";

let emailVerificationToken =
    "";

let pendingAuthentication =
    null;

let verificationPurpose =
    "";

let pointerSamples =
    [];

let pointerDistance =
    0;

let directionChanges =
    0;

let previousPointer =
    null;

let previousDirection =
    null;

let typingTimes =
    [];

let lastTypingTime =
    0;

let visibilityChanges =
    0;

let focusChanges =
    0;

installAuthStyles();

function installAuthStyles() {
    if (
        document.querySelector(
            "#venomAuthRuntimeStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "venomAuthRuntimeStyles";

    style.textContent = `
        #captcha {
            width: 100% !important;
            min-height: 56px !important;
            margin-top: 17px !important;
            padding: 0 14px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            gap: 12px !important;
            border: 1px solid #202020 !important;
            border-radius: 9px !important;
            background:
                radial-gradient(
                    circle at 12% 4%,
                    rgba(255,255,255,.035),
                    transparent 27%
                ),
                #0b0b0b !important;
            color: #d0d0d0 !important;
            text-align: left !important;
            cursor: pointer !important;
            box-shadow:
                inset 1px 1px 0 rgba(255,255,255,.025),
                0 2px 7px rgba(0,0,0,.16) !important;
            transition:
                border-color .15s,
                background .15s !important;
        }

        #captcha:hover:not(:disabled) {
            background: #0f0f0f !important;
            border-color: #292929 !important;
        }

        #captcha:disabled {
            cursor: default !important;
            opacity: .7;
        }

        #captcha .venomCaptchaBox {
            width: 21px;
            height: 21px;
            min-width: 21px;
            display: grid;
            place-items: center;
            border: 1px solid #424242;
            border-radius: 4px;
            background: #080808;
            box-shadow:
                inset 1px 1px 0 rgba(255,255,255,.025);
            transition:
                background .15s,
                border-color .15s,
                transform .15s;
        }

        #captcha .venomCaptchaBox svg {
            width: 14px;
            height: 14px;
            stroke: #fff;
            stroke-width: 3;
            opacity: 0;
            transform: scale(.55);
            transition:
                opacity .15s,
                transform .15s;
        }

        #captcha.verified .venomCaptchaBox {
            border-color: #5a5a5a;
            background: #171717;
        }

        #captcha.verified .venomCaptchaBox svg {
            opacity: 1;
            transform: scale(1);
        }

        #captcha .venomCaptchaCopy {
            display: flex;
            flex-direction: column;
            min-width: 0;
            gap: 3px;
        }

        #captcha .captchaTitle {
            color: #c9c9c9 !important;
            font-size: 11px !important;
            font-weight: 600 !important;
        }

        #captcha .captchaSub {
            color: #5f5f5f !important;
            font-size: 9px !important;
            line-height: 1.4 !important;
        }

        .venomCodeOverlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: grid;
            place-items: center;
            padding: 18px;
            background: rgba(0,0,0,.72);
            backdrop-filter: blur(8px);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition:
                opacity .18s,
                visibility .18s;
        }

        .venomCodeOverlay.on {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

        .venomCodeModal {
            width: min(390px, 100%);
            border: 1px solid #202020;
            border-radius: 14px;
            background:
                radial-gradient(
                    circle at 12% 0%,
                    rgba(255,255,255,.04),
                    transparent 34%
                ),
                #0b0b0b;
            box-shadow:
                0 28px 80px rgba(0,0,0,.62),
                inset 1px 1px 0 rgba(255,255,255,.025);
            overflow: hidden;
        }

        .venomCodeHead {
            padding: 22px 22px 15px;
        }

        .venomCodeTitle {
            color: #f0f0f0;
            font-size: 16px;
            font-weight: 700;
        }

        .venomCodeText {
            margin-top: 7px;
            color: #6d6d6d;
            font-size: 11px;
            line-height: 1.55;
        }

        .venomCodeEmail {
            color: #a0a0a0;
        }

        .venomCodeBody {
            padding: 0 22px 22px;
        }

        .venomCodeInput {
            width: 100%;
            height: 50px;
            padding: 0 14px;
            border: 1px solid #252525;
            border-radius: 9px;
            outline: 0;
            background: #080808;
            color: #f1f1f1;
            font-family:
                ui-monospace,
                SFMono-Regular,
                Menlo,
                Consolas,
                monospace;
            font-size: 20px;
            font-weight: 600;
            letter-spacing: .34em;
            text-align: center;
            caret-color: #d72b2b;
            transition:
                border-color .16s,
                box-shadow .16s;
        }

        .venomCodeInput:focus {
            border-color: #4b2525;
            box-shadow: 0 0 0 3px rgba(215,43,43,.06);
        }

        .venomCodeInput.invalid {
            border-color: #742d2d;
        }

        .venomCodeMessage {
            min-height: 16px;
            margin-top: 9px;
            color: #bb5e5e;
            font-size: 10px;
            text-align: center;
        }

        .venomCodeActions {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
            margin-top: 8px;
        }

        .venomCodeVerify,
        .venomCodeCancel {
            height: 40px;
            border-radius: 9px;
            font: inherit;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
        }

        .venomCodeVerify {
            border: 1px solid #c52727;
            color: #fff;
            background:
                radial-gradient(
                    circle at 13% 5%,
                    rgba(255,255,255,.26),
                    transparent 28%
                ),
                linear-gradient(
                    145deg,
                    #e94747,
                    #cf2929 55%,
                    #af2020
                );
            box-shadow:
                0 3px 0 #a94747,
                inset 1px 1px 0 rgba(255,255,255,.16);
        }

        .venomCodeCancel {
            padding: 0 14px;
            border: 1px solid #272727;
            color: #8d8d8d;
            background: #111;
        }

        .venomCodeVerify:disabled,
        .venomCodeCancel:disabled {
            opacity: .5;
            cursor: default;
        }
    `;

    document.head.appendChild(
        style
    );

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "emailCodeOverlay";

    overlay.className =
        "venomCodeOverlay";

    overlay.innerHTML = `
        <div
            class="venomCodeModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emailCodeTitle"
        >
            <div class="venomCodeHead">
                <div
                    class="venomCodeTitle"
                    id="emailCodeTitle"
                >
                    Check your email
                </div>

                <div
                    class="venomCodeText"
                    id="emailCodeText"
                >
                    We sent a 6-digit verification code.
                </div>
            </div>

            <div class="venomCodeBody">
                <input
                    class="venomCodeInput"
                    id="emailCodeInput"
                    type="text"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    maxlength="6"
                    placeholder="000000"
                    aria-label="Verification code"
                >

                <div
                    class="venomCodeMessage"
                    id="emailCodeMessage"
                ></div>

                <div class="venomCodeActions">
                    <button
                        class="venomCodeVerify"
                        id="emailCodeVerify"
                        type="button"
                    >
                        Verify
                    </button>

                    <button
                        class="venomCodeCancel"
                        id="emailCodeCancel"
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(
        overlay
    );

    document.querySelector(
        "#emailCodeInput"
    )?.addEventListener(
        "input",
        event => {
            event.target.value =
                event.target.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        6
                    );

            event.target.classList.remove(
                "invalid"
            );

            setCodeMessage(
                ""
            );
        }
    );

    document.querySelector(
        "#emailCodeInput"
    )?.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Enter"
            ) {
                event.preventDefault();

                verifyCurrentEmailCode();
            }

            if (
                event.key ===
                "Escape"
            ) {
                event.preventDefault();

                closeEmailCodeModal();
            }
        }
    );

    document.querySelector(
        "#emailCodeVerify"
    )?.addEventListener(
        "click",
        verifyCurrentEmailCode
    );

    document.querySelector(
        "#emailCodeCancel"
    )?.addEventListener(
        "click",
        closeEmailCodeModal
    );
}

function openEmailCodeModal(
    email
) {
    const overlay =
        document.querySelector(
            "#emailCodeOverlay"
        );

    const textElement =
        document.querySelector(
            "#emailCodeText"
        );

    const input =
        document.querySelector(
            "#emailCodeInput"
        );

    if (
        textElement
    ) {
        textElement.innerHTML =
            `We sent a 6-digit code to <span class="venomCodeEmail">${escapeHtml(
                email
            )}</span>.`;
    }

    if (
        input
    ) {
        input.value =
            "";

        input.classList.remove(
            "invalid"
        );
    }

    setCodeMessage(
        ""
    );

    overlay?.classList.add(
        "on"
    );

    setTimeout(
        () =>
            input?.focus(),
        50
    );
}

function closeEmailCodeModal() {
    if (
        submitting
    ) {
        return;
    }

    document.querySelector(
        "#emailCodeOverlay"
    )?.classList.remove(
        "on"
    );

    emailChallenge =
        "";

    emailVerificationToken =
        "";

    pendingAuthentication =
        null;

    verificationPurpose =
        "";

    setSubmitBusy(
        false
    );
}

function setCodeMessage(
    message
) {
    const element =
        document.querySelector(
            "#emailCodeMessage"
        );

    if (
        element
    ) {
        element.textContent =
            message ||
            "";
    }
}

function setCodeBusy(
    busy
) {
    const verify =
        document.querySelector(
            "#emailCodeVerify"
        );

    const cancel =
        document.querySelector(
            "#emailCodeCancel"
        );

    const input =
        document.querySelector(
            "#emailCodeInput"
        );

    if (
        verify
    ) {
        verify.disabled =
            busy;

        verify.textContent =
            busy
                ? "Checking..."
                : "Verify";
    }

    if (
        cancel
    ) {
        cancel.disabled =
            busy;
    }

    if (
        input
    ) {
        input.disabled =
            busy;
    }
}

function cleanUsername(
    value
) {
    return String(
        value ||
        ""
    )
        .toLowerCase()
        .replace(
            /[^a-z0-9_]/g,
            ""
        )
        .slice(
            0,
            32
        );
}

function validUsername(
    value
) {
    return /^[a-z0-9_]{3,32}$/.test(
        value
    );
}

function validEmail(
    value
) {
    const email =
        String(
            value ||
            ""
        )
            .trim()
            .toLowerCase();

    return (
        email.length >=
            5 &&
        email.length <=
            254 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    );
}

const commonWeakPasswords =
    new Set([
        "password",
        "password1",
        "password123",
        "12345678",
        "123456789",
        "1234567890",
        "qwerty123",
        "qwertyuiop",
        "letmein123",
        "welcome123",
        "admin123",
        "iloveyou",
        "football",
        "monkey123",
        "dragon123",
        "venom123",
        "venom1234"
    ]);

function passwordStrength(
    passwordValue,
    usernameValue =
        "",
    emailValue =
        ""
) {
    const password =
        String(
            passwordValue ||
            ""
        );

    if (
        password.length <
        10
    ) {
        return {
            ok:
                false,

            message:
                "Use at least 10 characters."
        };
    }

    if (
        password.length >
        256
    ) {
        return {
            ok:
                false,

            message:
                "Password is too long."
        };
    }

    const lowered =
        password.toLowerCase();

    if (
        commonWeakPasswords.has(
            lowered
        )
    ) {
        return {
            ok:
                false,

            message:
                "That password is too common."
        };
    }

    let classes =
        0;

    if (
        /[a-z]/.test(
            password
        )
    ) {
        classes++;
    }

    if (
        /[A-Z]/.test(
            password
        )
    ) {
        classes++;
    }

    if (
        /\d/.test(
            password
        )
    ) {
        classes++;
    }

    if (
        /[^A-Za-z0-9]/.test(
            password
        )
    ) {
        classes++;
    }

    if (
        classes <
        3
    ) {
        return {
            ok:
                false,

            message:
                "Use at least three of: lowercase, uppercase, number, symbol."
        };
    }

    if (
        /(.)\1{3,}/.test(
            password
        )
    ) {
        return {
            ok:
                false,

            message:
                "Avoid repeating the same character four times."
        };
    }

    const username =
        cleanUsername(
            usernameValue
        );

    if (
        username.length >=
            3 &&
        lowered.includes(
            username
        )
    ) {
        return {
            ok:
                false,

            message:
                "Do not include your username in your password."
        };
    }

    const emailName =
        String(
            emailValue ||
            ""
        )
            .toLowerCase()
            .split(
                "@"
            )[0]
            .replace(
                /[^a-z0-9]/g,
                ""
            );

    if (
        emailName.length >=
            4 &&
        lowered.includes(
            emailName
        )
    ) {
        return {
            ok:
                false,

            message:
                "Do not include your email name in your password."
        };
    }

    return {
        ok:
            true,

        message:
            "Strong password."
    };
}

function passwordField(
    id,
    label,
    autocomplete
) {
    return `
        <div class="field">
            <label for="${id}">
                ${label}
            </label>

            <div class="passwordWrap">
                <input
                    id="${id}"
                    type="password"
                    maxlength="256"
                    autocomplete="${autocomplete}"
                >

                <button
                    class="passwordToggle"
                    type="button"
                    data-password-toggle="${id}"
                    aria-label="Show password"
                >
                    <i data-lucide="eye"></i>
                </button>
            </div>

            <div
                class="fieldHint"
                id="${id}Hint"
            ></div>
        </div>
    `;
}

function loginFields() {
    return `
        <div class="field">
            <label for="identity">
                Email or username
            </label>

            <input
                id="identity"
                type="text"
                maxlength="254"
                autocomplete="username"
                spellcheck="false"
            >

            <div
                class="fieldHint"
                id="identityHint"
            ></div>
        </div>

        ${passwordField(
            "password",
            "Password",
            "current-password"
        )}
    `;
}

function signupFields() {
    return `
        <div class="field">
            <label for="email">
                Email
            </label>

            <input
                id="email"
                type="email"
                maxlength="254"
                autocomplete="email"
                placeholder="x@x.x"
            >

            <div
                class="fieldHint"
                id="emailHint"
            ></div>
        </div>

        <div class="field">
            <label for="username">
                Username
            </label>

            <input
                id="username"
                type="text"
                minlength="3"
                maxlength="32"
                autocomplete="username"
                autocapitalize="none"
                spellcheck="false"
                pattern="[a-z0-9_]+"
            >

            <div
                class="fieldHint"
                id="usernameHint"
            >
                Only a-z, 0-9 and _
            </div>
        </div>

        ${passwordField(
            "password",
            "Password",
            "new-password"
        )}

        ${passwordField(
            "passwordVerify",
            "Verify password",
            "new-password"
        )}

        <div class="legalChecks">
            <label class="legalCheck">
                <input
                    id="acceptTerms"
                    type="checkbox"
                >

                <span>
                    I have read and agree to the

                    <a
                        href="terms.html"
                        target="_blank"
                        rel="noopener"
                    >
                        Terms of Service
                    </a>.
                </span>
            </label>

            <label class="legalCheck">
                <input
                    id="acceptPrivacy"
                    type="checkbox"
                >

                <span>
                    I have read and agree to the

                    <a
                        href="privacy.html"
                        target="_blank"
                        rel="noopener"
                    >
                        Privacy Policy
                    </a>.
                </span>
            </label>

            <label class="legalCheck">
                <input
                    id="age18"
                    type="checkbox"
                >

                <span>
                    I confirm that I am at least 18 years old.
                </span>
            </label>
        </div>
    `;
}

function render() {
    usernameAvailable =
        null;

    usernameCheckedValue =
        "";

    usernameCheckSequence++;

    pendingAuthentication =
        null;

    emailChallenge =
        "";

    emailVerificationToken =
        "";

    verificationPurpose =
        "";

    setMessage(
        ""
    );

    tabs.forEach(
        tab => {
            tab.classList.toggle(
                "on",
                tab.dataset.mode ===
                mode
            );
        }
    );

    if (
        mode ===
        "signup"
    ) {
        title.textContent =
            "Create account";

        text.textContent =
            "Create your Venom account.";

        fields.innerHTML =
            signupFields();

        submitBtn.innerHTML = `
            <i data-lucide="user-plus"></i>

            <span>
                Sign up
            </span>
        `;
    } else {
        title.textContent =
            "Login";

        text.textContent =
            "Enter your details to continue.";

        fields.innerHTML =
            loginFields();

        submitBtn.innerHTML = `
            <i data-lucide="log-in"></i>

            <span>
                Login
            </span>
        `;
    }

    googleText.textContent =
        "Continue with Google";

    discordText.textContent =
        "Continue with Discord";

    bindFields();

    renderCaptcha();

    updateSubmitState();

    refreshIcons();
}

function bindFields() {
    document.querySelectorAll(
        "[data-password-toggle]"
    ).forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    const input =
                        document.querySelector(
                            `#${button.dataset.passwordToggle}`
                        );

                    if (
                        !input
                    ) {
                        return;
                    }

                    const hidden =
                        input.type ===
                        "password";

                    input.type =
                        hidden
                            ? "text"
                            : "password";

                    button.innerHTML =
                        hidden
                            ? '<i data-lucide="eye-off"></i>'
                            : '<i data-lucide="eye"></i>';

                    refreshIcons();
                }
            );
        }
    );

    const email =
        document.querySelector(
            "#email"
        );

    const username =
        document.querySelector(
            "#username"
        );

    const password =
        document.querySelector(
            "#password"
        );

    const confirmation =
        document.querySelector(
            "#passwordVerify"
        );

    const identity =
        document.querySelector(
            "#identity"
        );

    email?.addEventListener(
        "input",
        () => {
            const value =
                email.value
                    .trim()
                    .toLowerCase();

            if (
                !value
            ) {
                setFieldHint(
                    "emailHint",
                    ""
                );

                return;
            }

            setFieldHint(
                "emailHint",
                validEmail(
                    value
                )
                    ? ""
                    : "Use an email in the form x@x.x.",
                validEmail(
                    value
                )
                    ? ""
                    : "bad"
            );
        }
    );

    username?.addEventListener(
        "input",
        () => {
            username.value =
                cleanUsername(
                    username.value
                );

            usernameAvailable =
                null;

            usernameCheckedValue =
                "";

            usernameCheckSequence++;

            if (
                username.value &&
                username.value.length <
                3
            ) {
                setFieldHint(
                    "usernameHint",
                    "Username must be at least 3 characters.",
                    "bad"
                );
            } else {
                setFieldHint(
                    "usernameHint",
                    ""
                );
            }
        }
    );

    username?.addEventListener(
        "blur",
        () => {
            checkUsernameAvailability();
        }
    );

    password?.addEventListener(
        "input",
        () => {
            validatePassword();

            validatePasswordMatch();
        }
    );

    confirmation?.addEventListener(
        "input",
        validatePasswordMatch
    );

    identity?.addEventListener(
        "input",
        () => {
            setFieldHint(
                "identityHint",
                ""
            );
        }
    );

    document.querySelectorAll(
        "#acceptTerms, #acceptPrivacy, #age18"
    ).forEach(
        checkbox => {
            checkbox.addEventListener(
                "change",
                updateSubmitState
            );
        }
    );

    document.querySelectorAll(
        "#fields input"
    ).forEach(
        input => {
            input.addEventListener(
                "keydown",
                trackTyping
            );
        }
    );
}

function validatePassword() {
    if (
        mode !==
        "signup"
    ) {
        return true;
    }

    const password =
        document.querySelector(
            "#password"
        );

    const username =
        document.querySelector(
            "#username"
        );

    const email =
        document.querySelector(
            "#email"
        );

    if (
        !password?.value
    ) {
        setFieldHint(
            "passwordHint",
            ""
        );

        return false;
    }

    const result =
        passwordStrength(
            password.value,
            username?.value ||
                "",
            email?.value ||
                ""
        );

    setFieldHint(
        "passwordHint",
        result.message,
        result.ok
            ? "good"
            : "bad"
    );

    return result.ok;
}

function validatePasswordMatch() {
    if (
        mode !==
        "signup"
    ) {
        return true;
    }

    const password =
        document.querySelector(
            "#password"
        );

    const confirmation =
        document.querySelector(
            "#passwordVerify"
        );

    if (
        !confirmation?.value
    ) {
        setFieldHint(
            "passwordVerifyHint",
            ""
        );

        return false;
    }

    if (
        password?.value !==
        confirmation.value
    ) {
        setFieldHint(
            "passwordVerifyHint",
            "Passwords do not match.",
            "bad"
        );

        return false;
    }

    setFieldHint(
        "passwordVerifyHint",
        "Passwords match.",
        "good"
    );

    return true;
}

async function checkUsernameAvailability() {
    const input =
        document.querySelector(
            "#username"
        );

    if (
        !input
    ) {
        return false;
    }

    const username =
        cleanUsername(
            input.value
        );

    input.value =
        username;

    if (
        !validUsername(
            username
        )
    ) {
        usernameAvailable =
            false;

        setFieldHint(
            "usernameHint",
            "Username must be 3-32 characters using a-z, 0-9 or _.",
            "bad"
        );

        return false;
    }

    if (
        usernameCheckedValue ===
            username &&
        usernameAvailable !==
            null
    ) {
        return usernameAvailable;
    }

    const sequence =
        ++usernameCheckSequence;

    setFieldHint(
        "usernameHint",
        "Checking availability..."
    );

    try {
        const response =
            await fetch(
                `${api}/auth/check-username`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    cache:
                        "no-store",

                    body:
                        JSON.stringify({
                            username
                        })
                }
            );

        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );

        if (
            sequence !==
            usernameCheckSequence
        ) {
            return false;
        }

        usernameCheckedValue =
            username;

        usernameAvailable =
            response.ok &&
            data.valid ===
                true &&
            data.available ===
                true;

        if (
            usernameAvailable
        ) {
            setFieldHint(
                "usernameHint",
                "Username is available.",
                "good"
            );

            return true;
        }

        setFieldHint(
            "usernameHint",
            data.reason ===
                "username_not_allowed"
                ? "That username is not allowed."
                : "That username is unavailable.",
            "bad"
        );

        return false;
    } catch {
        usernameAvailable =
            null;

        setFieldHint(
            "usernameHint",
            "Could not check username.",
            "bad"
        );

        return false;
    }
}

function legalAccepted() {
    if (
        mode !==
        "signup"
    ) {
        return true;
    }

    return Boolean(
        document.querySelector(
            "#acceptTerms"
        )?.checked &&
        document.querySelector(
            "#acceptPrivacy"
        )?.checked &&
        document.querySelector(
            "#age18"
        )?.checked
    );
}

function setMessage(
    message,
    good = false
) {
    if (
        !authMsg
    ) {
        return;
    }

    authMsg.textContent =
        message ||
        "";

    authMsg.style.color =
        good
            ? "#6d9a77"
            : "#d85c5c";
}

function setFieldHint(
    id,
    message,
    state = ""
) {
    const element =
        document.querySelector(
            `#${id}`
        );

    if (
        !element
    ) {
        return;
    }

    element.textContent =
        message ||
        "";

    element.className =
        `fieldHint ${state}`.trim();
}

function setSubmitBusy(
    busy
) {
    submitting =
        busy;

    updateSubmitState();

    if (
        !submitBtn
    ) {
        return;
    }

    if (
        busy
    ) {
        submitBtn.style.opacity =
            ".65";
    } else {
        submitBtn.style.opacity =
            "";
    }
}

function updateSubmitState() {
    if (
        !submitBtn
    ) {
        return;
    }

    submitBtn.disabled =
        submitting ||
        (
            mode ===
                "signup" &&
            !legalAccepted()
        );
}

function renderCaptcha(
    message =
        ""
) {
    if (
        !captcha
    ) {
        return;
    }

    captcha.classList.toggle(
        "verified",
        captchaVerified
    );

    if (
        turnstileWidgetId !==
        null
    ) {
        return;
    }

    captcha.innerHTML = `
        <div
            id="turnstileWidget"
            style="
                width: 100%;
                min-height: 65px;
                display: flex;
                align-items: center;
                justify-content: center;
            "
        ></div>

        <div
            id="turnstileStatus"
            style="
                margin-top: 7px;
                color: #6c6c6c;
                font-size: 9px;
                text-align: center;
            "
        >${escapeHtml(
            message ||
            "Complete the security check to continue."
        )}</div>
    `;
}

async function createSecureSession() {
    const pair =
        await crypto.subtle
            .generateKey(
                {
                    name:
                        "RSA-OAEP",

                    modulusLength:
                        2048,

                    publicExponent:
                        new Uint8Array([
                            1,
                            0,
                            1
                        ]),

                    hash:
                        "SHA-256"
                },
                true,
                [
                    "encrypt",
                    "decrypt"
                ]
            );

    const publicKey =
        await crypto.subtle
            .exportKey(
                "jwk",
                pair.publicKey
            );

    const response =
        await fetch(
            `${api}/session`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials:
                    "include",

                cache:
                    "no-store",

                body:
                    JSON.stringify({
                        publicKey,

                        client:
                            collectSessionClient()
                    })
            }
        );

    const data =
        await response
            .json()
            .catch(
                () => ({})
            );

    if (
        !response.ok ||
        !data.token
    ) {
        throw new Error(
            data.error ||
            "session_failed"
        );
    }

    const encrypted =
        base64UrlToBytes(
            data.token
        );

    const decrypted =
        await crypto.subtle
            .decrypt(
                {
                    name:
                        "RSA-OAEP"
                },
                pair.privateKey,
                encrypted
            );

    const payload =
        JSON.parse(
            new TextDecoder()
                .decode(
                    decrypted
                )
        );

    if (
        !payload.sid ||
        !payload.exp
    ) {
        throw new Error(
            "invalid_session_response"
        );
    }

    sessionToken =
        data.token;

    try {
        sessionStorage.setItem(
            "venom_session",
            sessionToken
        );
    } catch {}

    return sessionToken;
}

async function ensureSession() {
    if (
        sessionToken
    ) {
        return sessionToken;
    }

    try {
        const existing =
            sessionStorage.getItem(
                "venom_session"
            );

        if (
            existing
        ) {
            sessionToken =
                existing;

            return existing;
        }
    } catch {}

    return createSecureSession();
}

function collectSessionClient() {
    return {
        language:
            navigator.language ||
            "",

        platform:
            navigator.platform ||
            "",

        timezone:
            Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone ||
            "",

        screen: {
            width:
                Number(
                    screen.width ||
                    0
                ),

            height:
                Number(
                    screen.height ||
                    0
                ),

            colorDepth:
                Number(
                    screen.colorDepth ||
                    0
                )
        },

        viewport: {
            width:
                Number(
                    innerWidth ||
                    0
                ),

            height:
                Number(
                    innerHeight ||
                    0
                )
        }
    };
}

function collectPcInfo() {
    return {
        userAgent:
            navigator.userAgent ||
            "",

        platform:
            navigator.platform ||
            "",

        language:
            navigator.language ||
            "",

        languages:
            Array.isArray(
                navigator.languages
            )
                ? navigator.languages
                : [],

        timezone:
            Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone ||
            "",

        hardwareConcurrency:
            Number(
                navigator.hardwareConcurrency ||
                0
            ),

        deviceMemory:
            Number(
                navigator.deviceMemory ||
                0
            ),

        maxTouchPoints:
            Number(
                navigator.maxTouchPoints ||
                0
            ),

        cookieEnabled:
            navigator.cookieEnabled ===
            true,

        screen: {
            width:
                Number(
                    screen.width ||
                    0
                ),

            height:
                Number(
                    screen.height ||
                    0
                ),

            availWidth:
                Number(
                    screen.availWidth ||
                    0
                ),

            availHeight:
                Number(
                    screen.availHeight ||
                    0
                ),

            colorDepth:
                Number(
                    screen.colorDepth ||
                    0
                ),

            pixelDepth:
                Number(
                    screen.pixelDepth ||
                    0
                ),

            pixelRatio:
                Number(
                    devicePixelRatio ||
                    1
                )
        },

        viewport: {
            width:
                Number(
                    innerWidth ||
                    0
                ),

            height:
                Number(
                    innerHeight ||
                    0
                )
        }
    };
}

function base64UrlToBytes(
    value
) {
    const string =
        String(
            value ||
            ""
        );

    const padded =
        string
            .replace(
                /-/g,
                "+"
            )
            .replace(
                /_/g,
                "/"
            ) +
        "=".repeat(
            (
                4 -
                string.length %
                4
            ) %
            4
        );

    const raw =
        atob(
            padded
        );

    return Uint8Array.from(
        raw,
        character =>
            character.charCodeAt(
                0
            )
    );
}

function prepareTurnstileContainer() {
    if (
        !captcha
    ) {
        return;
    }

    if (
        captcha.tagName?.toLowerCase() ===
        "button"
    ) {
        const replacement =
            document.createElement(
                "div"
            );

        replacement.id =
            captcha.id;

        replacement.className =
            captcha.className;

        replacement.style.cursor =
            "default";

        replacement.style.height =
            "auto";

        replacement.style.minHeight =
            "86px";

        replacement.style.padding =
            "12px";

        replacement.style.display =
            "block";

        captcha.replaceWith(
            replacement
        );

        captcha =
            replacement;
    }
}

function loadTurnstileScript() {
    if (
        window.turnstile
    ) {
        return Promise.resolve();
    }

    if (
        turnstileLoadPromise
    ) {
        return turnstileLoadPromise;
    }

    turnstileLoadPromise =
        new Promise(
            (resolve, reject) => {
                const existing =
                    document.querySelector(
                        'script[data-venom-turnstile="1"]'
                    );

                if (
                    existing
                ) {
                    const wait =
                        setInterval(
                            () => {
                                if (
                                    window.turnstile
                                ) {
                                    clearInterval(
                                        wait
                                    );

                                    resolve();
                                }
                            },
                            50
                        );

                    setTimeout(
                        () => {
                            clearInterval(
                                wait
                            );

                            if (
                                window.turnstile
                            ) {
                                resolve();
                            } else {
                                reject(
                                    new Error(
                                        "Turnstile could not load."
                                    )
                                );
                            }
                        },
                        10000
                    );

                    return;
                }

                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

                script.async =
                    true;

                script.defer =
                    true;

                script.dataset.venomTurnstile =
                    "1";

                script.onload =
                    () => resolve();

                script.onerror =
                    () => reject(
                        new Error(
                            "Turnstile could not load."
                        )
                    );

                document.head.appendChild(
                    script
                );
            }
        );

    return turnstileLoadPromise;
}

async function renderTurnstile() {
    prepareTurnstileContainer();

    if (
        !captcha
    ) {
        throw new Error(
            "Turnstile container is missing."
        );
    }

    if (
        turnstileWidgetId !==
        null
    ) {
        return;
    }

    renderCaptcha();

    await loadTurnstileScript();

    const target =
        captcha.querySelector(
            "#turnstileWidget"
        );

    if (
        !target
    ) {
        throw new Error(
            "Turnstile container is missing."
        );
    }

    turnstileWidgetId =
        window.turnstile.render(
            target,
            {
                sitekey:
                    turnstileSiteKey,

                theme:
                    "dark",

                size:
                    "flexible",

                callback:
                    token => {
                        turnstileToken =
                            String(
                                token ||
                                ""
                            );

                        captchaVerified =
                            Boolean(
                                turnstileToken
                            );

                        const status =
                            captcha.querySelector(
                                "#turnstileStatus"
                            );

                        if (
                            status
                        ) {
                            status.textContent =
                                captchaVerified
                                    ? "Human verification complete."
                                    : "Complete the security check to continue.";
                        }
                    },

                "expired-callback":
                    () => {
                        turnstileToken =
                            "";

                        captchaVerified =
                            false;

                        const status =
                            captcha.querySelector(
                                "#turnstileStatus"
                            );

                        if (
                            status
                        ) {
                            status.textContent =
                                "Verification expired. Complete the check again.";
                        }
                    },

                "error-callback":
                    () => {
                        turnstileToken =
                            "";

                        captchaVerified =
                            false;

                        const status =
                            captcha.querySelector(
                                "#turnstileStatus"
                            );

                        if (
                            status
                        ) {
                            status.textContent =
                                "Verification failed to load. Try again.";
                        }
                    }
            }
        );
}

function resetTurnstile() {
    turnstileToken =
        "";

    captchaVerified =
        false;

    if (
        turnstileWidgetId !==
            null &&
        window.turnstile
    ) {
        try {
            window.turnstile.reset(
                turnstileWidgetId
            );
        } catch {}
    }
}

async function requireTurnstileToken() {
    await renderTurnstile();

    if (
        !turnstileToken
    ) {
        throw new Error(
            "Complete the human verification first."
        );
    }

    return turnstileToken;
}

async function startCaptcha() {
    await ensureSession();
    await renderTurnstile();
}

async function verifyCaptcha() {
    await renderTurnstile();

    if (
        turnstileToken
    ) {
        captchaVerified =
            true;

        return true;
    }

    throw new Error(
        "Complete the Turnstile check first."
    );
}

function captchaTelemetry() {
    return {
        webdriver:
            navigator.webdriver ===
            true,

        visibilityChanges,

        focusChanges,

        screenWidth:
            Number(
                screen.width ||
                0
            ),

        screenHeight:
            Number(
                screen.height ||
                0
            ),

        pointer: {
            samples:
                pointerSamples.length,

            distance:
                pointerDistance,

            speedVariance:
                pointerSpeedVariance(),

            directionChanges
        },

        typing: {
            samples:
                typingTimes.length,

            variance:
                typingVariance(),

            constantRatio:
                typingConstantRatio()
        }
    };
}

function pointerSpeedVariance() {
    if (
        pointerSamples.length <
        2
    ) {
        return 0;
    }

    const speeds =
        pointerSamples.map(
            item =>
                item.speed
        );

    const average =
        speeds.reduce(
            (
                total,
                value
            ) =>
                total +
                value,
            0
        ) /
        speeds.length;

    return speeds.reduce(
        (
            total,
            value
        ) =>
            total +
            (
                value -
                average
            ) ** 2,
        0
    ) /
    speeds.length;
}

function typingVariance() {
    if (
        typingTimes.length <
        2
    ) {
        return 0;
    }

    const average =
        typingTimes.reduce(
            (
                total,
                value
            ) =>
                total +
                value,
            0
        ) /
        typingTimes.length;

    return typingTimes.reduce(
        (
            total,
            value
        ) =>
            total +
            (
                value -
                average
            ) ** 2,
        0
    ) /
    typingTimes.length;
}

function typingConstantRatio() {
    if (
        typingTimes.length <
        2
    ) {
        return 0;
    }

    const values =
        typingTimes.map(
            value =>
                Math.round(
                    value /
                    10
                ) *
                10
        );

    const counts =
        new Map();

    let highest =
        0;

    for (
        const value
        of values
    ) {
        const amount =
            (
                counts.get(
                    value
                ) ||
                0
            ) +
            1;

        counts.set(
            value,
            amount
        );

        highest =
            Math.max(
                highest,
                amount
            );
    }

    return highest /
        values.length;
}

function trackTyping() {
    const now =
        performance.now();

    if (
        lastTypingTime >
        0
    ) {
        const difference =
            now -
            lastTypingTime;

        if (
            difference >
                0 &&
            difference <
                2000
        ) {
            typingTimes.push(
                difference
            );

            if (
                typingTimes.length >
                40
            ) {
                typingTimes.shift();
            }
        }
    }

    lastTypingTime =
        now;
}

function setupTelemetry() {
    addEventListener(
        "pointermove",
        event => {
            const now =
                performance.now();

            if (
                previousPointer
            ) {
                const dx =
                    event.clientX -
                    previousPointer.x;

                const dy =
                    event.clientY -
                    previousPointer.y;

                const dt =
                    Math.max(
                        1,
                        now -
                        previousPointer.time
                    );

                const distance =
                    Math.hypot(
                        dx,
                        dy
                    );

                pointerDistance +=
                    distance;

                const direction =
                    Math.atan2(
                        dy,
                        dx
                    );

                if (
                    previousDirection !==
                    null
                ) {
                    let difference =
                        Math.abs(
                            direction -
                            previousDirection
                        );

                    if (
                        difference >
                        Math.PI
                    ) {
                        difference =
                            Math.PI *
                            2 -
                            difference;
                    }

                    if (
                        difference >
                        .6
                    ) {
                        directionChanges++;
                    }
                }

                previousDirection =
                    direction;

                pointerSamples.push({
                    speed:
                        distance /
                        dt
                });

                if (
                    pointerSamples.length >
                    50
                ) {
                    pointerSamples.shift();
                }
            }

            previousPointer = {
                x:
                    event.clientX,

                y:
                    event.clientY,

                time:
                    now
            };
        },
        {
            passive:
                true
        }
    );

    document.addEventListener(
        "visibilitychange",
        () => {
            visibilityChanges++;
        }
    );

    addEventListener(
        "focus",
        () => {
            focusChanges++;
        }
    );

    addEventListener(
        "blur",
        () => {
            focusChanges++;
        }
    );
}

function rememberLogin() {
    if (
        typeof window.venomRememberLogin ===
        "function"
    ) {
        return window.venomRememberLogin();
    }

    return false;
}

function storeAuthToken(
    token,
    remember
) {
    try {
        sessionStorage.removeItem(
            authTokenKey
        );

        localStorage.removeItem(
            authTokenKey
        );

        if (
            !token
        ) {
            return;
        }

        if (
            remember
        ) {
            localStorage.setItem(
                authTokenKey,
                token
            );
        } else {
            sessionStorage.setItem(
                authTokenKey,
                token
            );
        }
    } catch {}
}

async function beginSignup() {
    const email =
        String(
            document.querySelector(
                "#email"
            )?.value ||
            ""
        )
            .trim()
            .toLowerCase();

    const username =
        cleanUsername(
            document.querySelector(
                "#username"
            )?.value ||
            ""
        );

    const password =
        String(
            document.querySelector(
                "#password"
            )?.value ||
            ""
        );

    const passwordVerify =
        String(
            document.querySelector(
                "#passwordVerify"
            )?.value ||
            ""
        );

    if (
        !validEmail(
            email
        )
    ) {
        throw new Error(
            "Enter an email in the form x@x.x."
        );
    }

    if (
        !validUsername(
            username
        )
    ) {
        throw new Error(
            "Enter a valid username."
        );
    }

    if (
        usernameCheckedValue !==
            username ||
        usernameAvailable !==
            true
    ) {
        const available =
            await checkUsernameAvailability();

        if (
            !available
        ) {
            throw new Error(
                "Choose an available username."
            );
        }
    }

    const strength =
        passwordStrength(
            password,
            username,
            email
        );

    if (
        !strength.ok
    ) {
        throw new Error(
            strength.message
        );
    }

    if (
        password !==
        passwordVerify
    ) {
        throw new Error(
            "Passwords do not match."
        );
    }

    if (
        !legalAccepted()
    ) {
        throw new Error(
            "Accept all signup confirmations."
        );
    }

    if (
        !captchaVerified
    ) {
        throw new Error(
            "Complete human verification first."
        );
    }

    await ensureSession();

    pendingAuthentication = {
        email,
        username,
        password,

        session:
            sessionToken,

        turnstileToken:
            turnstileToken,

        remember:
            rememberLogin(),

        pcInfo:
            collectPcInfo()
    };

    verificationPurpose =
        "signup";

    await requestEmailCode(
        email,
        "signup"
    );

    openEmailCodeModal(
        email
    );
}

async function beginLogin() {
    const identity =
        String(
            document.querySelector(
                "#identity"
            )?.value ||
            ""
        ).trim();

    const password =
        String(
            document.querySelector(
                "#password"
            )?.value ||
            ""
        );

    if (
        !identity ||
        !password
    ) {
        throw new Error(
            "Enter your email or username and password."
        );
    }

    if (
        !captchaVerified
    ) {
        throw new Error(
            "Complete human verification first."
        );
    }

    await ensureSession();

    if (
        !identity.includes(
            "@"
        )
    ) {
        await finishLogin({
            identity,
            password,

            session:
                sessionToken,

            turnstileToken:
                turnstileToken,

            remember:
                rememberLogin(),

            emailVerificationToken:
                ""
        });

        return;
    }

    const email =
        identity
            .toLowerCase();

    if (
        !validEmail(
            email
        )
    ) {
        throw new Error(
            "Enter an email in the form x@x.x."
        );
    }

    pendingAuthentication = {
        identity:
            email,

        password,

        session:
            sessionToken,

        remember:
            rememberLogin()
    };

    verificationPurpose =
        "login";

    await requestEmailCode(
        email,
        "login"
    );

    openEmailCodeModal(
        email
    );
}

async function requestEmailCode(
    email,
    purpose
) {
    const response =
        await fetch(
            `${api}/auth/email/send`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials:
                    "include",

                cache:
                    "no-store",

                body:
                    JSON.stringify({
                        email,
                        purpose,

                        session:
                            sessionToken,

                        turnstileToken
                    })
            }
        );

    const data =
        await response
            .json()
            .catch(
                () => ({})
            );

    if (
        response.status ===
            401 &&
        (
            data.error ===
                "invalid_session" ||
            data.error ===
                "session_required"
        )
    ) {
        try {
            sessionStorage.removeItem(
                "venom_session"
            );
        } catch {}

        sessionToken =
            "";

        await createSecureSession();

        return requestEmailCode(
            email,
            purpose
        );
    }

    if (
        !response.ok ||
        data.sent !==
            true
    ) {
        if (
            data.error ===
            "verification_rate_limited"
        ) {
            throw new Error(
                "Wait a moment before requesting another code."
            );
        }

        if (
            data.error ===
            "verification_email_failed"
        ) {
            throw new Error(
                "The verification email could not be sent."
            );
        }

        if (
            data.error ===
                "turnstile_required" ||
            data.error ===
                "turnstile_failed"
        ) {
            resetTurnstile();

            throw new Error(
                "Human verification expired. Complete the check again."
            );
        }

        throw new Error(
            data.error ||
            "Could not send verification email."
        );
    }

    if (
        !data.challenge
    ) {
        throw new Error(
            "Could not start email verification."
        );
    }

    emailChallenge =
        String(
            data.challenge
        );
}

async function verifyCurrentEmailCode() {
    if (
        submitting ||
        !pendingAuthentication ||
        !emailChallenge
    ) {
        return;
    }

    const input =
        document.querySelector(
            "#emailCodeInput"
        );

    const code =
        String(
            input?.value ||
            ""
        )
            .replace(
                /\D/g,
                ""
            );

    if (
        !/^\d{6}$/.test(
            code
        )
    ) {
        input?.classList.add(
            "invalid"
        );

        setCodeMessage(
            "Enter the 6-digit code."
        );

        return;
    }

    const email =
        verificationPurpose ===
        "signup"
            ? pendingAuthentication.email
            : pendingAuthentication.identity;

    setCodeBusy(
        true
    );

    submitting =
        true;

    try {
        const response =
            await fetch(
                `${api}/auth/email/verify`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    cache:
                        "no-store",

                    body:
                        JSON.stringify({
                            email,

                            purpose:
                                verificationPurpose,

                            challenge:
                                emailChallenge,

                            code,

                            session:
                                sessionToken
                        })
                }
            );

        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );

        if (
            !response.ok ||
            data.verified !==
                true ||
            !data.token
        ) {
            if (
                data.error ===
                "verification_expired"
            ) {
                throw new Error(
                    "That code expired. Submit the form again for a new code."
                );
            }

            if (
                data.error ===
                "too_many_verification_attempts"
            ) {
                throw new Error(
                    "Too many incorrect attempts. Submit the form again."
                );
            }

            if (
                data.error ===
                    "invalid_session" ||
                data.error ===
                    "session_required"
            ) {
                throw new Error(
                    "Your verification session expired. Submit the form again."
                );
            }

            throw new Error(
                "Incorrect verification code."
            );
        }

        emailVerificationToken =
            String(
                data.token
            );

        setCodeMessage(
            ""
        );

        if (
            verificationPurpose ===
            "signup"
        ) {
            await finishSignup();
        } else {
            await finishLogin({
                ...pendingAuthentication,

                emailVerificationToken
            });
        }
    } catch (
        err
    ) {
        submitting =
            false;

        setCodeBusy(
            false
        );

        input?.classList.add(
            "invalid"
        );

        setCodeMessage(
            err?.message ||
            "Verification failed."
        );
    }
}

async function finishSignup() {
    const pending =
        pendingAuthentication;

    if (
        !pending ||
        !emailVerificationToken
    ) {
        throw new Error(
            "Email verification is missing."
        );
    }

    setCodeMessage(
        "Creating account..."
    );

    const response =
        await fetch(
            `${api}/auth/signup`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials:
                    "include",

                cache:
                    "no-store",

                body:
                    JSON.stringify({
                        email:
                            pending.email,

                        username:
                            pending.username,

                        password:
                            pending.password,

                        session:
                            pending.session,

                        turnstileToken:
                            pending.turnstileToken ||
                            turnstileToken,

                        emailVerificationToken,

                        pcInfo:
                            pending.pcInfo,

                        acceptTerms:
                            true,

                        acceptPrivacy:
                            true,

                        age18:
                            true,

                        remember:
                            pending.remember
                    })
            }
        );

    const data =
        await response
            .json()
            .catch(
                () => ({})
            );

    if (
        !response.ok ||
        data.authenticated !==
            true
    ) {
        if (
            data.error ===
            "account_exists"
        ) {
            throw new Error(
                "That email or username is already in use."
            );
        }

        if (
            data.error ===
            "username_not_allowed"
        ) {
            throw new Error(
                "That username is not allowed."
            );
        }

        if (
            data.error ===
            "weak_password"
        ) {
            throw new Error(
                data.reason ||
                "Choose a stronger password."
            );
        }

        if (
            data.error ===
            "email_verification_required"
        ) {
            throw new Error(
                "Email verification expired. Submit the form again."
            );
        }

        if (
            data.error ===
                "captcha_required" ||
            data.error ===
                "turnstile_required" ||
            data.error ===
                "turnstile_failed"
        ) {
            resetTurnstile();

            throw new Error(
                "Human verification expired. Submit the form again."
            );
        }

        throw new Error(
            data.error ||
            "Account creation failed."
        );
    }

    storeAuthToken(
        data.token,
        data.remember ===
            true
    );

    location.href =
        "index.html";
}

async function finishLogin(
    login
) {
    const response =
        await fetch(
            `${api}/auth/login`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials:
                    "include",

                cache:
                    "no-store",

                body:
                    JSON.stringify(
                        login
                    )
            }
        );

    const data =
        await response
            .json()
            .catch(
                () => ({})
            );

    if (
        !response.ok ||
        data.authenticated !==
            true
    ) {
        if (
            data.error ===
            "email_verification_required"
        ) {
            throw new Error(
                "Email verification expired. Try again."
            );
        }

        if (
            data.error ===
                "captcha_required" ||
            data.error ===
                "turnstile_required" ||
            data.error ===
                "turnstile_failed"
        ) {
            resetTurnstile();

            throw new Error(
                "Human verification expired. Try again."
            );
        }

        throw new Error(
            "Invalid email, username, or password."
        );
    }

    storeAuthToken(
        data.token,
        data.remember ===
            true
    );

    location.href =
        "index.html";
}

function popupFeatures() {
    const width =
        520;

    const height =
        720;

    const left =
        Math.max(
            0,
            Math.round(
                screenX +
                (
                    outerWidth -
                    width
                ) /
                2
            )
        );

    const top =
        Math.max(
            0,
            Math.round(
                screenY +
                (
                    outerHeight -
                    height
                ) /
                2
            )
        );

    return [
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        "resizable=yes",
        "scrollbars=yes"
    ].join(
        ","
    );
}

function continueWithDiscord() {
    const popup =
        window.open(
            "",
            "venomDiscordLogin",
            popupFeatures()
        );

    if (
        !popup
    ) {
        setMessage(
            "Allow popups to continue with Discord."
        );

        return;
    }

    const url =
        new URL(
            `${api}/auth/discord/start`
        );

    url.searchParams.set(
        "remember",
        rememberLogin()
            ? "1"
            : "0"
    );

    url.searchParams.set(
        "popup",
        "1"
    );

    url.searchParams.set(
        "origin",
        location.origin
    );

    popup.location.replace(
        url.toString()
    );
}

function escapeHtml(
    value
) {
    return String(
        value ??
        ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function refreshIcons() {
    if (
        window.lucide
    ) {
        lucide.createIcons();
    }
}

tabs.forEach(
    tab => {
        tab.addEventListener(
            "click",
            () => {
                if (
                    submitting
                ) {
                    return;
                }

                mode =
                    tab.dataset.mode ===
                    "signup"
                        ? "signup"
                        : "login";

                const url =
                    new URL(
                        location.href
                    );

                url.searchParams.set(
                    "mode",
                    mode
                );

                history.replaceState(
                    {},
                    "",
                    url.pathname +
                    url.search +
                    url.hash
                );

                render();
            }
        );
    }
);

googleAuth?.addEventListener(
    "click",
    () => {
        setMessage(
            "Google login is not enabled yet."
        );
    }
);

discordAuth?.addEventListener(
    "click",
    continueWithDiscord
);

form.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        if (
            submitting
        ) {
            return;
        }

        setMessage(
            ""
        );

        setSubmitBusy(
            true
        );

        try {
            if (
                mode ===
                "signup"
            ) {
                await beginSignup();
            } else {
                await beginLogin();
            }

            if (
                pendingAuthentication
            ) {
                setSubmitBusy(
                    false
                );
            }
        } catch (
            err
        ) {
            setSubmitBusy(
                false
            );

            setMessage(
                err?.message ||
                "Authentication failed."
            );
        }
    }
);

window.addEventListener(
    "message",
    event => {
        let workerOrigin =
            "";

        try {
            workerOrigin =
                new URL(
                    api
                ).origin;
        } catch {}

        if (
            ![
                location.origin,
                workerOrigin
            ].includes(
                event.origin
            ) ||
            event.data?.source !==
                "venom-discord-login"
        ) {
            return;
        }

        if (
            event.data.ok ===
            true
        ) {
            location.href =
                "index.html";

            return;
        }

        setMessage(
            "Discord authentication failed."
        );
    }
);

render();

prepareTurnstileContainer();

createSecureSession()
    .then(
        () =>
            startCaptcha()
    )
    .catch(
        err => {
            console.error(
                "[VENOM] session initialization failed",
                err
            );

            renderCaptcha(
                "Could not prepare verification."
            );
        }
    );
