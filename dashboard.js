const api =
    "https://ancient-thunder-8889.cometv2.workers.dev";

const authTokenKey =
    "venom_auth_token";

const passwordGrantKey =
    "venom_password_grant";

const dashboard =
    document.querySelector(
        "#dashboard"
    );

const accountDock =
    document.querySelector(
        "#accountDock"
    );

const accountMenu =
    document.querySelector(
        "#accountMenu"
    );

const accountTrigger =
    document.querySelector(
        "#accountTrigger"
    );

const dockAvatar =
    document.querySelector(
        "#dockAvatar"
    );

const dockName =
    document.querySelector(
        "#dockName"
    );

const dockSub =
    document.querySelector(
        "#dockSub"
    );

const menuProfile =
    document.querySelector(
        "#menuProfile"
    );

const forumBtn =
    document.querySelector(
        "#forumBtn"
    );

const adminBtn =
    document.querySelector(
        "#adminBtn"
    );

const settingsBtn =
    document.querySelector(
        "#settingsBtn"
    );

const connectDiscordBtn =
    document.querySelector(
        "#connectDiscordBtn"
    );

const logoutBtn =
    document.querySelector(
        "#logoutBtn"
    );

const settingsBack =
    document.querySelector(
        "#settingsBack"
    );

const settingsClose =
    document.querySelector(
        "#settingsClose"
    );

const passwordSecurityText =
    document.querySelector(
        "#passwordSecurityText"
    );

const passwordReauthBtn =
    document.querySelector(
        "#passwordReauthBtn"
    );

const passwordForm =
    document.querySelector(
        "#passwordForm"
    );

const newPassword =
    document.querySelector(
        "#newPassword"
    );

const confirmPassword =
    document.querySelector(
        "#confirmPassword"
    );

const passwordMsg =
    document.querySelector(
        "#passwordMsg"
    );

const securitySummary =
    document.querySelector(
        "#securitySummary"
    );

const toast =
    document.querySelector(
        "#toast"
    );

let account =
    null;

let realLicense =
    "";

let licenseRevealed =
    false;

let hideLicenseTimer =
    null;

let discordPopup =
    null;

let toastTimer =
    null;

function authToken() {
    try {
        return (
            sessionStorage.getItem(
                authTokenKey
            ) ||
            localStorage.getItem(
                authTokenKey
            ) ||
            ""
        );
    } catch {
        return "";
    }
}

function authHeaders(
    extra = {}
) {
    const headers = {
        ...extra
    };

    const token =
        authToken();

    if (
        token
    ) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
}

function clearAuthToken() {
    try {
        sessionStorage.removeItem(
            authTokenKey
        );

        localStorage.removeItem(
            authTokenKey
        );

        sessionStorage.removeItem(
            passwordGrantKey
        );
    } catch {}
}

function safeAvatar(
    value
) {
    const avatar =
        String(
            value ||
            ""
        );

    return /^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z0-9+/=\r\n]+$/i.test(
        avatar
    )
        ? avatar
        : "";
}

function accountAvatarHtml() {
    const avatar =
        safeAvatar(
            account?.avatar
        );

    if (
        avatar
    ) {
        return `
            <img
                src="${escapeHtml(
                    avatar
                )}"
                alt=""
            >
        `;
    }

    return `
        <i data-lucide="user-round"></i>
    `;
}

function discordIconSvg() {
    return `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="M20.317 4.3698a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.534 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.095.252-.193.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"
            ></path>
        </svg>
    `;
}

function roleBadgesHtml(
    roles = {}
) {
    const badges =
        [];

    if (
        roles.verified ===
        true
    ) {
        badges.push(`
            <img
                class="roleBadge"
                src="assets/verified.png"
                alt="Verified"
                title="Verified"
            >
        `);
    }

    if (
        roles.admin ===
        true
    ) {
        badges.push(`
            <img
                class="roleBadge"
                src="assets/venomb.png"
                alt="Venom Admin"
                title="Venom Admin"
            >
        `);
    }

    return badges.join(
        ""
    );
}

