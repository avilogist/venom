function loadFooter() {
    const footer =
        document.querySelector(
            "#footer"
        );

    if (
        !footer
    ) {
        return;
    }

    footer.innerHTML = `
        <div class="fbrand">
            <img
                class="flogo"
                src="assets/logo.png"
                alt="Venom"
            >

            <div class="copy">
                <i data-lucide="copyright"></i>
                2026
            </div>
        </div>

        <div class="fcols">
            <div class="fcol">
                <div class="ftitle">
                    Legal
                </div>

                <a href="terms.html">
                    Terms of Service
                </a>

                <a href="privacy.html">
                    Privacy Policy
                </a>
            </div>

            <div class="fcol">
                <div class="ftitle">
                    Policies
                </div>

                <a href="cookies.html">
                    Cookie Policy
                </a>

                <a href="acceptable-use.html">
                    Acceptable Use
                </a>
            </div>
        </div>

        <div class="fspace"></div>
    `;

    if (
        window.lucide
    ) {
        lucide.createIcons();
    }
}

loadFooter();