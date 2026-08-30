const api =
    "https://ancient-thunder-8889.cometv2.workers.dev";

const authTokenKey =
    "venom_auth_token";

const identity =
    document.querySelector(
        "#identity"
    );

const composer =
    document.querySelector(
        "#composer"
    );

const postTitle =
    document.querySelector(
        "#postTitle"
    );

const postBody =
    document.querySelector(
        "#postBody"
    );

const commentMode =
    document.querySelector(
        "#commentMode"
    );

const selectedOnly =
    document.querySelector(
        "#selectedOnly"
    );

const selectedUsers =
    document.querySelector(
        "#selectedUsers"
    );

const imageInput =
    document.querySelector(
        "#imageInput"
    );

const imageAdd =
    document.querySelector(
        "#imageAdd"
    );

const imageList =
    document.querySelector(
        "#imageList"
    );

const publishPost =
    document.querySelector(
        "#publishPost"
    );

const cancelEdit =
    document.querySelector(
        "#cancelEdit"
    );

const feed =
    document.querySelector(
        "#feed"
    );

const feedCount =
    document.querySelector(
        "#feedCount"
    );

const toast =
    document.querySelector(
        "#toast"
    );

let me =
    null;

let posts =
    [];

let composerImages =
    [];

let editingPostId =
    "";

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

function redirectLogin() {
    location.replace(
        "ls.html?mode=login"
    );
}

function badgeHtml(
    roles = {}
) {
    const parts =
        [];

    if (
        roles.verified
    ) {
        parts.push(
            '<img class="badge" src="assets/verified.png" alt="Verified" title="Verified">'
        );
    }

    if (
        roles.admin
    ) {
        parts.push(
            '<img class="badge" src="assets/venomb.png" alt="Venom Admin" title="Venom Admin">'
        );
    }

    return parts.join(
        ""
    );
}

function avatarHtml(
    profile,
    className = "avatar"
) {
    const avatar =
        safeAvatar(
            profile?.avatar
        );

    if (
        avatar
    ) {
        return `
            <div class="${className}">
                <img
                    src="${escapeHtml(
                        avatar
                    )}"
                    alt=""
                >
            </div>
        `;
    }

    return `
        <div class="${className}">
            <i data-lucide="user-round"></i>
        </div>
    `;
}

function renderIdentity() {
    if (
        !me
    ) {
        return;
    }

    identity.hidden =
        false;

    identity.innerHTML = `
        ${avatarHtml(
            me
        )}

        <div>
            <div class="identityName">
                <span>
                    ${escapeHtml(
                        me.username
                    )}
                </span>

                ${badgeHtml(
                    me.roles
                )}
            </div>

            <div class="identitySub">
                ${
                    me.roles?.admin
                        ? "Venom Admin"
                        : "Venom member"
                }
            </div>
        </div>
    `;

    composer.hidden =
        !me.roles?.admin;

    refreshIcons();
}

async function loadForum() {
    try {
        const response =
            await fetch(
                `${api}/community/forum/posts`,
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
            redirectLogin();

            return;
        }

        if (
            !response.ok
        ) {
            throw new Error(
                data.error ||
                "forum_load_failed"
            );
        }

        me =
            data.me ||
            null;

        posts =
            Array.isArray(
                data.posts
            )
                ? data.posts
                : [];

        renderIdentity();

        renderFeed();
    } catch (
        err
    ) {
        console.error(
            "[VENOM FORUM] load failed",
            err
        );

        feed.innerHTML = `
            <div class="empty">
                Could not load announcements.
            </div>
        `;

        feedCount.textContent =
            "Unavailable";
    }
}