function greetingForNow() {
    const hour =
        new Date()
            .getHours();

    if (
        hour <
        12
    ) {
        return "Good Morning";
    }

    if (
        hour <
        18
    ) {
        return "Good Afternoon";
    }

    return "Good Evening";
}

function formatRemaining(
    ms
) {
    const value =
        Math.max(
            0,
            Number(
                ms ||
                0
            )
        );

    const days =
        Math.floor(
            value /
            86400000
        );

    const hours =
        Math.floor(
            (
                value %
                86400000
            ) /
            3600000
        );

    const minutes =
        Math.floor(
            (
                value %
                3600000
            ) /
            60000
        );

    if (
        days >
        0
    ) {
        return `${days}d ${hours}h`;
    }

    if (
        hours >
        0
    ) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}

function formatDate(
    value
) {
    const number =
        Number(
            value ||
            0
        );

    if (
        !number
    ) {
        return "Unknown";
    }

    const date =
        new Date(
            number
        );

    if (
        !Number.isFinite(
            date.getTime()
        )
    ) {
        return "Unknown";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"
        }
    );
}

function formatAge(
    ms
) {
    const days =
        Math.max(
            0,
            Math.floor(
                Number(
                    ms ||
                    0
                ) /
                86400000
            )
        );

    if (
        days <
        1
    ) {
        return "Today";
    }

    if (
        days ===
        1
    ) {
        return "1 day";
    }

    return `${days} days`;
}

function setPasswordFormUnlocked(
    unlocked
) {
    passwordForm.classList.toggle(
        "locked",
        !unlocked
    );

    passwordForm
        .querySelectorAll(
            'input, button[type="submit"]'
        )
        .forEach(
            control => {
                control.disabled =
                    !unlocked;
            }
        );
}

function renderDock() {
    if (
        !account
    ) {
        return;
    }

    dockAvatar.innerHTML =
        accountAvatarHtml();

    dockName.innerHTML = `
        <span class="accountNameLine">
            <span>
                ${escapeHtml(
                    account.username
                )}
            </span>

            ${roleBadgesHtml(
                account.roles
            )}
        </span>
    `;

    dockSub.textContent =
        account.discordConnected &&
        account.discordUsername
            ? `@${account.discordUsername}`
            : "Venom account";

    menuProfile.innerHTML = `
        <div class="accountName accountNameLine">
            <span>
                ${escapeHtml(
                    account.username
                )}
            </span>

            ${roleBadgesHtml(
                account.roles
            )}
        </div>

        <div class="accountSub">
            ${
                account.discordConnected &&
                account.discordUsername
                    ? `Discord -> @${escapeHtml(
                        account.discordUsername
                    )}`
                    : "Discord -> Not connected"
            }
        </div>
    `;

    adminBtn.hidden =
        account.roles?.admin !==
        true;

    connectDiscordBtn.hidden =
        account.discordConnected;

    connectDiscordBtn.innerHTML =
        `${discordIconSvg()}<span>Connect Discord</span>`;

    passwordSecurityText.textContent =
        account.discordConnected
            ? "Password changes require a fresh Discord authentication every time."
            : "Connect Discord before password changes can be authenticated.";

    passwordReauthBtn.innerHTML =
        account.discordConnected
            ? `${discordIconSvg()}<span>Authenticate with Discord</span>`
            : `${discordIconSvg()}<span>Connect Discord first</span>`;

    securitySummary.textContent =
        account.discordConnected
            ? `Discord -> Connected | Status -> ${account.accountStatus}`
            : `Discord -> Not connected | Status -> ${account.accountStatus}`;

    accountDock.hidden =
        false;

    refreshIcons();
}

