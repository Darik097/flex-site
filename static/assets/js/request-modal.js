const requestModal = document.querySelector("[data-request-modal]");

if (requestModal) {
    const modalForm = requestModal.querySelector("[data-request-modal-form]");
    const modalStatus = requestModal.querySelector("[data-request-status]");
    const modalLead = requestModal.querySelector("[data-request-lead]");
    const productTitleField = modalForm?.querySelector('input[name="productTitle"]');
    const sourcePageField = modalForm?.querySelector('input[name="sourcePage"]');

    const formatPhoneValue = (value) => {
        const digits = value.replace(/\D/g, "");
        const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
        const trimmed = normalized.startsWith("7") ? normalized.slice(0, 11) : `7${normalized}`.slice(0, 11);
        const local = trimmed.slice(1);

        let result = "+7";

        if (local.length > 0) {
            result += ` (${local.slice(0, 3)}`;
        }

        if (local.length >= 4) {
            result += `) ${local.slice(3, 6)}`;
        }

        if (local.length >= 7) {
            result += `-${local.slice(6, 8)}`;
        }

        if (local.length >= 9) {
            result += `-${local.slice(8, 10)}`;
        }

        return result;
    };

    const bindPhoneInput = (input) => {
        if (!input) {
            return;
        }

        input.addEventListener("focus", () => {
            if (!input.value.trim()) {
                input.value = "+7";
            }
        });

        input.addEventListener("input", () => {
            input.value = formatPhoneValue(input.value);
        });

        input.addEventListener("blur", () => {
            if (input.value === "+7") {
                input.value = "";
            }
        });
    };

    document.querySelectorAll("[data-phone-input]").forEach(bindPhoneInput);
    const openModal = (trigger) => {
        if (!modalForm) {
            return;
        }

        const context = trigger?.dataset.requestTitle || document.title;
        const sourcePage = trigger?.dataset.requestSource || document.title;

        if (productTitleField) {
            productTitleField.value = context;
        }

        if (sourcePageField) {
            sourcePageField.value = sourcePage;
        }

        if (modalLead) {
            modalLead.textContent = `Оставьте контакты, и мы свяжемся с вами по запросу: ${context}.`;
        }

        modalStatus.textContent = "";
        modalStatus.classList.remove("is-error");
        requestModal.hidden = false;
        document.body.classList.add("is-modal-open");
    };

    const closeModal = () => {
        requestModal.hidden = true;
        document.body.classList.remove("is-modal-open");
    };

    document.querySelectorAll("[data-request-open]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            openModal(button);
        });
    });

    requestModal.querySelectorAll("[data-request-close]").forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !requestModal.hidden) {
            closeModal();
        }
    });

    const submitRequest = async (payload) => {
        const response = await fetch("/submit_request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...payload,
                timestamp: new Date().toLocaleString("ru-RU"),
            }),
        });

        const result = await response.json().catch(() => ({ result: false }));

        if (!response.ok || !result.result) {
            throw new Error(result.message || "Не удалось отправить заявку");
        }
    };

    const setSubmittingState = (form, isSubmitting) => {
        form.dataset.submitting = isSubmitting ? "true" : "false";

        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) {
            submitButton.disabled = isSubmitting;
            submitButton.setAttribute("aria-disabled", String(isSubmitting));
        }
    };

    const hasValidPhone = (value) => value.replace(/\D/g, "").length === 11;

    modalForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (modalForm.dataset.submitting === "true") {
            return;
        }

        const formData = new FormData(modalForm);
        const payload = Object.fromEntries(formData.entries());

        if (!hasValidPhone(String(payload.phone || ""))) {
            modalStatus.textContent = "Введите телефон полностью в формате +7 (___) ___-__-__.";
            modalStatus.classList.add("is-error");
            return;
        }

        setSubmittingState(modalForm, true);

        modalStatus.textContent = "Отправляем заявку...";
        modalStatus.classList.remove("is-error");

        try {
            await submitRequest(payload);
            modalStatus.textContent = "Заявка отправлена. Мы скоро свяжемся с вами.";
            modalForm.reset();

            setTimeout(() => {
                closeModal();
            }, 900);
        } catch (error) {
            modalStatus.textContent = error.message;
            modalStatus.classList.add("is-error");
        } finally {
            setSubmittingState(modalForm, false);
        }
    });

    document.querySelectorAll("[data-inline-request-form]").forEach((form) => {
        const statusNode = form.querySelector("[data-inline-request-status]");

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (form.dataset.submitting === "true") {
                return;
            }

            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            payload.formType = "inline";
            payload.sourcePage = form.dataset.requestSource || document.title;
            payload.productTitle = form.dataset.requestTitle || "Форма на странице";

            if (!hasValidPhone(String(payload.phone || ""))) {
                if (statusNode) {
                    statusNode.textContent = "Введите телефон полностью в формате +7 (___) ___-__-__.";
                    statusNode.classList.add("is-error");
                }
                return;
            }

            setSubmittingState(form, true);

            if (statusNode) {
                statusNode.textContent = "Отправляем заявку...";
                statusNode.classList.remove("is-error");
            }

            try {
                await submitRequest(payload);

                if (statusNode) {
                    statusNode.textContent = "Заявка отправлена. Мы скоро свяжемся с вами.";
                }

                form.reset();
            } catch (error) {
                if (statusNode) {
                    statusNode.textContent = error.message;
                    statusNode.classList.add("is-error");
                }
            } finally {
                setSubmittingState(form, false);
            }
        });
    });
}