function renderFeed() {
    feedCount.textContent =
        `${posts.length} ${
            posts.length ===
            1
                ? "post"
                : "posts"
        }`;

    if (
        !posts.length
    ) {
        feed.innerHTML = `
            <div class="empty">
                No announcements yet.
            </div>
        `;

        return;
    }

    feed.innerHTML =
        posts
            .map(
                post => `
                    <article
                        class="post"
                        data-post-id="${escapeHtml(
                            post.id
                        )}"
                    >
                        <div class="postHead">
                            <div class="author">
                                ${avatarHtml(
                                    post.author
                                )}

                                <div class="authorWords">
                                    <div class="authorName">
                                        <span>
                                            ${escapeHtml(
                                                post.author?.username ||
                                                "User"
                                            )}
                                        </span>

                                        ${badgeHtml(
                                            post.author?.roles
                                        )}
                                    </div>

                                    <div class="postTime">
                                        ${escapeHtml(
                                            formatDateTime(
                                                post.createdAt
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            ${
                                me?.roles?.admin
                                    ? `
                                        <button
                                            class="iconBtn editPost"
                                            type="button"
                                            title="Edit announcement"
                                        >
                                            <i data-lucide="pencil"></i>
                                        </button>
                                    `
                                    : ""
                            }
                        </div>

                        <h2 class="postTitle">
                            ${escapeHtml(
                                post.title
                            )}
                        </h2>

                        <div class="markdown">
                            ${renderMarkdown(
                                post.bodyMd
                            )}
                        </div>

                        ${renderImages(
                            post.images
                        )}

                        <div class="postActions">
                            <button
                                class="action likePost ${
                                    post.likedByMe
                                        ? "on"
                                        : ""
                                }"
                                type="button"
                            >
                                <i data-lucide="heart"></i>

                                <span>
                                    ${Number(
                                        post.likeCount ||
                                        0
                                    )}
                                </span>
                            </button>

                            <button
                                class="action openComments"
                                type="button"
                            >
                                <i data-lucide="message-circle"></i>

                                <span>
                                    ${Number(
                                        post.commentCount ||
                                        0
                                    )}
                                </span>
                            </button>

                            <span
                                class="action"
                                style="cursor:default"
                            >
                                <i data-lucide="shield"></i>

                                <span>
                                    ${commentModeLabel(
                                        post.commentMode
                                    )}
                                </span>
                            </span>

                            ${
                                me?.roles?.admin
                                    ? `
                                        <button
                                            class="action danger deletePost"
                                            type="button"
                                        >
                                            <i data-lucide="trash-2"></i>

                                            <span>
                                                Delete
                                            </span>
                                        </button>
                                    `
                                    : ""
                            }
                        </div>

                        <div
                            class="comments"
                            hidden
                        ></div>
                    </article>
                `
            )
            .join(
                ""
            );

    feed
        .querySelectorAll(
            ".post"
        )
        .forEach(
            bindPost
        );

    refreshIcons();
}

function bindPost(
    article
) {
    const postId =
        article.dataset.postId;

    article
        .querySelector(
            ".likePost"
        )
        ?.addEventListener(
            "click",
            () =>
                toggleLike(
                    postId,
                    article
                )
        );

    article
        .querySelector(
            ".openComments"
        )
        ?.addEventListener(
            "click",
            () =>
                toggleComments(
                    postId,
                    article
                )
        );

    article
        .querySelector(
            ".deletePost"
        )
        ?.addEventListener(
            "click",
            () =>
                deletePost(
                    postId
                )
        );

    article
        .querySelector(
            ".editPost"
        )
        ?.addEventListener(
            "click",
            () =>
                editPost(
                    postId
                )
        );
}

function renderImages(
    images
) {
    if (
        !Array.isArray(
            images
        ) ||
        !images.length
    ) {
        return "";
    }

    return `
        <div class="postImages">
            ${
                images
                    .map(
                        image => {
                            const mode =
                                [
                                    "left",
                                    "center",
                                    "right"
                                ].includes(
                                    image.positionMode
                                )
                                    ? image.positionMode
                                    : "";

                            const width =
                                Math.max(
                                    20,
                                    Math.min(
                                        100,
                                        Number(
                                            image.widthPercent ||
                                            100
                                        )
                                    )
                                );

                            return `
                                <img
                                    class="postImage ${mode}"
                                    src="${escapeHtml(
                                        image.dataUrl
                                    )}"
                                    alt=""
                                    style="width:${width}%"
                                >
                            `;
                        }
                    )
                    .join(
                        ""
                    )
            }
        </div>
    `;
}

async function toggleLike(
    postId,
    article
) {
    try {
        const response =
            await fetch(
                `${api}/community/forum/posts/${encodeURIComponent(
                    postId
                )}/like`,
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
                "like_failed"
            );
        }

        const button =
            article.querySelector(
                ".likePost"
            );

        button?.classList.toggle(
            "on",
            data.liked ===
            true
        );

        const span =
            button?.querySelector(
                "span"
            );

        if (
            span
        ) {
            span.textContent =
                String(
                    data.count ||
                    0
                );
        }

        const post =
            posts.find(
                item =>
                    item.id ===
                    postId
            );

        if (
            post
        ) {
            post.likedByMe =
                data.liked ===
                true;

            post.likeCount =
                Number(
                    data.count ||
                    0
                );
        }
    } catch {
        showToast(
            "Could not update like."
        );
    }
}