function renderDashboard() {
    const usage =
        Array.isArray(
            account.usage
        )
            ? account.usage
            : [];

    const totalActivity =
        usage.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.count ||
                    0
                ),
            0
        );

    const max =
        Math.max(
            1,
            ...usage.map(
                item =>
                    Number(
                        item.count ||
                        0
                    )
            )
        );

    const bars =
        usage
            .map(
                item => {
                    const value =
                        Number(
                            item.count ||
                            0
                        );

                    const height =
                        Math.max(
                            4,
                            Math.round(
                                value /
                                max *
                                160
                            )
                        );

                    const date =
                        new Date(
                            `${item.day}T00:00:00Z`
                        );

                    const label =
                        date.toLocaleDateString(
                            undefined,
                            {
                                weekday:
                                    "short"
                            }
                        );

                    return `
                        <div class="barCol">
                            <div class="barTrack">
                                <div
                                    class="bar"
                                    style="height:${height}px"
                                    title="${value} events"
                                ></div>
                            </div>

                            <div class="barDay">
                                ${escapeHtml(
                                    label
                                )}
                            </div>
                        </div>
                    `;
                }
            )
            .join(
                ""
            );

    dashboard.innerHTML = `
        <section class="hero">
            <div class="heroAccount">
                <div class="heroAvatar">
                    ${accountAvatarHtml()}
                </div>

                <div>
                    <h1 class="heroGreetingLine">
                        <span>
                            ${escapeHtml(
                                greetingForNow()
                            )} ${escapeHtml(
                                account.username
                            )}
                        </span>

                        ${roleBadgesHtml(
                            account.roles
                        )},
                    </h1>

                    <p>
                        Welcome back to Venom
                    </p>
                </div>
            </div>
        </section>

        <section class="stats">
            <article class="card stat">
                <div class="statTop">
                    <div class="label">
                        License time
                    </div>

                    <div class="statIcon">
                        <i data-lucide="clock-3"></i>
                    </div>
                </div>

                <div class="value">
                    ${escapeHtml(
                        formatRemaining(
                            account.licenseRemainingMs
                        )
                    )}
                </div>

                <div class="subvalue">
                    Expires -> ${escapeHtml(
                        formatDate(
                            account.licenseExpiresAt
                        )
                    )}
                </div>
            </article>

            <article class="card stat">
                <div class="statTop">
                    <div class="label">
                        Discord
                    </div>

                    <div
                        class="statIcon"
                        style="color:#fff"
                    >
                        ${discordIconSvg()}
                    </div>
                </div>

                <div class="value">
                    ${
                        account.discordConnected
                            ? "Connected"
                            : "Not connected"
                    }
                </div>

                <div class="subvalue">
                    ${
                        account.discordUsername
                            ? `@${escapeHtml(
                                account.discordUsername
                            )}`
                            : "No Discord linked"
                    }
                </div>
            </article>

            <article class="card stat">
                <div class="statTop">
                    <div class="label">
                        Account age
                    </div>

                    <div class="statIcon">
                        <i data-lucide="calendar-days"></i>
                    </div>
                </div>

                <div class="value">
                    ${escapeHtml(
                        formatAge(
                            account.accountAgeMs
                        )
                    )}
                </div>

                <div class="subvalue">
                    Created -> ${escapeHtml(
                        formatDate(
                            account.createdAt
                        )
                    )}
                </div>
            </article>

            <article class="card stat">
                <div class="statTop">
                    <div class="label">
                        Status
                    </div>

                    <div class="statIcon">
                        <i data-lucide="shield-check"></i>
                    </div>
                </div>

                <div class="value">
                    ${escapeHtml(
                        account.accountStatus
                    )}
                </div>

                <div class="subvalue">
                    Auth -> ${escapeHtml(
                        account.authMethod
                    )}
                </div>
            </article>
        </section>

        <section class="layout">
            <article class="card usageCard">
                <div class="cardHead">
                    <div>
                        <div class="cardTitle">
                            Recent activity
                        </div>

                        <div class="cardText">
                            Your last seven days of Venom activity.
                        </div>
                    </div>

                    <div class="activityTotal">
                        ${totalActivity} events
                    </div>
                </div>

                <div class="chart">
                    ${
                        bars ||
                        `
                            <div class="loading">
                                No usage data.
                            </div>
                        `
                    }
                </div>
            </article>

            <div class="side">
                <article class="card licenseCard">
                    <div class="cardTitle">
                        License
                    </div>

                    <div class="cardText">
                        Reveal only when you need to copy it.
                    </div>

                    <div class="licenseBox">
                        <div
                            class="licenseDisplay"
                            id="licenseDisplay"
                        >
                            VENOM-XXXX-XXXX-XXXX-XXXX
                        </div>

                        <div class="licenseActions">
                            <button
                                class="smallBtn"
                                id="revealLicenseBtn"
                                type="button"
                            >
                                <i data-lucide="eye"></i>

                                <span>
                                    Reveal
                                </span>
                            </button>

                            <button
                                class="smallBtn"
                                id="copyLicenseBtn"
                                type="button"
                            >
                                <i data-lucide="copy"></i>

                                <span>
                                    Copy
                                </span>
                            </button>
                        </div>
                    </div>
                </article>

                <article class="card securityCard">
                    <div class="cardTitle">
                        Account
                    </div>

                    <div class="cardText">
                        Current account and security state.
                    </div>

                    <div class="securityRows">
                        <div class="securityRow">
                            <span>
                                Username
                            </span>

                            <span>
                                ${escapeHtml(
                                    account.username
                                )}
                            </span>
                        </div>

                        <div class="securityRow">
                            <span>
                                Discord
                            </span>

                            <span>
                                ${
                                    account.discordConnected
                                        ? "Connected"
                                        : "Not connected"
                                }
                            </span>
                        </div>

                        <div class="securityRow">
                            <span>
                                Roles
                            </span>

                            <span>
                                ${
                                    account.roles?.admin
                                        ? "Admin"
                                        : account.roles?.verified
                                            ? "Verified"
                                            : "Member"
                                }
                            </span>
                        </div>

                        <div class="securityRow">
                            <span>
                                License created
                            </span>

                            <span>
                                ${escapeHtml(
                                    formatDate(
                                        account.licenseCreatedAt
                                    )
                                )}
                            </span>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    `;

    document
        .querySelector(
            "#revealLicenseBtn"
        )
        ?.addEventListener(
            "click",
            revealLicense
        );

    document
        .querySelector(
            "#copyLicenseBtn"
        )
        ?.addEventListener(
            "click",
            copyLicense
        );

    refreshIcons();
}

