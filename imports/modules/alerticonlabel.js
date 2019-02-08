var alertIcon = "data:image/png;base64,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";

export default alertIcon;