async function toggleComments(
    postId,
    article
) {
    const box =
        article.querySelector(
            ".comments"
        );

    if (
        !box
    ) {
        return;
    }

    if (
        !box.hidden
    ) {
        box.hidden =
            true;

        return;
    }

    box.hidden =
        false;

    box.innerHTML = `
        <div class="loading">
            Loading comments...
        </div>
    `;

    try {
        const response =
            await fetch(
                `${api}/community/forum/posts/${encodeURIComponent(
                    postId
                )}`,
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
            !response.ok ||
            !data.post
        ) {
            throw new Error(
                "comments_failed"
            );
        }

        renderComments(
            data.post,
            box
        );
    } catch {
        box.innerHTML = `
            <div class="empty">
                Could not load comments.
            </div>
        `;
    }
}

function renderComments(
    post,
    box
) {
    const comments =
        Array.isArray(
            post.comments
        )
            ? post.comments
            : [];

    box.innerHTML = `
        ${
            comments.length
                ? comments
                    .map(
                        comment => `
                            <div
                                class="comment"
                                data-comment-id="${escapeHtml(
                                    comment.id
                                )}"
                            >
                                ${avatarHtml(
                                    comment.author
                                )}

                                <div class="commentBody">
                                    <div class="commentMeta">
                                        <span>
                                            ${escapeHtml(
                                                comment.author?.username ||
                                                "User"
                                            )}
                                        </span>

                                        ${badgeHtml(
                                            comment.author?.roles
                                        )}

                                        <span>
                                            •
                                        </span>

                                        <span>
                                            ${escapeHtml(
                                                formatDateTime(
                                                    comment.createdAt
                                                )
                                            )}
                                        </span>
                                    </div>

                                    <div class="commentText markdown">
                                        ${renderMarkdown(
                                            comment.bodyMd
                                        )}
                                    </div>
                                </div>

                                ${
                                    comment.canDelete
                                        ? `
                                            <button
                                                class="iconBtn deleteComment"
                                                type="button"
                                                title="Delete comment"
                                            >
                                                <i data-lucide="trash-2"></i>
                                            </button>
                                        `
                                        : ""
                                }
                            </div>
                        `
                    )
                    .join(
                        ""
                    )
                : `
                    <div
                        class="empty"
                        style="padding:12px"
                    >
                        No comments yet.
                    </div>
                `
        }

        ${
            post.canComment
                ? `
                    <div class="commentForm">
                        <textarea
                            class="commentInput"
                            maxlength="5000"
                            placeholder="Write a comment... Markdown is supported."
                        ></textarea>

                        <button
                            class="btn primary sendComment"
                            type="button"
                        >
                            Comment
                        </button>
                    </div>
                `
                : `
                    <div class="identitySub">
                        Comments are restricted for this announcement.
                    </div>
                `
        }
    `;

    box
        .querySelector(
            ".sendComment"
        )
        ?.addEventListener(
            "click",
            () =>
                sendComment(
                    post.id,
                    box
                )
        );

    box
        .querySelectorAll(
            ".deleteComment"
        )
        .forEach(
            button => {
                const id =
                    button
                        .closest(
                            ".comment"
                        )
                        ?.dataset
                        .commentId;

                button.addEventListener(
                    "click",
                    () =>
                        deleteComment(
                            id,
                            post.id,
                            box
                        )
                );
            }
        );

    refreshIcons();
}

async function sendComment(
    postId,
    box
) {
    const input =
        box.querySelector(
            ".commentInput"
        );

    const bodyMd =
        String(
            input?.value ||
            ""
        ).trim();

    if (
        !bodyMd
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                `${api}/community/forum/posts/${encodeURIComponent(
                    postId
                )}/comments`,
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
                            bodyMd
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
                "comment_failed"
            );
        }

        await reloadComments(
            postId,
            box
        );

        const post =
            posts.find(
                item =>
                    item.id ===
                    postId
            );

        if (
            post
        ) {
            post.commentCount =
                Number(
                    post.commentCount ||
                    0
                ) +
                1;
        }

        const article =
            box.closest(
                ".post"
            );

        const count =
            article
                ?.querySelector(
                    ".openComments span"
                );

        if (
            count &&
            post
        ) {
            count.textContent =
                String(
                    post.commentCount
                );
        }
    } catch (
        err
    ) {
        showToast(
            err.message ===
            "comments_not_allowed"
                ? "You cannot comment on this post."
                : "Could not post comment."
        );
    }
}