async function revealLicense() {
    const display =
        document.querySelector(
            "#licenseDisplay"
        );

    const button =
        document.querySelector(
            "#revealLicenseBtn"
        );

    if (
        !display ||
        !button
    ) {
        return;
    }

    if (
        licenseRevealed
    ) {
        hideLicense();

        return;
    }

    button.disabled =
        true;

    try {
        const response =
            await fetch(
                `${api}/auth/license`,
                {
                    method:
                        "GET",

                    headers:
                        authHeaders(),

                    credentials:
                        "include",

                    cache:
                        "no-store"
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
                401 ||
            response.status ===
                403
        ) {
            clearAuthToken();

            location.replace(
                "ls.html?mode=login"
            );

            return;
        }

        if (
            !response.ok ||
            !data.license
        ) {
            throw new Error(
                data.error ||
                "license_failed"
            );
        }

        realLicense =
            String(
                data.license
            );

        display.textContent =
            realLicense;

        display.classList.add(
            "revealed"
        );

        licenseRevealed =
            true;

        button.innerHTML = `
            <i data-lucide="eye-off"></i>

            <span>
                Hide
            </span>
        `;

        clearTimeout(
            hideLicenseTimer
        );

        hideLicenseTimer =
            setTimeout(
                hideLicense,
                15000
            );

        refreshIcons();
    } catch {
        showToast(
            "Could not reveal license."
        );
    } finally {
        button.disabled =
            false;
    }
}

function hideLicense() {
    const display =
        document.querySelector(
            "#licenseDisplay"
        );

    const button =
        document.querySelector(
            "#revealLicenseBtn"
        );

    if (
        display
    ) {
        display.textContent =
            "VENOM-XXXX-XXXX-XXXX-XXXX";

        display.classList.remove(
            "revealed"
        );
    }

    if (
        button
    ) {
        button.innerHTML = `
            <i data-lucide="eye"></i>

            <span>
                Reveal
            </span>
        `;
    }

    realLicense =
        "";

    licenseRevealed =
        false;

    clearTimeout(
        hideLicenseTimer
    );

    refreshIcons();
}

async function copyLicense() {
    if (
        !realLicense
    ) {
        await revealLicense();
    }

    if (
        !realLicense
    ) {
        return;
    }

    try {
        await navigator.clipboard
            .writeText(
                realLicense
            );

        showToast(
            "License copied."
        );
    } catch {
        showToast(
            "Could not copy license."
        );
    }
}

function openSettings() {
    accountMenu.classList.remove(
        "on"
    );

    settingsBack.classList.add(
        "on"
    );
}

function closeSettings() {
    settingsBack.classList.remove(
        "on"
    );
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
                window.screenX +
                (
                    window.outerWidth -
                    width
                ) /
                2
            )
        );

    const top =
        Math.max(
            0,
            Math.round(
                window.screenY +
                (
                    window.outerHeight -
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

async function submitDiscordAction(
    purpose
) {
    const token =
        authToken();

    if (
        !token
    ) {
        location.replace(
            "ls.html?mode=login"
        );

        return;
    }

    discordPopup =
        window.open(
            "",
            "venomDiscordAction",
            popupFeatures()
        );

    if (
        !discordPopup
    ) {
        showToast(
            "Allow popups to continue with Discord."
        );

        return;
    }

    try {
        discordPopup.document.write(`
            <!doctype html>

            <html>
            <body
                style="
                    margin:0;
                    background:#080808;
                    color:#aaa;
                    font-family:system-ui;
                    min-height:100vh;
                    display:grid;
                    place-items:center;
                "
            >
                Opening Discord...
            </body>
            </html>
        `);
    } catch {}

    try {
        const response =
            await fetch(
                `${api}/auth/discord/action-start`,
                {
                    method:
                        "POST",

                    headers:
                        authHeaders({
                            "Content-Type":
                                "application/json"
                        }),

                    credentials:
                        "include",

                    cache:
                        "no-store",

                    body:
                        JSON.stringify({
                            purpose,

                            origin:
                                location.origin
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
            401
        ) {
            discordPopup.close();

            clearAuthToken();

            location.replace(
                "ls.html?mode=login"
            );

            return;
        }

        if (
            !response.ok ||
            !data.url
        ) {
            throw new Error(
                data.error ||
                "discord_start_failed"
            );
        }

        discordPopup.location.replace(
            data.url
        );
    } catch (
        err
    ) {
        try {
            discordPopup.close();
        } catch {}

        showToast(
            err.message ===
            "discord_required"
                ? "Connect Discord first."
                : "Could not start Discord authentication."
        );
    }
}

function handleCallbackParams() {
    const url =
        new URL(
            location.href
        );

    const grant =
        url.searchParams.get(
            "password_reauth"
        );

    const connected =
        url.searchParams.get(
            "discord_connected"
        );

    const error =
        url.searchParams.get(
            "discord_error"
        ) ||
        url.searchParams.get(
            "discord_connect_error"
        ) ||
        url.searchParams.get(
            "password_error"
        );

    if (
        grant
    ) {
        try {
            sessionStorage.setItem(
                passwordGrantKey,
                grant
            );
        } catch {}

        setPasswordFormUnlocked(
            true
        );

        passwordMsg.textContent =
            "Discord authenticated. Enter your new password.";
    }

    if (
        connected ===
        "1"
    ) {
        showToast(
            "Discord connected."
        );
    }

    if (
        error
    ) {
        showToast(
            "Discord authentication failed."
        );
    }

    if (
        grant ||
        connected ||
        error
    ) {
        [
            "password_reauth",
            "discord_connected",
            "discord_error",
            "discord_connect_error",
            "password_error"
        ].forEach(
            key =>
                url.searchParams.delete(
                    key
                )
        );

        history.replaceState(
            {},
            "",
            url.pathname +
            url.search +
            url.hash
        );
    }
}

async function changePassword(
    event
) {
    event.preventDefault();

    const password =
        String(
            newPassword.value ||
            ""
        );

    const confirm =
        String(
            confirmPassword.value ||
            ""
        );

    let grant =
        "";

    try {
        grant =
            sessionStorage.getItem(
                passwordGrantKey
            ) ||
            "";
    } catch {}

    if (
        !grant
    ) {
        passwordMsg.textContent =
            "Authenticate with Discord first.";

        return;
    }

    if (
        password.length <
        10
    ) {
        passwordMsg.textContent =
            "Use at least 10 characters.";

        return;
    }

    if (
        password !==
        confirm
    ) {
        passwordMsg.textContent =
            "Passwords do not match.";

        return;
    }

    passwordMsg.textContent =
        "Changing password...";

    try {
        const response =
            await fetch(
                `${api}/auth/password/change`,
                {
                    method:
                        "POST",

                    headers:
                        authHeaders({
                            "Content-Type":
                                "application/json"
                        }),

                    credentials:
                        "include",

                    cache:
                        "no-store",

                    body:
                        JSON.stringify({
                            grant,
                            password
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
            !response.ok
        ) {
            throw new Error(
                data.error ||
                "password_change_failed"
            );
        }

        try {
            sessionStorage.removeItem(
                passwordGrantKey
            );
        } catch {}

        newPassword.value =
            "";

        confirmPassword.value =
            "";

        setPasswordFormUnlocked(
            false
        );

        passwordMsg.textContent =
            "";

        showToast(
            "Password changed."
        );
    } catch (
        err
    ) {
        passwordMsg.textContent =
            err.message ===
            "weak_password"
                ? "Choose a stronger password."
                : "Password change failed.";
    }
}

async function logout() {
    try {
        await fetch(
            `${api}/auth/logout`,
            {
                method:
                    "POST",

                headers:
                    authHeaders(),

                credentials:
                    "include",

                cache:
                    "no-store"
            }
        );
    } catch {}

    clearAuthToken();

    location.replace(
        "index.html"
    );
}

async function loadCommunityProfile() {
    try {
        const response =
            await fetch(
                `${api}/community/me`,
                {
                    method:
                        "GET",

                    headers:
                        authHeaders(),

                    credentials:
                        "include",

                    cache:
                        "no-store"
                }
            );

        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );

        return (
            response.ok &&
            data.authenticated ===
            true
        )
            ? data
            : null;
    } catch {
        return null;
    }
}

async function loadDashboard() {
    try {
        const response =
            await fetch(
                `${api}/auth/dashboard`,
                {
                    method:
                        "GET",

                    headers:
                        authHeaders(),

                    credentials:
                        "include",

                    cache:
                        "no-store"
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
                401 ||
            response.status ===
                403 ||
            data.authenticated ===
                false
        ) {
            clearAuthToken();

            location.replace(
                "ls.html?mode=login"
            );

            return;
        }

        if (
            !response.ok ||
            data.authenticated !==
                true
        ) {
            dashboard.innerHTML = `
                <div class="loading">
                    Could not load dashboard.
                </div>
            `;

            return;
        }

        account = {
            ...data,

            username:
                String(
                    data.username ||
                    "User"
                ),

            accountStatus:
                String(
                    data.accountStatus ||
                    "active"
                ),

            authMethod:
                String(
                    data.authMethod ||
                    "password"
                ),

            discordConnected:
                data.discordConnected ===
                    true ||
                Boolean(
                    data.discordUsername
                ),

            discordUsername:
                data.discordUsername
                    ? String(
                        data.discordUsername
                    )
                    : "",

            avatar:
                safeAvatar(
                    data.avatar
                ),

            roles:
                {}
        };

        const community =
            await loadCommunityProfile();

        if (
            community
        ) {
            account.roles =
                community.roles ||
                {};

            if (
                community.avatar
            ) {
                account.avatar =
                    safeAvatar(
                        community.avatar
                    );
            }
        }

        renderDashboard();

        renderDock();

        handleCallbackParams();
    } catch (
        err
    ) {
        console.error(
            "[VENOM DASHBOARD] load failed",
            err
        );

        dashboard.innerHTML = `
            <div class="loading">
                Could not load dashboard.
            </div>
        `;
    }
}

function showToast(
    message
) {
    clearTimeout(
        toastTimer
    );

    toast.textContent =
        message;

    toast.classList.add(
        "on"
    );

    toastTimer =
        setTimeout(
            () =>
                toast.classList.remove(
                    "on"
                ),
            2500
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

accountTrigger
    ?.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            accountMenu.classList.toggle(
                "on"
            );
        }
    );

accountMenu
    ?.addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );

forumBtn
    ?.addEventListener(
        "click",
        () => {
            location.href =
                "forum.html";
        }
    );

adminBtn
    ?.addEventListener(
        "click",
        () => {
            if (
                account?.roles?.admin ===
                true
            ) {
                location.href =
                    "admin.html";
            }
        }
    );

settingsBtn
    ?.addEventListener(
        "click",
        openSettings
    );

settingsClose
    ?.addEventListener(
        "click",
        closeSettings
    );

settingsBack
    ?.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                settingsBack
            ) {
                closeSettings();
            }
        }
    );

connectDiscordBtn
    ?.addEventListener(
        "click",
        () =>
            submitDiscordAction(
                "connect"
            )
    );

passwordReauthBtn
    ?.addEventListener(
        "click",
        () =>
            submitDiscordAction(
                account?.discordConnected
                    ? "reauth_password"
                    : "connect"
            )
    );

passwordForm
    ?.addEventListener(
        "submit",
        changePassword
    );

logoutBtn
    ?.addEventListener(
        "click",
        logout
    );

document.addEventListener(
    "click",
    () =>
        accountMenu
            ?.classList
            .remove(
                "on"
            )
);

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key ===
            "Escape"
        ) {
            accountMenu
                ?.classList
                .remove(
                    "on"
                );

            closeSettings();
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
            )
        ) {
            return;
        }

        if (
            event.data?.source !==
            "venom-discord-oauth"
        ) {
            return;
        }

        if (
            event.data.purpose ===
                "connect" &&
            event.data.ok ===
                true
        ) {
            showToast(
                "Discord connected."
            );

            loadDashboard();

            return;
        }

        if (
            event.data.purpose ===
                "reauth_password" &&
            event.data.ok ===
                true &&
            event.data.grant
        ) {
            try {
                sessionStorage.setItem(
                    passwordGrantKey,
                    String(
                        event.data.grant
                    )
                );
            } catch {}

            setPasswordFormUnlocked(
                true
            );

            passwordMsg.textContent =
                "Discord authenticated. Enter your new password.";

            showToast(
                "Action authorized."
            );

            return;
        }

        showToast(
            "Discord authentication failed."
        );
    }
);

setPasswordFormUnlocked(
    false
);

refreshIcons();

loadDashboard();