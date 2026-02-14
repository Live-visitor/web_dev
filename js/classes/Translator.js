class Translator {
    constructor() {
        this.translations = {};
    }

    addToHistory(modern, traditional) {
        const historyContainer = document.getElementById('translationHistory');
        if (!historyContainer) return;
        
        const newItem = document.createElement('div');
        newItem.className = 'history-item';
        newItem.innerHTML = `<div><strong>Modern:</strong> "${modern}" → <strong>Traditional:</strong> "${traditional}"</div>`;
        historyContainer.prepend(newItem);
    }

        async performTranslation() {
        const modernTextarea = document.getElementById('modernText');
        const traditionalTextarea = document.getElementById('traditionalText');
        if (!modernTextarea || !traditionalTextarea) return;

        const modernText = modernTextarea.value.trim();
        const traditionalText = traditionalTextarea.value.trim();

        // If both fields have content, prioritize translating from Modern → Traditional
        // (so users can re-translate without manually clearing the output field).
        const direction = modernText ? "to_traditional" : "to_modern";
        const inputText = modernText ? modernText : traditionalText;

        if (!inputText) return;

        const outputTextarea = (direction === "to_traditional") ? traditionalTextarea : modernTextarea;

        try {
            // Clear output before updating with the new translation
            outputTextarea.value = "";

            const response = await fetch('/api/translator/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText, direction })
            });

            const data = await response.json();

            if (data && data.ok) {
                outputTextarea.value = data.translation;

                if (direction === "to_traditional") {
                    this.addToHistory(inputText, data.translation);
                } else {
                    // direction === "to_modern"
                    this.addToHistory(data.translation, inputText);
                }
            }
        } catch (error) {
            console.error('Translation error:', error);
        }
    }

    swap(modeToggle) {
        const modernTextarea = document.getElementById('modernText');
        const traditionalTextarea = document.getElementById('traditionalText');
        if (!modernTextarea || !traditionalTextarea) return;

        const originalModernContent = modernTextarea.value;
        const originalTraditionalContent = traditionalTextarea.value;

        // Swap the content
        modernTextarea.value = originalTraditionalContent;
        traditionalTextarea.value = originalModernContent;

        // Toggle the mode if modeToggle is provided
        if (modeToggle && typeof modeToggle.toggle === 'function') {
            modeToggle.toggle();
        }

        // Clear one field based on which had content
        if (originalModernContent.trim() !== "" && originalTraditionalContent.trim() !== "") {
            // Both had content, keep the swap and clear nothing
            modernTextarea.value = originalTraditionalContent;
            traditionalTextarea.value = "";
        } else if (originalModernContent.trim() === "" && originalTraditionalContent.trim() !== "") {
            // Only traditional had content, it's now in modern field
            traditionalTextarea.value = "";
        } else if (originalModernContent.trim() !== "" && originalTraditionalContent.trim() === "") {
            // Only modern had content, it's now in traditional field
            modernTextarea.value = "";
        }
        
        // Perform translation after swap
        this.performTranslation();
    }
}

window.Translator = Translator;