async function deleteComment(
    commentId,
    postId,
    box
) {
    if (
        !commentId ||
        !confirm(
            "Delete this comment?"
        )
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                `${api}/community/forum/comments/${encodeURIComponent(
                    commentId
                )}`,
                {
                    method:
                        "DELETE",

                    headers:
                        authHeaders(),

                    credentials:
                        "include",

                    cache:
                        "no-store"
                }
            );

        if (
            !response.ok
        ) {
            throw new Error(
                "delete_failed"
            );
        }

        await reloadComments(
            postId,
            box
        );
    } catch {
        showToast(
            "Could not delete comment."
        );
    }
}

async function reloadComments(
    postId,
    box
) {
    const response =
        await fetch(
            `${api}/community/forum/posts/${encodeURIComponent(
                postId
            )}`,
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
        response.ok &&
        data.post
    ) {
        renderComments(
            data.post,
            box
        );
    }
}

function editPost(
    postId
) {
    const post =
        posts.find(
            item =>
                item.id ===
                postId
        );

    if (
        !post ||
        !me?.roles?.admin
    ) {
        return;
    }

    editingPostId =
        postId;

    postTitle.value =
        post.title;

    postBody.value =
        post.bodyMd;

    commentMode.value =
        post.commentMode;

    selectedOnly.classList.toggle(
        "on",
        post.commentMode ===
        "selected"
    );

    selectedUsers.value =
        Array.isArray(
            post.selectedUsernames
        )
            ? post.selectedUsernames.join(
                ", "
            )
            : "";

    composerImages =
        (
            post.images ||
            []
        ).map(
            image => ({
                dataUrl:
                    image.dataUrl,

                positionMode:
                    image.positionMode ||
                    "block",

                widthPercent:
                    Number(
                        image.widthPercent ||
                        100
                    )
            })
        );

    renderComposerImages();

    publishPost.textContent =
        "Save changes";

    cancelEdit.hidden =
        false;

    composer.scrollIntoView({
        behavior:
            "smooth",

        block:
            "start"
    });
}

function resetComposer() {
    editingPostId =
        "";

    postTitle.value =
        "";

    postBody.value =
        "";

    commentMode.value =
        "everyone";

    selectedOnly.classList.remove(
        "on"
    );

    selectedUsers.value =
        "";

    composerImages =
        [];

    renderComposerImages();

    publishPost.textContent =
        "Publish announcement";

    cancelEdit.hidden =
        true;
}

async function savePost() {
    const title =
        postTitle.value
            .trim();

    const bodyMd =
        postBody.value
            .trim();

    if (
        !title ||
        !bodyMd
    ) {
        showToast(
            "Title and post body are required."
        );

        return;
    }

    const payload = {
        title,
        bodyMd,

        commentMode:
            commentMode.value,

        selectedUsernames:
            selectedUsers.value
                .split(
                    ","
                )
                .map(
                    value =>
                        value.trim()
                )
                .filter(
                    Boolean
                ),

        images:
            composerImages
    };

    publishPost.disabled =
        true;

    publishPost.textContent =
        editingPostId
            ? "Saving..."
            : "Publishing...";

    try {
        const url =
            editingPostId
                ? `${api}/community/forum/posts/${encodeURIComponent(
                    editingPostId
                )}`
                : `${api}/community/forum/posts`;

        const response =
            await fetch(
                url,
                {
                    method:
                        editingPostId
                            ? "PATCH"
                            : "POST",

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
                        JSON.stringify(
                            payload
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
            !response.ok
        ) {
            throw new Error(
                data.error ||
                "post_failed"
            );
        }

        const wasEditing =
            Boolean(
                editingPostId
            );

        resetComposer();

        await loadForum();

        showToast(
            wasEditing
                ? "Announcement updated."
                : "Announcement published."
        );
    } catch (
        err
    ) {
        showToast(
            formatApiError(
                err.message
            )
        );
    } finally {
        publishPost.disabled =
            false;

        if (
            !editingPostId
        ) {
            publishPost.textContent =
                "Publish announcement";
        }
    }
}

async function deletePost(
    postId
) {
    if (
        !confirm(
            "Delete this announcement?"
        )
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                `${api}/community/forum/posts/${encodeURIComponent(
                    postId
                )}`,
                {
                    method:
                        "DELETE",

                    headers:
                        authHeaders(),

                    credentials:
                        "include",

                    cache:
                        "no-store"
                }
            );

        if (
            !response.ok
        ) {
            throw new Error(
                "delete_failed"
            );
        }

        await loadForum();

        showToast(
            "Announcement deleted."
        );
    } catch {
        showToast(
            "Could not delete announcement."
        );
    }
}

async function addImages(
    files
) {
    for (
        const file
        of Array.from(
            files ||
            []
        )
    ) {
        if (
            composerImages.length >=
            4
        ) {
            showToast(
                "Maximum 4 images per post."
            );

            break;
        }

        if (
            !/^image\/(png|jpeg|gif|webp)$/i.test(
                file.type
            )
        ) {
            showToast(
                "Only PNG, JPEG, GIF and WebP images are supported."
            );

            continue;
        }

        if (
            file.size >
            2 *
            1024 *
            1024
        ) {
            showToast(
                "Each image must be 2 MB or smaller."
            );

            continue;
        }

        const dataUrl =
            await readFileAsDataUrl(
                file
            );

        composerImages.push({
            dataUrl,

            positionMode:
                "block",

            widthPercent:
                100
        });
    }

    renderComposerImages();
}

function renderComposerImages() {
    imageList.innerHTML =
        composerImages
            .map(
                (
                    image,
                    index
                ) => `
                    <div
                        class="imageItem"
                        data-index="${index}"
                    >
                        <img
                            src="${escapeHtml(
                                image.dataUrl
                            )}"
                            alt=""
                        >

                        <div class="imageOptions">
                            <select
                                class="imagePosition"
                                aria-label="Image position"
                            >
                                <option
                                    value="block"
                                    ${
                                        image.positionMode ===
                                        "block"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Full row
                                </option>

                                <option
                                    value="left"
                                    ${
                                        image.positionMode ===
                                        "left"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Left
                                </option>

                                <option
                                    value="center"
                                    ${
                                        image.positionMode ===
                                        "center"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Center
                                </option>

                                <option
                                    value="right"
                                    ${
                                        image.positionMode ===
                                        "right"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Right
                                </option>
                            </select>

                            <input
                                class="imageWidth"
                                type="number"
                                min="20"
                                max="100"
                                value="${Number(
                                    image.widthPercent ||
                                    100
                                )}"
                                title="Width %"
                            >
                        </div>

                        <button
                            class="iconBtn removeImage"
                            type="button"
                            title="Remove image"
                        >
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                `
            )
            .join(
                ""
            );

    imageList
        .querySelectorAll(
            ".imageItem"
        )
        .forEach(
            item => {
                const index =
                    Number(
                        item.dataset.index
                    );

                item
                    .querySelector(
                        ".imagePosition"
                    )
                    ?.addEventListener(
                        "change",
                        event => {
                            composerImages[
                                index
                            ].positionMode =
                                event.target.value;
                        }
                    );

                item
                    .querySelector(
                        ".imageWidth"
                    )
                    ?.addEventListener(
                        "change",
                        event => {
                            composerImages[
                                index
                            ].widthPercent =
                                Math.max(
                                    20,
                                    Math.min(
                                        100,
                                        Number(
                                            event.target.value ||
                                            100
                                        )
                                    )
                                );
                        }
                    );

                item
                    .querySelector(
                        ".removeImage"
                    )
                    ?.addEventListener(
                        "click",
                        () => {
                            composerImages.splice(
                                index,
                                1
                            );

                            renderComposerImages();
                        }
                    );
            }
        );

    refreshIcons();
}

function renderMarkdown(
    markdown
) {
    const source =
        String(
            markdown ||
            ""
        ).replace(
            /\r\n?/g,
            "\n"
        );

    const lines =
        source.split(
            "\n"
        );

    let html =
        "";

    let inCode =
        false;

    let listOpen =
        false;

    let codeBuffer =
        [];

    const closeList =
        () => {
            if (
                listOpen
            ) {
                html +=
                    "</ul>";

                listOpen =
                    false;
            }
        };

    for (
        const line
        of lines
    ) {
        if (
            line
                .trim()
                .startsWith(
                    "```"
                )
        ) {
            closeList();

            if (
                inCode
            ) {
                html += `
                    <pre><code>${escapeHtml(
                        codeBuffer.join(
                            "\n"
                        )
                    )}</code></pre>
                `;

                codeBuffer =
                    [];

                inCode =
                    false;
            } else {
                inCode =
                    true;
            }

            continue;
        }

        if (
            inCode
        ) {
            codeBuffer.push(
                line
            );

            continue;
        }

        const heading =
            line.match(
                /^(#{1,3})\s+(.+)$/
            );

        if (
            heading
        ) {
            closeList();

            const level =
                heading[1].length;

            html +=
                `<h${level}>${inlineMarkdown(
                    heading[2]
                )}</h${level}>`;

            continue;
        }

        const list =
            line.match(
                /^\s*[-*]\s+(.+)$/
            );

        if (
            list
        ) {
            if (
                !listOpen
            ) {
                html +=
                    "<ul>";

                listOpen =
                    true;
            }

            html +=
                `<li>${inlineMarkdown(
                    list[1]
                )}</li>`;

            continue;
        }

        closeList();

        if (
            !line.trim()
        ) {
            html +=
                "<br>";
        } else {
            html +=
                `<p>${inlineMarkdown(
                    line
                )}</p>`;
        }
    }

    closeList();

    if (
        inCode
    ) {
        html += `
            <pre><code>${escapeHtml(
                codeBuffer.join(
                    "\n"
                )
            )}</code></pre>
        `;
    }

    return html;
}

function inlineMarkdown(
    value
) {
    let text =
        escapeHtml(
            value
        );

    text =
        text.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );

    text =
        text.replace(
            /\*\*([^*]+)\*\*/g,
            "<strong>$1</strong>"
        );

    text =
        text.replace(
            /\*([^*]+)\*/g,
            "<em>$1</em>"
        );

    text =
        text.replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            (
                _match,
                label,
                url
            ) =>
                `<a href="${escapeHtml(
                    url
                )}" target="_blank" rel="noopener noreferrer">${label}</a>`
        );

    return text;
}

function commentModeLabel(
    mode
) {
    if (
        mode ===
        "nobody"
    ) {
        return "Comments off";
    }

    if (
        mode ===
        "selected"
    ) {
        return "Selected comments";
    }

    return "Comments open";
}

function formatApiError(
    error
) {
    const map = {
        invalid_post:
            "Complete the post fields.",

        invalid_image:
            "One image is invalid.",

        image_too_large:
            "One image is too large.",

        too_many_images:
            "Maximum 4 images per post.",

        forbidden:
            "Admin access required."
    };

    return map[
        error
    ] ||
    "Could not save announcement.";
}

function formatDateTime(
    value
) {
    const date =
        new Date(
            Number(
                value ||
                0
            )
        );

    if (
        !Number.isFinite(
            date.getTime()
        )
    ) {
        return "";
    }

    return date.toLocaleString(
        undefined,
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );
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

function readFileAsDataUrl(
    file
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            const reader =
                new FileReader();

            reader.onload =
                () =>
                    resolve(
                        String(
                            reader.result ||
                            ""
                        )
                    );

            reader.onerror =
                () =>
                    reject(
                        reader.error ||
                        new Error(
                            "file_read_failed"
                        )
                    );

            reader.readAsDataURL(
                file
            );
        }
    );
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

function refreshIcons() {
    if (
        window.lucide
    ) {
        lucide.createIcons();
    }
}

commentMode
    ?.addEventListener(
        "change",
        () => {
            selectedOnly.classList.toggle(
                "on",
                commentMode.value ===
                "selected"
            );
        }
    );

imageAdd
    ?.addEventListener(
        "click",
        () =>
            imageInput?.click()
    );

imageInput
    ?.addEventListener(
        "change",
        async () => {
            try {
                await addImages(
                    imageInput.files
                );
            } finally {
                imageInput.value =
                    "";
            }
        }
    );

publishPost
    ?.addEventListener(
        "click",
        savePost
    );

cancelEdit
    ?.addEventListener(
        "click",
        resetComposer
    );

refreshIcons();

loadForum();